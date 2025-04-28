export const CallToActionTable = (props: { children: React.ReactNode }) => (
  <table>
    <tbody>
      <tr>
        <td
          align="center"
          role="presentation"
          style={{
            border: "none",
            borderRadius: "3px",
            cursor: "auto",

            // @ts-ignore
            msoPaddingAlt: "10px 25px",
          }}
          valign="middle"
        >
          {props.children}
        </td>
      </tr>
    </tbody>
  </table>
);
