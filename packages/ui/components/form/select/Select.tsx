// @ts-ignore
import { Label } from "../inputs/Label";
import { getReactSelectProps } from "./selectTheme";
import cx from "@quillsocial/lib/classNames";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import { useId } from "@radix-ui/react-id";
import * as React from "react";
import type { GroupBase, Props, SingleValue, MultiValue } from "react-select";
import ReactSelect from "react-select";

export type SelectProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
> = Props<Option, IsMulti, Group> & { variant?: "default" | "checkbox" };

export const Select = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  components,
  menuPlacement,
  variant = "default",
  ...props
}: SelectProps<Option, IsMulti, Group>) => {
  const { classNames, ...restProps } = props;
  const reactSelectProps = React.useMemo(() => {
    return getReactSelectProps<Option, IsMulti, Group>({
      components: components || {},
      menuPlacement,
    });
  }, [components, menuPlacement]);

  // Annoyingly if we update styles here we have to update timezone select too
  // We cant create a generate function for this as we can't force state changes - onSelect styles dont change for example
  return (
    <ReactSelect
      {...reactSelectProps}
      classNames={{
        input: () => cx("text-emphasis", props.classNames?.input),
        // @ts-ignore
        option: (state) =>
          cx(
            "bg-default flex cursor-pointer justify-between py-2.5 px-3 rounded-none text-default ",
            state.isFocused && "bg-subtle",
            state.isDisabled && "bg-muted",
            state.isSelected && "bg-emphasis text-default",
            props.classNames?.option
          ),
        // @ts-ignore
        placeholder: (state) =>
          cx(
            "text-muted",
            state.isFocused && variant !== "checkbox" && "hidden"
          ),
        dropdownIndicator: () => "text-default",
        // @ts-ignore
        control: (state) =>
          cx(
            "bg-default border-default !min-h-9 h-9 text-sm leading-4 placeholder:text-sm placeholder:font-normal dark:focus:border-emphasis focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-default hover:border-emphasis rounded-md border",
            state.isMulti
              ? variant === "checkbox"
                ? "px-3 py-2 h-fit"
                : state.hasValue
                ? "p-1 h-fit"
                : "px-3 py-2 h-fit"
              : "py-1 px-3", //px-2 h-fit",
            props.isDisabled && "bg-subtle",
            props.classNames?.control
          ),
        singleValue: () =>
          cx(
            "text-emphasis placeholder:text-muted",
            props.classNames?.singleValue
          ),
        valueContainer: () =>
          cx(
            "text-emphasis placeholder:text-muted flex gap-1",
            props.classNames?.valueContainer
          ),
        multiValue: () =>
          cx(
            "bg-subtle text-default rounded-md py-1.5 px-2 flex items-center text-sm leading-none",
            props.classNames?.multiValue
          ),
        menu: () =>
          cx(
            "rounded-md bg-default text-sm leading-4 text-default mt-1 border border-subtle",
            props.classNames?.menu
          ),
        groupHeading: () =>
          "leading-none text-xs uppercase text-default pl-2.5 pt-4 pb-2",
        menuList: () =>
          cx(
            "scroll-bar scrollbar-track-w-20 rounded-md",
            props.classNames?.menuList
          ),
        // @ts-ignore
        indicatorsContainer: (state) =>
          cx(
            state.selectProps.menuIsOpen
              ? state.isMulti
                ? "[&>*:last-child]:rotate-180 [&>*:last-child]:transition-transform"
                : "rotate-180 transition-transform"
              : "text-default" // Woo it adds another SVG here on multi for some reason
          ),
        multiValueRemove: () => "text-default py-auto ml-2",
        ...classNames,
      }}
      {...restProps}
    />
  );
};

export const SelectField = function SelectField<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: {
    required?: boolean;
    name?: string;
    containerClassName?: string;
    label?: string;
    labelProps?: React.ComponentProps<typeof Label>;
    className?: string;
    error?: string;
  } & SelectProps<Option, IsMulti, Group>
) {
  const { t } = useLocale();
  const {
    label = t(props.name || ""),
    containerClassName,
    labelProps,
    className,
    ...passThrough
  } = props;
  const id = useId();
  return (
    <div className={cx(containerClassName)}>
      <div className={cx(className)}>
        {!!label && (
          <Label
            htmlFor={id}
            {...labelProps}
            className={cx(props.error && "text-error")}
          >
            {label}
          </Label>
        )}
      </div>
      <Select {...passThrough} />
    </div>
  );
};

/**
 * TODO: It should replace Select after through testing
 */
export function SelectWithValidation<
  Option extends { label: string; value: string },
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  required = false,
  onChange,
  value,
  ...remainingProps
}: SelectProps<Option, IsMulti, Group> & { required?: boolean }) {
  const [hiddenInputValue, _setHiddenInputValue] = React.useState(() => {
    if (value instanceof Array || !value) {
      return;
    }
    return value.value || "";
  });

  const setHiddenInputValue = React.useCallback(
    (value: MultiValue<Option> | SingleValue<Option>) => {
      let hiddenInputValue = "";
      if (value instanceof Array) {
        hiddenInputValue = value.map((val) => val.value).join(",");
      } else {
        hiddenInputValue = value?.value || "";
      }
      _setHiddenInputValue(hiddenInputValue);
    },
    []
  );

  React.useEffect(() => {
    if (!value) {
      return;
    }
    setHiddenInputValue(value);
  }, [value, setHiddenInputValue]);

  return (
    <div className={cx("relative", remainingProps.className)}>
      <Select
        value={value}
        {...remainingProps}
        // @ts-ignore
        onChange={(value, ...remainingArgs) => {
          setHiddenInputValue(value);
          if (onChange) {
            onChange(value, ...remainingArgs);
          }
        }}
      />
      {required && (
        <input
          tabIndex={-1}
          autoComplete="off"
          style={{
            opacity: 0,
            width: "100%",
            height: 1,
            position: "absolute",
          }}
          value={hiddenInputValue}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onChange={() => {}}
          // TODO:Not able to get focus to work
          // onFocus={() => selectRef.current?.focus()}
          required={required}
        />
      )}
    </div>
  );
}
