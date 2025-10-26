"use client";
import React, { useState } from "react";
import ConfirmationModal from "@/app/_components/reusable/ConfirmationModal";
import { TriangleAlert, X } from "lucide-react";
import { toast } from "react-toastify";

export default function RemovePermissionsUI({ permissions, moduleDeleteAction }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPerm, setSelectedPerm] = useState(null);
  const [loading, setLoading] = useState(false);

  const permissionList = permissions?.data?.permissions || [];

  if (!Array.isArray(permissionList) || permissionList.length === 0) {
    return (
      <div className="text-gray-400 italic text-sm">
        No permissions available
      </div>
    );
  }

  const handleRemove = (perm) => {
    setSelectedPerm(perm);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPerm) return;
    setLoading(true);

    try {
      const result = await moduleDeleteAction({ id: selectedPerm.id });
      if (result.success) {
        toast.success(`Deleted Permission: ${selectedPerm.name}`);
      } else {
        toast.error(result.message || "Delete failed");
      }
    } catch (err) {
      console.error("Delete Error:", err);
    } finally {
      setLoading(false);
      setIsConfirmOpen(false);
    }
  };


  return (
    <>
      <div className="flex flex-wrap gap-2 justify-center">
        {permissionList.map((perm) => (
          <div
            key={perm.id}
            className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-sm"
          >
            {perm.name}
            <button onClick={() => handleRemove(perm)}>
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {isConfirmOpen && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          setIsOpen={setIsConfirmOpen}
          iconBackground="bg-red-100"
          icon={<TriangleAlert className="text-red-500" />}
          title="Delete Permission"
          message={`Are you sure you want to delete "${selectedPerm?.name}"?`}
          confirmText={loading ? "Deleting..." : "Yes, Delete"}
          confirmClassName="bg-red-500 hover:bg-red-600"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
}
