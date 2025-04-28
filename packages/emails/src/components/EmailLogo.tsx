import { WEBAPP_URL } from "@quillsocial/lib/constants";

export const EmailLogo = () => {
  const image = `${WEBAPP_URL}/img/logo.png`;

  return (
    <a href={WEBAPP_URL} target="_blank" rel="noreferrer">
      <img
        height="48"
        src={image}
        style={{
          border: "0",
          display: "block",
          outline: "none",
          textDecoration: "none",
          marginBottom: "30px",
          marginLeft: "-30px",
        }}
        width="250"
        alt=""
      />
    </a>
  );
};
