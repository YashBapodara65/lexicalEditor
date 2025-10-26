"use client";
import React, { useState } from "react";
import { useModal } from "@/app/_hook/useModal";
import { Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import { Modal } from "@/app/_components/reusable/Modal";
import Input from "@/app/_components/reusable/Input";
import Label from "@/app/_components/reusable/Label";
import Button from "@/app/_components/reusable/Button";

export default function AddPermissionsUI({ moduleId, moduleAddPermissionAction }) {
  const { isOpen, openModal, closeModal } = useModal();
  const [permissionName, setPermissionName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!permissionName.trim()) return toast.warn("Permission cannot be empty");
    setLoading(true);
    try {
      const result = await moduleAddPermissionAction({ permission: permissionName.trim(), moduleId });

      if (result.success) {
        toast.success(result.message || "Permission added");
        setPermissionName(""); 
          closeModal();

      } else {
        toast.error(result.message || "Failed to add permission");
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button type="button" onClick={openModal}>
        <Plus size={16} />
      </Button>

      {isOpen && (
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
          <div className="relative w-full p-6 overflow-y-auto bg-white rounded-3xl shadow-lg dark:bg-gray-900 lg:p-10">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                Add Permission
              </h4>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X />
              </button>
            </div>

            <div className="flex justify-between">
              <div className="w-[85%]">
                <Label>Permission Name</Label>
                <Input
                  type="text"
                  value={permissionName}
                  onChange={(e) => setPermissionName(e.target.value.toUpperCase())}
                  placeholder="Enter permission"
                />
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={handleAdd} disabled={loading}>
                  {loading ? "Adding..." : <Plus size={16} />}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
