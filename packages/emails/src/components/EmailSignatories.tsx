type Person = {
  name?: string | null;
  email: string;
};

export const EmailSignatories = ({ signatories }: { signatories: Person[] }) => {
  return (
    <div style={{ lineHeight: "24px" }}>
      <p style={{ marginBottom: "5px" }}>
        <strong>Signers</strong>
      </p>
      {signatories.map((signatory, index) => (
        <div style={{ fontWeight: "400" }} key={index}>
          {signatory.name ? `${signatory.name} ` : ""}(
          <a style={{ color: "#5434D4" }} href={`mailto:${signatory.email}`}>
            {signatory.email}
          </a>
          )
        </div>
      ))}
    </div>
  );
};
