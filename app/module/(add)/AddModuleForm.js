"use client";
import React, { useState } from "react";
import { useModal } from "@/app/_hook/useModal";
import { Modal } from "@/app/_components/reusable/Modal";
import Button from "@/app/_components/reusable/Button";
import Input from "@/app/_components/reusable/Input";
import Label from "@/app/_components/reusable/Label";
import Checkbox from "@/app/_components/reusable/Checkbox";
import PermissionInput from "@/app/module/component/PermissionInput";
import { Plus, Loader2,X  } from "lucide-react";
import { z } from "zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Zod schema
const moduleSchema = z.object({
  module_url: z.string().min(2, "Module URL is required").max(50, "Module URL must be at most 50 characters"),
  module_name: z.string().min(2, "Module Name is required").max(50, "Module name must be at most 50 characters"),
});

export default function AddModuleForm({ moduleAddAction }) {
  const { isOpen, openModal, closeModal } = useModal();
  const router = useRouter();

  const [formData, setFormData] = useState({
    module_url: "",
    module_name: "",
    // is_delete: false,
    // is_write: false,
    // is_read: false,
    // is_reviewer: false,
    // is_update: false,
    // is_approver: false,
    permissions: [],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // loader state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true); // start loader
      
      moduleSchema.parse(formData);
      if (!formData.permissions || formData.permissions.length === 0) {
        toast.warning("Please add at least one permission");
        setLoading(false);
        return;
      }

      const result = await moduleAddAction(formData);

      if (result?.success) {
        toast.success(result.message);
        setFormData({
          module_url: "",
          module_name: "",
          // is_delete: false,
          // is_write: false,
          // is_read: false,
          // is_reviewer: false,
          // is_update: false,
          // is_approver: false,
          permissions: [],
        });
        closeModal();
        router.refresh();
      } else {
        toast.error(result.message || "Failed to add module");
      }

      setErrors({});
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {};
        err.issues.forEach((e) => {
          fieldErrors[e.path[0]] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        toast.error("Something went wrong.");
        console.error(err);
      }
    } finally {
      setLoading(false); // stop loader
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="flex w-auto items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex"
      >
        <Plus />
        Add Module
      </button>

      {isOpen &&<Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-6 overflow-y-auto bg-white rounded-3xl shadow-lg dark:bg-gray-900 lg:p-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add Module
            </h4>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <X />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-5">

            {/* Module Name */}
            <div>
              <Label>Module Name</Label>
              <Input
                type="text"
                name="module_name"
                value={formData.module_name}
                onChange={handleChange}
                placeholder="Enter module name"
              />
              {errors.module_name && (
                <p className="text-red-500 text-xs mt-1">{errors.module_name}</p>
              )}
            </div>

            {/* Module URL */}
            <div>
              <Label>Module URL</Label>
              <Input
                type="text"
                name="module_url"
                value={formData.module_url}
                onChange={handleChange}
                placeholder="Enter module URL"
              />
              {errors.module_url && (
                <p className="text-red-500 text-xs mt-1">{errors.module_url}</p>
              )}
            </div>

            {/* Module Permission */}
            <PermissionInput 
              permissions={formData.permissions} 
              setPermissions={(perms) => setFormData(prev => ({ ...prev, permissions: perms }))} 
            />


            {/* Permissions */}
            {/* <div className="grid grid-cols-3 gap-4">
              {["is_read", "is_write", "is_update", "is_delete", "is_reviewer", "is_approver"].map((perm) => (
                <Checkbox
                  key={perm}
                  id={perm}
                  name={perm}
                  label={perm.replace("is_", "").charAt(0).toUpperCase() + perm.replace("is_", "").slice(1)}
                  checked={formData[perm]}
                  onChange={(name, checked) => setFormData((prev) => ({ ...prev, [name]: checked }))}
                />
              ))}
            </div> */}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-8">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Close
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Module"}
            </Button>
          </div>
        </div>
      </Modal>}
    </>
  );
}
