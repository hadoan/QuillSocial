import { classNames } from "@quillsocial/lib";

export function Label(props: JSX.IntrinsicElements["label"]) {
  return (
    <label
      {...props} // Remove block HNH remove css label whitespace-nowrap
      className={classNames(
        "text-default text-emphasis mb-2  block text-sm whitespace-nowrap font-medium",
        props.className
      )}
    >
      {props.children}
    </label>
  );
}
