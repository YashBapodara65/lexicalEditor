"use client";

import React, { useEffect, useState } from "react";
import Button from "@/app/_components/reusable/Button";
import Input from "@/app/_components/reusable/Input";
import Label from "@/app/_components/reusable/Label";
import { Modal } from "@/app/_components/reusable/Modal";
import {
  EyeIcon,
  EyeOff,
  Plus,
  Trash2,
  SquarePen,
  Info,
  SlidersHorizontal,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Loader2,
  House,
} from "lucide-react";
import { useModal } from "@/app/_hook/useModal";
import { z } from "zod";
import { toast } from "react-toastify";
import Select from "@/app/_components/reusable/Select";
import ConfirmationModal from "@/app/_components/reusable/ConfirmationModal";
import Radio from "@/app/_components/reusable/Radio";
import Link from "next/link";

// 1️⃣ Validation schema
const userSchema = z.object({
  display_name: z
    .string()
    .min(1, "User Name is required")
    .max(50, "Full name must be at most 50 characters"),
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
    .max(20, "Password cannot exceed 20 characters"),
  // user_role_id: z
  //   .number({
  //     required_error: "Role is required",
  //     invalid_type_error: "Role must be a number",
  //   })
  //   .min(1, "Role is required"),
  employee_code: z
    .string()
    .min(2, "Employee code is required")
    .max(10, "Employee code cannot exceed 10 characters"),

  is_active: z.boolean({
    required_error: "Active status is required",
    invalid_type_error: "Active status must be true or false",
  }),
});

