import { TableBorderCellNode } from "../nodes/TableBorderCellNode";

export function $createTableBorderCellNode(headerState = 0) {
  return new TableBorderCellNode(headerState);
}

