import BaseTable from "./BaseTable";
import type { ComponentProps } from "react";

const Row = ({
  children,
  multiple = false,
  ...rest
}: { children: React.ReactNode; multiple?: boolean } & ComponentProps<
  typeof BaseTable
>) => (
  <BaseTable {...rest}>
    <tbody>{multiple ? children : <tr>{children}</tr>}</tbody>
  </BaseTable>
);

export default Row;
