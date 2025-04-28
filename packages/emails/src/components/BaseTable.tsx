type BaseTableProps = Omit<
  React.DetailedHTMLProps<
    React.TableHTMLAttributes<HTMLTableElement>,
    HTMLTableElement
  >,
  "border"
> &
  Partial<Pick<HTMLTableElement, "align" | "border">>;

const BaseTable = ({ children, ...rest }: BaseTableProps) => (
  // @ts-ignore
  <table cellPadding="0" cellSpacing="0" role="presentation" {...rest}>
    {children}
  </table>
);

export default BaseTable;
