import classNames from "@quillsocial/lib/classNames";
import { useLocale } from "@quillsocial/lib/hooks/useLocale";
import type { SVGComponent } from "@quillsocial/types/SVGComponent";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ComponentProps } from "react";

import { Avatar } from "../../avatar";
import { SkeletonText } from "../../skeleton";

export type HorizontalTabItemProps = {
  name: string;
  disabled?: boolean;
  className?: string;
  href: string;
  linkProps?: Omit<ComponentProps<typeof Link>, "href">;
  icon?: SVGComponent;
  avatar?: string;
  number?: string;
};

const HorizontalTabItem = function ({ name, href, linkProps, avatar, number, ...props }: HorizontalTabItemProps) {
  const { t, isLocaleReady } = useLocale();
  const { asPath } = useRouter();

  // Using includes instead of === because of query params
  const isCurrent = asPath.includes(href);

  return (
    <Link
      key={name}
      href={href}
      {...linkProps}
      className={classNames(
        isCurrent ? "font-bold border-b-2 text-awst border-awst" : "font-bold text-[#717D96] hover:text-indigo-400 hover:text-sm hover:w-[80%] hover:border-black ",
        "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium leading-4 md:mb-0",
        props.disabled && "pointer-events-none !opacity-30",
        props.className
      )}
      aria-current={isCurrent ? "page" : undefined}>
      {props.icon && (

        //@ts-ignore
        <props.icon
          className={classNames(
            isCurrent ? "text-emphasis" : "group-hover:text-subtle text-muted",
            "-ml-0.5 hidden h-4 w-4 ltr:mr-2 rtl:ml-2 sm:inline-block"
          )}
          aria-hidden="true"
        />
      )}
      {isLocaleReady ? (
        <div className="flex items-center gap-x-2">
          {avatar && <Avatar size="sm" imageSrc={avatar} alt="avatar" />} {t(name)}
          { number && <span className="bg-awst h-5 w-5 text-center rounded text-white">{number}</span>}
        </div>
      ) : (
        <SkeletonText className="h-4 w-24" />
      )}
    </Link>
  );
};

export default HorizontalTabItem;
