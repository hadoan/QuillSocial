import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import type { Options } from "@glidejs/glide";
import "@glidejs/glide/dist/css/glide.core.min.css";
import "@glidejs/glide/dist/css/glide.theme.min.css";
import type { ComponentProps, FC } from "react";
import { useRef } from "react";

import { ArrowLeft, ArrowRight } from "../icon";
import { SkeletonText } from "../skeleton";

const SliderButton: FC<ComponentProps<"button">> = (props) => {
  const { children, ...rest } = props;
  return (
    <button className="hover:bg-subtle text-default rounded p-2.5" {...rest}>
      {children}
    </button>
  );
};

export const Slider = <T extends string | unknown>({
  title = "",
  className = "",
  items,
  itemKey = (item) => `${item}`,
  renderItem,
}: {
  title?: string;
  className?: string;
  items: T[];
  itemKey?: (item: T) => string;
  renderItem?: (item: T) => JSX.Element;
  options?: Options;
}) => {
  const glide = useRef(null);
  const { isLocaleReady } = useLocale();
  return (
    <div className={`mb-2 ${className}`}>
      <div className="glide" ref={glide}>
        <div className="flex cursor-default items-center pb-3">
          {isLocaleReady ? (
            title && (
              <div>
                <h2 className="text-emphasis mt-0 text-base font-semibold leading-none">
                  {title}
                </h2>
              </div>
            )
          ) : (
            <SkeletonText className="h-4 w-24" />
          )}
          <div
            className="glide__arrows ml-auto flex items-center gap-x-1"
            data-glide-el="controls"
          >
            <SliderButton data-glide-dir="<">
              <ArrowLeft className="h-5 w-5" />
            </SliderButton>
            <SliderButton data-glide-dir=">">
              <ArrowRight className="h-5 w-5" />
            </SliderButton>
          </div>
        </div>
        <div className="glide__track" data-glide-el="track">
          <ul className="glide__slides">
            {items.map((item) => {
              if (typeof renderItem !== "function") return null;
              return (
                <li key={itemKey(item)} className="glide__slide h-auto pl-0">
                  {renderItem(item)}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
