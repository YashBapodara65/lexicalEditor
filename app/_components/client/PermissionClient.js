"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AssignModuleTable from "@/app/role-management/AssignModuleTable";
import { Modal } from "../reusable/Modal";
import Button from "../reusable/Button";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Plus } from "lucide-react";
import Link from "next/link";

export default function PermissionClient({
  modulesList = [],
  rolePermissionList = [],
  permissionAddOrUpdateAction,
  permissionId,
}) {
  const permKeys = [
    "is_read",
    "is_write",
    "is_update",
    "is_delete",
    "is_approver",
    "is_reviewer",
  ];

  const router = useRouter();

  const [mainRows, setMainRows] = useState([]);
  const [modalRows, setModalRows] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  useEffect(() => {
    setMainRows(rolePermissionList || []);
  }, [rolePermissionList]);

  useEffect(() => {
    setModalRows(modulesList || []);
  }, [modulesList]);

  // Build table columns dynamically
  const buildColumns = (dataSample) => {
    if (!dataSample || dataSample.length === 0) return [];
    return Object.keys(dataSample[0]).map((key) => ({
      key,
      label: key,
    }));
  };

  // Save from modal
  const handleSaveModal = async () => {
    const selectedModules = modalRows.filter((m) =>
      permKeys.some((k) => m[k])
    );
    if (!selectedModules.length) {
      toast.error("Please select at least one permission.");
      return;
    }

    try {
      setLoadingSave(true);
      const res = await permissionAddOrUpdateAction(
        selectedModules,
        permissionId,
        rolePermissionList
      );

      if (res.success) {
        toast.success(res.message);
        setIsModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setLoadingSave(false);
    }
  };

  const handleUpdateMain = async () => {
    const filteredRows = mainRows.filter((row) =>
      permKeys.some((key) => row[key])
    );

    try {
      setLoadingUpdate(true);
      const res = await permissionAddOrUpdateAction(filteredRows, permissionId);

      if (res.success) {
        toast.success(res.message);
        router.refresh(); // fetch fresh data from server
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <div className="w-full p-4 space-y-6">
      <div className="bg-dynamic rounded-lg">
        <div className="flex flex-wrap gap-y-3 justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/role-management"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ChevronLeft />
            </Link>
            <h1 className="text-2xl text-black dark:text-gray-100 font-bold">
              Assigned Permissions List
            </h1>
          </div>

          <button
            className="flex w-auto items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus /> Assign Permissions
          </button>
        </div>
        <AssignModuleTable
          data={mainRows}
          columns={buildColumns(mainRows)}
          permissionKeys={permKeys}
          onPermissionChange={(rowIndex, key) => {
            const updated = [...mainRows];
            updated[rowIndex][key] = !updated[rowIndex][key];
            setMainRows(updated);
          }}
        />
        <div className="flex justify-end mt-4">
          <Button size="sm" onClick={handleUpdateMain} disabled={loadingUpdate}>
            {loadingUpdate ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Update Data"
            )}
          </Button>
        </div>
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="max-w-[900px] m-4"
        >
          <div className="relative w-full p-4 overflow-y-auto bg-white rounded-3xl dark:bg-gray-900 lg:p-11">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Assign Permissions
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Select permissions for modules below.
            </p>

            <AssignModuleTable
              data={modalRows}
              columns={buildColumns(modalRows)}
              permissionKeys={permKeys}
              onPermissionChange={(rowIndex, key) => {
                const updated = [...modalRows];
                updated[rowIndex][key] = !updated[rowIndex][key];
                setModalRows(updated);
              }}
            />

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveModal} disabled={loadingSave}>
                {loadingSave ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Permissions"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
