"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "./TableInfo";
import Button from "./Button";
import { Modal } from "./Modal";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SwitchToggle from "./SwitchToggle";
import ConfirmationModal from "./ConfirmationModal";
import { TriangleAlert, Loader2, Check, X } from "lucide-react"; // Added Loader2
import Input from "./Input";

export default function DynamicTable({
  data = [],
  actions = [],
  entityName = "",
  currentPage = 1,
  pageSize = 10,
  hiddenFields = ["id", "module_id", "role_id"],
  permissionKeys = [],
  statusToggleAction = null,
  className = "",
  checkboxEditable = true,
}) {
  const router = useRouter();

  const [tableData, setTableData] = useState(data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedRow, setSelectedRow] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false); // loader for update button

  // Delete confirmation modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmRow, setConfirmRow] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => setTableData(data), [data]);

  const columns =
    tableData.length > 0
      ? (() => {
          const allCols = Object.keys(tableData[0]).filter(
            (col) => !hiddenFields.includes(col)
          );
          const boolCols = allCols.filter(
            (col) => typeof tableData[0][col] === "boolean"
          );
          const otherCols = allCols.filter(
            (col) => typeof tableData[0][col] !== "boolean"
          );
          return [...otherCols, ...boolCols];
        })()
      : [];

  const handlePermissionToggle = (rowIndex, key) => {
    const updated = [...tableData];
    updated[rowIndex][key] = !updated[rowIndex][key];
    setTableData(updated);
  };

  const handleActionClick = async (action, row) => {
    if (action.label === "Update" && permissionKeys.length > 0) {
      setSelectedRow(row);
      const editableData = {};
      permissionKeys.forEach((key) => {
        editableData[key] = row[key];
      });
      setFormData(editableData);
      setIsModalOpen(true);
    } else if (action.label === "Delete") {
      setConfirmRow(row);
      setIsConfirmOpen(true);
    } else if (action.functionRef) {
      const result = await action.functionRef(row);
      if (result?.success) toast.success(result.message);
      else toast.error(result?.message);
      router.refresh();
    }
  };

  const handleModalChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedRow) return;
    try {
      setUpdateLoading(true); // start loader
      const updatedRow = { ...selectedRow, ...formData };
      const result = await actions
        .find((a) => a.label === "Update")
        ?.functionRef(updatedRow);

      if (result?.success) {
        toast.success(result.message || `${entityName} updated successfully`);
        setIsModalOpen(false);

        // Use server response to update row
        const serverData = result.data || updatedRow; // Make sure your API returns updated row
        setTableData((prev) =>
          prev.map((row) => (row.id === serverData.id ? serverData : row))
        );
      } else {
        toast.error(result.message || `Failed to update ${entityName}`);
      }
    } catch (err) {
      toast.error("Something went wrong.");
      console.error(err);
    } finally {
      setUpdateLoading(false); // stop loader
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmRow) return;
    try {
      setConfirmLoading(true);
      const deleteAction = actions.find((a) => a.label === "Delete");
      if (!deleteAction) throw new Error("Delete action not provided");
      let res = await deleteAction.functionRef(confirmRow);
      if (res) {
        if (res.success) {
          toast.success(res.message);
        } else {
          toast.success(res.message);
        }
      }
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    } finally {
      setIsConfirmOpen(false);
      setConfirmLoading(false);
    }
  };

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] ${className}`}
    >
      <div className="max-w-full overflow-x-auto">
        {tableData.length > 0 ? (
          <div className="min-w-[1102px] font-outfit text-sm">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                  >
                    SR NO.
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell
                      key={col}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                    >
                      {col.replace(/_/g, " ").toUpperCase()}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                    >
                      ACTIONS
                    </TableCell>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {tableData.map((row, rowIndex) => (
                  <TableRow key={row.id || rowIndex}>
                    <TableCell className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-center">
                      {rowIndex + 1 + (currentPage - 1) * pageSize}
                    </TableCell>

                    {columns.map((col) => (
                      <TableCell
                        key={col}
                        className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-center"
                      >
                        {col === "is_active" &&
                        typeof row[col] === "boolean" ? (
                          <SwitchToggle
                            checked={row[col]}
                            color="green"
                            onChange={() => statusToggleAction(row, col)}
                          />
                        ) : permissionKeys.includes(col) &&
                          typeof row[col] === "boolean" ? (
                          !checkboxEditable ? (
                            row[col] ? (
                              <span className="flex items-center justify-center">
                                <Check
                                  size={20}
                                  className="text-green-500 dark:text-green-400 dark:drop-shadow-[0_0_4px_rgba(34,197,94,0.6)] transition-transform duration-200 hover:scale-110"
                                />
                              </span>
                            ) : (
                              <span className="flex items-center justify-center">
                                <X
                                  size={20}
                                  className="text-red-500 dark:text-red-400 dark:drop-shadow-[0_0_4px_rgba(239,68,68,0.6)] transition-transform duration-200 hover:scale-110"
                                />
                              </span>
                            )
                          ) : (
                            <input
                              type="checkbox"
                              checked={row[col]}
                              // disabled={!checkboxEditable}
                              onChange={() =>
                                handlePermissionToggle(rowIndex, col)
                              }
                              className="w-4 h-4 cursor-pointer accent-indigo-600 disabled:accent-amber-400 dark:bg-gray-900"
                            />
                          )
                        ) : typeof row[col] === "boolean" ? (
                          <input
                            type="checkbox"
                            checked={row[col]}
                            readOnly
                            className="w-4 h-4 cursor-default accent-indigo-600"
                          />
                        ) : col === "created_at" || col === "updated_at" ? (
                          new Date(row[col]).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })
                        ) : (
                          row[col]
                        )}
                      </TableCell>
                    ))}

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
          <div className="px-4 py-3 text-center text-gray-500">
            No data available
          </div>
        )}
      </div>

      {/* Update Modal */}
      {isModalOpen && permissionKeys.length > 0 && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="max-w-[700px] m-4"
        >
          <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                {`Update ${entityName}`}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {permissionKeys.map((key) => {
                if (typeof formData[key] === "boolean") {
                  return (
                    <label
                      key={key}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData[key] === true}
                        onChange={() => handleModalChange(key, !formData[key])}
                        className="h-5 w-5 rounded-md border-gray-300 text-indigo-600 dark:border-gray-600 dark:bg-gray-900"
                      />
                      <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                        {key.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </label>
                  );
                }

                return (
                  <div key={key} className="col-span-2 flex flex-col gap-1 p-2">
                    <label className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                      {key.replace(/_/g, " ").toUpperCase()}
                    </label>
                    <Input
                      type="text"
                      value={formData[key] || ""}
                      onChange={(e) => handleModalChange(key, e.target.value)}
                      className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={updateLoading}>
                {updateLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isConfirmOpen && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          setIsOpen={setIsConfirmOpen}
          iconBackground="bg-red-100"
          icon={<TriangleAlert className="text-red-500" />}
          title={`Delete ${entityName}`}
          message={`Are you sure you want to delete ${
            confirmRow?.name || entityName
          }?`}
          confirmText="Yes, Delete"
          confirmClassName="bg-red-500 hover:bg-red-600"
          cancelText="Cancel"
          loading={confirmLoading}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