export default function UserTable({
  usersData = [],
  // roles_data = [],
  addUserAction,
  // updateUserAction,
  // deleteUserAction,
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const [showPassword, setShowPassword] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    display_name: "",
    email: "",
    user_password: "",
    // user_role_id: "",
    employee_code: "",
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false); // loader state

  const [statusFilter, setStatusFilter] = useState(""); // "" | "true" | "false"
  const [roleFilter, setRoleFilter] = useState(""); // "" | role id
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" | "desc"

  // const [users, setUsers] = useState(usersData || []); // initialize with prop
  const [filteredUsers, setFilteredUsers] = useState(usersData || []);


  // // Sync users state if prop changes
  // useEffect(() => {
  //   if (usersData && usersData.length > 0) {
  //     const normalized = usersData.map((item) => ({
  //       id: item.user_id,
  //       employee_code: item.user?.employee_code || "-",
  //       display_name: item.user?.name || "-",
  //       email: item.user?.email || "-",
  //       role_name: item.role?.name || "-",
  //       is_active: item.user?.is_active ?? false,
  //     }));

  //     setUsers(normalized);
  //     setFilteredUsers(normalized);
  //   }
  // }, [usersData]);


  // Confirmation modal state
  // const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  // const [confirmData, setConfirmData] = useState({ row: null, col: null });
  // const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {


    const filtered = usersData?.filter((user) => {
      const matchesSearch =
        user.display_name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        !statusFilter ||
        statusFilter === "" ||
        (statusFilter === "true" && user.is_active) ||
        (statusFilter === "false" && !user.is_active);

      const matchesRole =
        !roleFilter ||
        roleFilter === "All Roles" ||
        String(user.role_name) === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const aName = a.display_name?.toLowerCase() || "";
      const bName = b.display_name?.toLowerCase() || "";
      if (sortOrder === "asc") return aName.localeCompare(bName);
      else return bName.localeCompare(aName);
    });

    setFilteredUsers(sorted);
    // usersData(sorted);
  }, [search, statusFilter, roleFilter, usersData, sortOrder]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const openAddModal = () => {
    setSelectedUser(null);
    setFormData({
      display_name: "",
      email: "",
      user_password: "",
      // user_role_id: "",
      employee_code: "",
      is_active: true,
    });
    openModal();
  };

  // console.log(formData, "formdataaaa")


  // const openUpdateModal = (user) => {
  //   setSelectedUser(user);
  //   setFormData({
  //     display_name: user.display_name || "",
  //     email: user.email || "",
  //     user_password: "",
  //     // user_role_id:
  //     //   Number(
  //     //     roles_data.find((item) => item.role_name === user.role_name)?.id
  //     //   ) || "",
  //     employee_code: user.employee_code || "",
  //     is_active: Boolean(user.is_active),
  //   });
  //   openModal();
  // };

  const handleSubmit = async () => {
    try {
      setLoading(true); // start loader

      if (!selectedUser) {
        const result = userSchema.safeParse(formData);
        if (!result.success) {
          const newErrors = {};
          result.error.issues.forEach((err) => {
            newErrors[err.path[0]] = err.message;
          });
          setErrors(newErrors);
          return;
        }
      }

      let res;

       const payload = {
          name: formData.display_name,
          email: formData.email,
          password: formData.user_password,
          employee_code: formData.employee_code,
          is_active: formData.is_active,
        };

        res = await addUserAction(payload);
      // if (selectedUser) {
      //   let payload = { id: selectedUser.id, ...formData };
      //   if (!formData.user_password) delete payload.user_password;
      //   res = await updateUserAction(payload);
      // } else {
      //   const payload = {
      //     name: formData.display_name,
      //     email: formData.email,
      //     password: formData.user_password,
      //     employee_code: formData.employee_code,
      //     is_active: formData.is_active,
      //   };

      //   res = await addUserAction(payload);

      // }


      console.log("API Response:", res);
      if (res?.success) toast.success(res.message);
      
      else toast.error(res?.message || "Something went wrong");

      closeModal();
    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
    } finally {
      setLoading(false); // stop loader
    }
  };

  // const handleDelete = async (user) => {
  //   if (!deleteUserAction) return;
  //   const res = await deleteUserAction(user);
  //   setIsConfirmOpen(false);
  //   if (res?.success) toast.success(res.message);
  //   else toast.error(res?.message || "Failed to delete user");
  // };

  // const actions = [
  //   {
  //     label: "Update",
  //     functionRef: openUpdateModal,
  //     icon: (
  //       <SquarePen
  //         size={18}
  //         className="text-blue-600 dark:text-gray-400 dark:hover:text-blue-600"
  //       />
  //     ),
  //   },
  //   {
  //     label: "Delete",
  //     functionRef: handleDelete,
  //     icon: (
  //       <Trash2
  //         size={18}
  //         className="text-red-600 dark:text-gray-400 dark:hover:text-red-600"
  //       />
  //     ),
  //   },
  // ];

  // const showConfirmModal = (row, col) => {
  //   setConfirmData({ row, col });
  //   setIsConfirmOpen(true);
  // };

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap gap-4 justify-between mb-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <Link
            href={"/"}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <House />
          </Link>
          <span className="text-gray-500">/</span>
          <h1 className="text-2xl text-black dark:text-gray-100 font-bold">
            Users List
          </h1>
        </div>

        {/* Add User */}
        <button
          onClick={openAddModal}
          className="flex items-center w-full sm:w-auto justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <Plus />
          Add User
        </button>
      </div>
      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end mb-4 flex-wrap gap-3 lg:gap-5">
        {/* Search */}
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search user..."
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            className="dark:bg-dark-900 h-11 w-full sm:w-64 rounded-lg border border-gray-200 bg-transparent pl-4 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>

        {/* Status Filter */}
        <Select
          options={[
            { id: "", is_active: "All Status" },
            { id: "true", is_active: "Active" },
            { id: "false", is_active: "Deactive" },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          valueKey="id"
          placeholder="Select Status"
          defaultValue={statusFilter}
          labelKey="is_active"
          className="w-full sm:w-40"
        />

        {/* Role Filter */}
        <Select
          // options={[{ id: "", role_name: "All Roles" }, ...roles_data]}
          value={roleFilter}
          onChange={setRoleFilter}
          defaultValue={roleFilter}
          placeholder="Select Role"
          valueKey="role_name"
          labelKey="role_name"
          className="w-full sm:w-40"
        />

        {/* Sort Order */}
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="flex items-center justify-center gap-1 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          {sortOrder === "asc" ? (
            <>
              <ArrowDownWideNarrow />
            </>
          ) : (
            <>
              <ArrowUpNarrowWide />
            </>
          )}
        </button>

        {/* Clear Filters */}
        {(search !== "" || statusFilter !== "" || roleFilter !== "") && (
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setRoleFilter("");
            }}
            className="flex items-center justify-center gap-1 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Clear Filters
          </button>
        )}
      </div>



      {/* <DynamicTable
        data={filteredUsers}
        entityName="User"
        actions={actions}
        statusToggleAction={(row, col) => showConfirmModal(row, col)}
      /> */}

      {/* Add/user Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 bg-white rounded-3xl dark:bg-gray-900 lg:p-11">
          <h4 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {selectedUser ? "Update User" : "Add User"}
          </h4>
          <div className="flex flex-col gap-4">
            <div>
              <Label>User Name</Label>
              <Input
                type="text"
                value={formData.display_name}
                onChange={(e) => handleChange("display_name", e.target.value)}
              />
              {errors.display_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.display_name}
                </p>
              )}
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {!selectedUser && (
              <div className="relative">
                <Label>Password</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.user_password}
                  onChange={(e) =>
                    handleChange("user_password", e.target.value)
                  }
                  className="pr-10"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 cursor-pointer text-gray-400 dark:text-gray-200"
                >
                  {showPassword ? (
                    <EyeIcon className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </span>
                {errors.user_password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.user_password}
                  </p>
                )}
              </div>
            )}

            <div>
              <Label>Employee Code</Label>
              <Input
                type="tel"
                value={formData.employee_code}
                onChange={(e) => handleChange("employee_code", e.target.value)}
              />
              {errors.employee_code && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.employee_code}
                </p>
              )}
            </div>

            {/* <div>
              <Label>Role</Label>
              <Select
                // options={roles_data}
                defaultValue={formData.user_role_id || ""}
                onChange={(value) => handleChange("user_role_id", value)}
                valueKey="id"
                labelKey="role_name"
                asNumber={true} // ✅ converts to number
              />

              {errors.user_role_id && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.user_role_id}
                </p>
              )}
            </div> */}
            {!selectedUser && (
              <div>
                <Label>User Status</Label>
                <div className="flex gap-4">
                  <Radio
                    name="is_active"
                    value="true"
                    checked={formData.is_active === true}
                    label="Active"
                    onChange={(val) =>
                      handleChange("is_active", val === "true")
                    }
                  />
                  <Radio
                    name="is_active"
                    value="false"
                    checked={formData.is_active === false}
                    label="Deactive"
                    onChange={(val) =>
                      handleChange("is_active", val === "true")
                    }
                  />
                </div>

                {errors.is_active && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.is_active}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Close
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : selectedUser ? (
                "Update User"
              ) : (
                "Add User"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      {/* {isConfirmOpen && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          iconBackground="bg-blue-100"
          icon={<Info className="text-blue-500" />}
          setIsOpen={setIsConfirmOpen}
          title="Confirm Status Change"
          message={`Are you sure you want to change status for ${confirmData.row?.display_name}?`}
          confirmText="Yes, change"
          confirmClassName="bg-blue-500 hover:bg-blue-600"
          cancelText="Cancel"
          loading={confirmLoading}
          onConfirm={async () => {
            if (!confirmData.row || !confirmData.col) return;

            try {
              setConfirmLoading(true);
              const updatedValue = !confirmData.row[confirmData.col];

              const res = await updateUserAction({
                id: confirmData.row.id,
                [confirmData.col]: updatedValue,
              });

              if (res?.success) {
                toast.success("Status updated");

                // ✅ update local users state so switch flips
                setUsers((prev) =>
                  prev.map((u) =>
                    u.id === confirmData.row.id
                      ? { ...u, [confirmData.col]: updatedValue }
                      : u
                  )
                );
              } else {
                toast.error(res?.message || "Failed to update status");
              }

              setIsConfirmOpen(false);
            } catch (err) {
              toast.error(err.message);
            } finally {
              setConfirmLoading(false);
            }
          }}
        />
      )} */}
    </>
  );
}
