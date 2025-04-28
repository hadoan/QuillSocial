export const EmailCallToAction = (props: { label: string; href: string; secondary?: boolean }) => {
  const { label, href, secondary } = props;

  return (
    <p
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: secondary ? "#FFFFFF" : "#5434D4",
        border: secondary ? "1px solid #d1d5db" : "",
        color: "#ffffff",
        fontFamily: "Roboto, Helvetica, sans-serif",
        fontSize: "0.875rem",
        fontWeight: 500,
        lineHeight: "1rem",
        margin: 0,
        textDecoration: "none",
        textTransform: "none",
        padding: "0 1rem",

        // @ts-ignore
        msoPaddingAlt: "0px",
        borderRadius: "6px",
        boxSizing: "border-box",
        height: "2.25rem",
      }}>
      <a
        style={{
          color: secondary ? "#5434D4" : "#FFFFFF",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "auto",
        }}
        href={href}
        target="_blank"
        rel="noreferrer">
        {label}
      </a>
    </p>
  );
};
