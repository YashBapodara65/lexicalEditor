"use client";
import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../_components/reusable/TableInfo";

export default function AssignModuleTable({
  data = [],
  columns = [],
  permissionKeys = [], // checkbox fields
  actions = [],
  currentPage = 1,
  pageSize = 10,
  onPermissionChange = () => {},
  handleActionClick = () => {},
}) {
  // Split columns into normal fields and checkbox fields
  const normalColumns = columns.filter(
    (col) => !permissionKeys.includes(col.key) && col.key !== "module_id"
  );
  const checkboxColumns = columns.filter((col) =>
    permissionKeys.includes(col.key)
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        {data.length > 0 ? (
          <div className="min-w-[1102px] font-outfit text-sm">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-center"
                  >
                    SR NO.
                  </TableCell>

                  {normalColumns.map((col) => (
                    <TableCell
                      key={col.key}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-center"
                    >
                      {(col.label || col.key || "")
                        .replace(/_/g, " ")
                        .toUpperCase()}
                    </TableCell>
                  ))}

                  {checkboxColumns.map((col) => (
                    <TableCell
                      key={col.key}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-center"
                    >
                      {(col.label || col.key || "")
                        .replace(/_/g, " ")
                        .toUpperCase()}
                    </TableCell>
                  ))}

                  {actions.length > 0 && (
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-center"
                    >
                      ACTIONS
                    </TableCell>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {data.map((row, rowIndex) => (
                  <TableRow key={row.module_id || row.id || rowIndex}>
                    <TableCell className="px-4 py-3 text-center text-gray-500">
                      {rowIndex + 1 + (currentPage - 1) * pageSize}
                    </TableCell>

                    {/* Render normal fields */}
                    {normalColumns.map((col) => (
                      <TableCell
                        key={col.key}
                        className="px-4 py-3 text-center text-gray-500"
                      >
                        {col.key === "created_at" || col.key === "updated_at"
                          ? new Date(row[col.key]).toLocaleDateString()
                          : row[col.key]}
                      </TableCell>
                    ))}

                    {/* Render checkbox fields */}
                    {checkboxColumns.map((col) => (
                      <TableCell
                        key={col.key}
                        className="px-4 py-3 text-center text-gray-500"
                      >
                        <input
                          type="checkbox"
                          checked={row[col.key]}
                          onChange={() => onPermissionChange(rowIndex, col.key)}
                          className="w-4 h-4 cursor-pointer accent-indigo-600"
                        />
                      </TableCell>
                    ))}

                    {/* Actions */}
                    {actions.length > 0 && (
                      <TableCell className="px-4 py-3 text-center space-x-2">
                        {actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => handleActionClick(action, row)}
                          >
                            {action.icon || action.label}
                          </button>
                        ))}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div
            colSpan={
              normalColumns.length +
              checkboxColumns.length +
              1 +
              (actions.length > 0 ? 1 : 0)
            }
            className="px-4 py-3 text-center text-gray-500"
          >
            No data available
          </div>
        )}
      </div>
    </div>
  );
}
