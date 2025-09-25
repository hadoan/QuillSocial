import EmailCommonDivider from "./EmailCommonDivider";
import Row from "./Row";
import {
  BASE_URL,
  WEBAPP_URL,
  IS_PRODUCTION,
} from "@quillsocial/lib/constants";
import type { CSSProperties } from "react";

export type BodyHeadType =
  | "checkCircle"
  | "xCircle"
  | "calendarCircle"
  | "teamCircle";

const EmailSchedulingBodyHeader = (props: {
  headerType: BodyHeadType;
  headStyles?: CSSProperties;
}) => {
  return (
    <>
      <EmailCommonDivider
        headStyles={{
          padding: "30px 30px 0 30px",
          borderTop: "1px solid #E1E1E1",
          ...props.headStyles,
        }}
      >
        <td
          align="center"
          style={{
            padding: "10px 25px",
            wordBreak: "break-word",
          }}
        >
          <Row
            border="0"
            role="presentation"
            style={{ borderCollapse: "collapse", borderSpacing: "0px" }}
          >
            <img
              style={{ height: "40px", width: "200px" }}
              src={WEBAPP_URL + "/img/logo.png"}
            ></img>
          </Row>
        </td>
      </EmailCommonDivider>
    </>
  );
};

export default EmailSchedulingBodyHeader;
