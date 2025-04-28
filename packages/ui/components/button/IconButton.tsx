import React from "react";
import Link from "next/link";
import { classNames } from "@quillsocial/lib";

export function IconButton(props: any) {
  const isLink = typeof props.href !== "undefined";
  const { color = "primary", icon, disabled, onClick } = props;
  const baseStyles = "disabled:text-gray-300";
  const primaryStyles = "text-awst hover:text-awst-dr";
  const secondaryStyles = "text-gray-700 hover:text-awst-dr";

  return isLink ? (
    <Link
      id={props.id}
      href={props.href}
      className={classNames(
        baseStyles,
        color === "primary" ? primaryStyles : secondaryStyles,
        props.className
      )}
      hidden={props.hidden}>
      {props.icon ? (
        <props.icon className="mr-1 inline h-6 text-inherit" aria-hidden="true"></props.icon>
      ) : (
        ""
      )}
      {props.children}
    </Link>
  ) : (
    <button
      id={props.id}
      className={classNames(
        baseStyles,
        color === "primary" ? primaryStyles : secondaryStyles,
        props.className
      )}
      onClick={props.onClick}
      disabled={props.disabled}
      hidden={props.hidden}>
      {props.icon ? (
        <props.icon className="mr-1 inline h-6 text-inherit" aria-hidden="true"></props.icon>
      ) : (
        ""
      )}
      {props.children}
    </button>
  );
}
