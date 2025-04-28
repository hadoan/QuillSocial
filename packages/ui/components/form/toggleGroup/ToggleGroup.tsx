import { classNames } from "@quillsocial/lib";
import { Tooltip } from "@quillsocial/ui";
import * as RadixToggleGroup from "@radix-ui/react-toggle-group";
import type { ReactNode } from "react";

interface ToggleGroupProps
  extends Omit<RadixToggleGroup.ToggleGroupSingleProps, "type"> {
  options: {
    value: string;
    label: string | ReactNode;
    disabled?: boolean;
    tooltip?: string;
    iconLeft?: ReactNode;
  }[];
  isFullWidth?: boolean;
}

const OptionalTooltipWrapper = ({
  children,
  tooltipText,
}: {
  children: ReactNode;
  tooltipText?: ReactNode;
}) => {
  if (tooltipText) {
    return (
      <Tooltip
        delayDuration={150}
        sideOffset={12}
        side="bottom"
        content={tooltipText}
      >
        {children}
      </Tooltip>
    );
  }
  return <>{children}</>;
};

export const ToggleGroup = ({
  options,
  onValueChange,
  isFullWidth,
  ...props
}: ToggleGroupProps) => {
  return (
    <>
      <RadixToggleGroup.Root
        type="single"
        {...props}
        onValueChange={onValueChange}
        className={classNames(
          "min-h-9 border-default relative inline-flex gap-0.5 rounded-md border p-1",
          props.className,
          isFullWidth && "w-full"
        )}
      >
        {options.map((option) => (
          <OptionalTooltipWrapper
            key={option.value}
            tooltipText={option.tooltip}
          >
            <RadixToggleGroup.Item
              disabled={option.disabled}
              value={option.value}
              className={classNames(
                "aria-checked:bg-awst aria-checked:text-white relative rounded-[4px] px-3 py-1 text-sm leading-tight transition-colors",
                option.disabled
                  ? "text-gray-400 hover:cursor-not-allowed bg-emphais"
                  : "hover:text-white hover:bg-awst bg-gray-200 text-awst",
                isFullWidth && "w-full"
              )}
            >
              <div className="item-center flex justify-center ">
                {option.iconLeft && (
                  <span className="mr-2 flex h-4 w-4 items-center">
                    {option.iconLeft}
                  </span>
                )}
                {option.label}
              </div>
            </RadixToggleGroup.Item>
          </OptionalTooltipWrapper>
        ))}
      </RadixToggleGroup.Root>
    </>
  );
};
