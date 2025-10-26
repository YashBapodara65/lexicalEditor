"use client";
import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import Input from "../../_components/reusable/Input";
import Button from "@/app/_components/reusable/Button";
import Label from "@/app/_components/reusable/Label";

export default function PermissionInput({ permissions, setPermissions }) {
  const [permissionInput, setPermissionInput] = useState("");

   const handlePermissionChange = (e) => {
    const upper = e.target.value.toUpperCase();
    setPermissionInput(upper);
  };

  const handleAdd = () => {
    const perm = permissionInput.trim().toUpperCase();
    if (!perm) return toast.error("Permission cannot be empty");
    if (permissions.includes(perm))
      return toast.warning("Permission already exists");
    setPermissions([...permissions, perm]);
    setPermissionInput("");
  };

  const handleRemove = (perm) => {
    setPermissions(permissions.filter((p) => p !== perm));
  };

  return (
    <div>
      <div className="flex justify-between">
        <div className="w-[88%]">
          <Label>Module Permission</Label>
          <Input
            type="text"
            value={permissionInput}
            onChange={handlePermissionChange}
            placeholder="Enter module permission"
          />
        </div>
         <div className="w-[10%] flex items-end">
          <Button type="button" onClick={handleAdd}>
            <Plus size={16}/>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {permissions.map((perm, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-sm"
          >
            {perm}
            <button onClick={() => handleRemove(perm)}>
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
