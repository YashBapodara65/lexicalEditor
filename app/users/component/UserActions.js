"use client";

import { useState, useTransition } from "react";
import { SquarePen, Trash2, Loader2 , UserCheck} from "lucide-react";
import ConfirmationModal from "@/app/_components/reusable/ConfirmationModal";
import { Modal } from "@/app/_components/reusable/Modal";
import Button from "@/app/_components/reusable/Button";
import Input from "@/app/_components/reusable/Input";
import Label from "@/app/_components/reusable/Label";
import { toast } from "react-toastify";

export default function UserActions({
  usersData,
  updateUserAction,
  deleteUserAction,
  GetRoles,
  updateUserRoleAction
}) {
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setRoleIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(usersData || {});
  const [loading, setLoading] = useState(false);

  // console.log(formData,"formdataaa")
  // console.log(usersData,"usersssdataaa")
  // console.log(GetRoles,"Get rolesss")
  
  const handleModalChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const openEditModal = () => {
    setFormData(usersData);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    startTransition(async () => {
      setLoading(true);
      const updatedData = { ...usersData, ...formData };
      const result = await updateUserAction(updatedData);
      setLoading(false);
      if (result?.success) {
        toast.success(result?.message || "User updated successfully");
        setIsModalOpen(false);
      } else {
        toast.error(result?.message || "Failed to update user");
      }
    });
  };

  const handleRoleUpdate = async () => {
    if (!formData?.role_id) {
      toast.warning("Please select a role");
      return;
    }

    startTransition(async () => {
      setLoading(true);

      const user_id= usersData.id   
      const role_id= Number(formData.role_id)
      console.log(user_id,role_id ,"idddsssss")

      const result = await updateUserRoleAction({
      user_id,
      role_id
      });

      setLoading(false);

      if (result?.success) {
        toast.success(result?.message || "Role assigned successfully!");
        setRoleIsModalOpen(false);
        setFormData({ role_id: "" });
      } else {
        toast.error(result?.message || "Failed to assign role");
        console.log(result.message)
      }
    });
  };

  const handleDelete = async () => {
    startTransition(async () => {
      setLoading(true);
      const result = await deleteUserAction(usersData);
      setLoading(false);
      setIsConfirmOpen(false);
      if (!result?.success) {
        alert(result?.message || "Failed to delete user");
      }
    });
  };

  return (
    <>
      {/* ACTION BUTTONS */}
      <div className="flex justify-center gap-2">
        <button
          onClick={openEditModal}
          disabled={isPending}
          className="text-blue-600 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-600"
        >
          <SquarePen size={18} />
        </button>

        {/* <button
          onClick={() => setIsConfirmOpen(true)}
          disabled={isPending}
          className="text-red-600 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-600"
        >
          <Trash2 size={18} />
        </button> */}
        <button
          onClick={() => setRoleIsModalOpen(true)}
          disabled={isPending}
          className="text-red-600 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-600"
        >
          <UserCheck size={18} />
        </button>
      </div>

      {/* UPDATE MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-[600px]">
        <div className="relative w-full p-4 bg-white rounded-3xl dark:bg-gray-900 lg:p-8">
          <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
            Update User
          </h4>

          <div className="flex flex-col gap-4">
            <div>
              <Label>Name</Label>
              <Input
                type="text"
                value={formData?.name || ""}
                onChange={(e) => handleModalChange("name", e.target.value)}
                // onChange={(e) =>
                //   handleModalChange("user", {
                //     ...formData.user,
                //     name: e.target.value,
                //   })
                // }
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData?.email || ""}
                onChange={(e) => handleModalChange("email", e.target.value)}
                // onChange={(e) =>
                //   handleModalChange("user", {
                //     ...formData.user,
                //     email: e.target.value,
                //   })
                // }
              />
            </div>

            <div>
              <Label>Employee Code</Label>
              <Input
                type="text"
                value={formData?.employee_code || ""}
                onChange={(e) => handleModalChange("employee_code", e.target.value)}
                // onChange={(e) =>
                //   handleModalChange("user", {
                //     ...formData.user,
                //     employee_code: e.target.value,
                //   })
                // }
              />
            </div>


            {/* <div>
              <Label>Role</Label>
              <select
                className="border rounded-md w-full p-2"
                value={formData?.role?.name || ""}
                onChange={(e) =>
                  handleModalChange("user", {
                    ...formData.role.name,
                    name: e.target.value,
                  })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div> */}



            <div>
              <Label>Status</Label>
              <select
                className="border w-full border-gray-300 rounded-md bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                value={formData?.is_active ? "active" : "inactive"}
                // onChange={(e) =>
                //   handleModalChange("user", {
                //     ...formData.user,
                //     is_active: e.target.value === "active",
                //   })
                // }
                onChange={(e) =>
                  handleModalChange("is_active", e.target.value === "active")
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} size="sm" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION */}
      {/* {isConfirmOpen && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          setIsOpen={setIsConfirmOpen}
          title="Confirm Delete"
          message={`Are you sure you want to delete ${usersData?.user?.name}?`}
          confirmText="Yes, delete"
          confirmClassName="bg-red-500 hover:bg-red-600"
          cancelText="Cancel"
          onConfirm={handleDelete}
        />
      )} */}
      
      <Modal isOpen={isRoleModalOpen} onClose={() => setRoleIsModalOpen(false)} className="max-w-[600px]">
        <div className="relative w-full p-4 bg-white rounded-3xl dark:bg-gray-900 lg:p-8">
          <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
            Add User Role
          </h4>

          <div className="flex flex-col gap-4">

           <div>
            <Label>Role</Label>
            <select
              className="border w-full border-gray-300 rounded-md bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              value={formData?.role_id || ""}
              onChange={(e) => handleModalChange("role_id", e.target.value)}
            >
              <option value="">Select Role</option>
              {GetRoles?.data?.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                  {/* {role.id} */}
                </option>
              ))}
            </select>
          </div>

          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" size="sm" onClick={() => setRoleIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleUpdate} size="sm" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Role"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
