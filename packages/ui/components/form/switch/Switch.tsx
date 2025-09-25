import { Tooltip } from "../../tooltip";
import cx from "@quillsocial/lib/classNames";
import { useId } from "@radix-ui/react-id";
import * as Label from "@radix-ui/react-label";
import * as PrimitiveSwitch from "@radix-ui/react-switch";
import React from "react";

const Wrapper = ({
  children,
  tooltip,
}: {
  tooltip?: string;
  children: React.ReactNode;
}) => {
  if (!tooltip) {
    return <>{children}</>;
  }
  return <Tooltip content={tooltip}>{children}</Tooltip>;
};
const Switch = (
  props: React.ComponentProps<typeof PrimitiveSwitch.Root> & {
    label?: string;
    fitToHeight?: boolean;
    disabled?: boolean;
    tooltip?: string;
    labelOnLeading?: boolean;
    classNames?: {
      container?: string;
      thumb?: string;
    };
  }
) => {
  const { label, fitToHeight, classNames, labelOnLeading, ...primitiveProps } =
    props;
  const id = useId();
  const isChecked = props.checked || props.defaultChecked;
  return (
    <Wrapper tooltip={props.tooltip}>
      <div
        className={cx(
          "flex h-auto w-auto flex-row items-center",
          fitToHeight && "h-fit",
          labelOnLeading && "flex-row-reverse",
          classNames?.container
        )}
      >
        <PrimitiveSwitch.Root
          className={cx(
            isChecked ? "bg-awst" : "bg-gray-200",
            primitiveProps.disabled && "cursor-not-allowed",
            " h-5 w-[34px] rounded-full shadow-none border-neutral-300 outline-none",
            props.className
          )}
          {...primitiveProps}
        >
          <PrimitiveSwitch.Thumb
            id={id}
            className={cx(
              "block h-[14px] w-[14px] rounded-full transition will-change-transform ltr:translate-x-[4px] rtl:-translate-x-[4px] ltr:[&[data-state='checked']]:translate-x-[17px] rtl:[&[data-state='checked']]:-translate-x-[17px]",
              isChecked ? "bg-white	 shadow-inner" : "bg-white",
              classNames?.thumb
            )}
          />
        </PrimitiveSwitch.Root>
        {label && (
          <Label.Root
            htmlFor={id}
            className={cx(
              "text-emphasis ms-2 align-text-top text-sm font-medium",
              primitiveProps.disabled
                ? "cursor-not-allowed opacity-25"
                : "cursor-pointer",
              labelOnLeading && "flex-1"
            )}
          >
            {label}
          </Label.Root>
        )}
      </div>
    </Wrapper>
  );
};

export default Switch;
