"use client";
import React, { useState } from "react";
import { useModal } from "@/app/_hook/useModal";
import { Modal } from "@/app/_components/reusable/Modal";
import Button from "@/app/_components/reusable/Button";
import Input from "@/app/_components/reusable/Input";
import Label from "@/app/_components/reusable/Label";
import { Plus, Loader2 } from "lucide-react"; // Loader icon
import { z } from "zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Zod schema
const roleSchema = z.object({
  name: z
    .string()
    .min(2, "Role Name is required")
    .max(20, "Role name must be at 20 characters"),
});

export default function AddRoleForm({ roleAddAction }) {
  const { isOpen, openModal, closeModal } = useModal();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // loader state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true); // start loader

      // Validate form data
      roleSchema.parse(formData);

      // Call action directly with state
      const result = await roleAddAction(formData);

      if (result?.success) {
        toast.success(result.message);
        setFormData({ name: "" });
        closeModal();
        router.refresh();
      } else {
        toast.error(result.message || "Failed to add role");
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
        Add Role
      </button>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add Role
            </h4>
          </div>

          <div className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div>
                <Label>Role Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} disabled={loading}>
                Close
              </Button>

              <Button size="sm" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add Role"
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
