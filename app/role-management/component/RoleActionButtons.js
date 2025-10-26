"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SquarePen, Trash2, KeySquare, TriangleAlert, Loader2 } from "lucide-react";
import ConfirmationModal from "@/app/_components/reusable/ConfirmationModal";
import { Modal } from "@/app/_components/reusable/Modal";
import Button from "@/app/_components/reusable/Button";
import Input from "@/app/_components/reusable/Input";

export default function RoleActionButtons({
  role,
  updateRoleAction,
  deleteRoleAction,
  permissionKeys = [],
}) {
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdate = () => {
    startTransition(async () => {
      const updated = { ...role, ...formData };
      await updateRoleAction(updated);
      setIsModalOpen(false);
    });
  };


  const handleDelete = () => {
    startTransition(async () => {
      await deleteRoleAction(role);
    });
  };


  const handleModalChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };



  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isPending}
        className="flex items-center gap-1 text-blue-600 hover:underline"
      >
        <SquarePen size={16} className="text-blue-600 dark:text-gray-400 dark:hover:text-blue-600" />
      </button>
      <button
        onClick={() => setIsConfirmOpen(true)}
        disabled={isPending}
        className="flex items-center gap-1 text-red-600 hover:underline"
      >
        <Trash2 size={16} className="text-red-600 dark:text-gray-400 dark:hover:text-red-600" />
      </button>




      {/* Update Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="max-w-[700px] m-4"
        >
          <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                {`Update ${role?.name}`}
              </h4>
            </div>

            <div className="flex flex-col gap-1 p-2">
              <label className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                Role Name
              </label>
              <Input
                type="text"
                value={formData.name ?? role.name ?? ""}
                onChange={(e) => handleModalChange("name", e.target.value)}
                className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleUpdate} disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {isConfirmOpen && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          setIsOpen={setIsConfirmOpen}
          iconBackground="bg-red-100"
          icon={<TriangleAlert className="text-red-500" />}
          title={`Delete ${role?.name}`}
          message={`Are you sure you want to delete ${role?.name
            }?`}
          confirmText="Yes, Delete"
          confirmClassName="bg-red-500 hover:bg-red-600"
          cancelText="Cancel"
          loading={isPending}
          onConfirm={handleDelete}
        />
      )}
      {/* <button
        onClick={handlePermission}
        disabled={isPending}
        className="flex items-center gap-1 text-green-600 hover:underline"
      >
        <KeySquare size={16} className="text-green-600 dark:text-gray-400 dark:hover:text-green-600"/>
      </button> */}


    </>
  );
}
