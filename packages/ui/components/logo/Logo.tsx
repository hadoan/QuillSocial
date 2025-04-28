import classNames from "@quillsocial/lib/classNames";

export default function Logo({
  small,
  icon,
  inline = true,
  className,
}: {
  small?: boolean;
  icon?: boolean;
  inline?: boolean;
  className?: string;
}) {
  return (
    <h3 className={classNames("logo", inline && "inline", className)}>
      <strong>
        {icon ? (
          <img
            className="mx-auto w-9"
            alt="AWST"
            title="AWST"
            src="/api/logo?type=icon"
          />
        ) : (
          <img
            className={classNames(small ? "h-4 w-auto" : "h-8 w-auto", "")}
            alt="AWST"
            title="AWST"
            src="/img/logo.png"
          />
        )}
      </strong>
    </h3>
  );
}
