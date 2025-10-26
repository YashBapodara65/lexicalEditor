"use client";
import React, { useState } from "react";
import { useModal } from "@/app/_hook/useModal";
import { Modal } from "@/app/_components/reusable/Modal";
import Button from "@/app/_components/reusable/Button";
import Input from "@/app/_components/reusable/Input";
import Label from "@/app/_components/reusable/Label";
import { EyeIcon, EyeOff, Plus, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Zod schema
const organizationSchema = z.object({
  organization_name: z
    .string()
    .min(2, "Organization Name is required")
    .max(50, "Organization name must be at most 50 characters"),
  email: z
    .string()
    .email("Invalid email")
    .min(1, "Email is required")
    .max(50, "Email must be at most 50 characters"),
  user_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, { message: "At least one letter" })
    .regex(/[0-9]/, { message: "At least one number" })
    .max(20, "Password must be at most 20 characters"),
  employee_code: z
    .string()
    .min(1, "Employee Code is required")
    .max(10, "Employee code cannot exceed 10 digits"),
  display_name: z
    .string()
    .min(2, "Username is required")
    .max(50, "Full name must be at 50 characters"),
});

export default function AddOrganizationForm({ organizationAddAction }) {
  const { isOpen, openModal, closeModal } = useModal();
  const router = useRouter();

  const [formData, setFormData] = useState({
    organization_name: "",
    email: "",
    user_password: "",
    employee_code: "",
    display_name: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // loader state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true); // start loader

      // Validate form data
      organizationSchema.parse(formData);

      // Call action directly with state
      const result = await organizationAddAction(formData);

      if (result?.success) {
        toast.success(result.message);
        closeModal();
        router.refresh();
      } else {
        toast.error(result.message || "Failed to add organization");
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
        Add Organization
      </button>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add Organization
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Fill-up our form for organization.
            </p>
          </div>

          <div className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Organization Name</Label>
                  <Input
                    type="text"
                    name="organization_name"
                    value={formData.organization_name}
                    onChange={handleChange}
                  />
                  {errors.organization_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.organization_name}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="user_password"
                      placeholder="Enter your password"
                      value={formData.user_password}
                      onChange={handleChange}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-white dark:fill-black dark:text-white" />
                      ) : (
                        <EyeOff className="fill-white dark:fill-black dark:text-white" />
                      )}
                    </span>
                  </div>
                  {errors.user_password && (
                    <p className="mt-1 text-sm text-red-500">{errors.user_password}</p>
                  )}
                </div>

                <div>
                  <Label>Employee Code</Label>
                  <Input
                    type="text"
                    name="employee_code"
                    value={formData.employee_code}
                    onChange={handleChange}
                  />
                  {errors.employee_code && (
                    <p className="text-red-500 text-xs mt-1">{errors.employee_code}</p>
                  )}
                </div>

                <div>
                  <Label>Username</Label>
                  <Input
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleChange}
                  />
                  {errors.display_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.display_name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Organization"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
