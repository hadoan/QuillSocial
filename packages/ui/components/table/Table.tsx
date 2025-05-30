import { classNames } from "@quillsocial/lib";

interface TableProps {
  children: React.ReactNode;
}

interface DynamicWidth {
  widthClassNames?: string;
}

const Header = ({ children, widthClassNames }: TableProps & DynamicWidth) => (
  <thead className="rounded-md">
    <tr className="bg-default">{children}</tr>
  </thead>
);

const ColumnTitle = ({
  children,
  widthClassNames,
}: TableProps & DynamicWidth) => (
  <th
    scope="col"
    className={classNames(
      "text-default p-3 text-left text-xs font-medium uppercase",
      !widthClassNames ? "w-auto" : widthClassNames
    )}
  >
    {children}
  </th>
);

const Body = ({ children }: TableProps) => (
  <tbody className="divide-subtle divide-y rounded-md">{children}</tbody>
);

const Row = ({ children }: TableProps) => <tr>{children}</tr>;

const Cell = ({ children, widthClassNames }: TableProps & DynamicWidth) => (
  <td
    className={classNames(
      "text-default relative px-3 py-2 text-sm font-medium",
      !widthClassNames ? "w-auto" : widthClassNames
    )}
  >
    {children}
  </td>
);

export const Table = ({ children }: TableProps) => (
  <div className="bg-default border-subtle overflow-x-auto rounded-md border">
    <table className="divide-subtle w-full divide-y rounded-md">
      {children}
    </table>
  </div>
);

Table.Header = Header;
Table.ColumnTitle = ColumnTitle;
Table.Body = Body;
Table.Row = Row;
Table.Cell = Cell;
