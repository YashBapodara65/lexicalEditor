"use client";
import { useState, useTransition } from "react";
import { toast } from "react-toastify";

export default function PermissionCheckbox({
  permissionId,
  moduleId,
  label,
  defaultChecked,
  toggleAction
}) {
  const [checked, setChecked] = useState(defaultChecked);
  const [isPending, startTransition] = useTransition();

  const handleChange = () => {
    const newValue = !checked;
    setChecked(newValue);

    startTransition(async () => {
      try {
        const res = await toggleAction(permissionId, newValue);

        if (res?.success) {
          toast.success(
          newValue
            ? `${label?.toLowerCase()} permission granted`
            : `${label?.toLowerCase()} permission removed`
          );
        } else {
          toast.error(res?.message || "Operation failed");
          setChecked(!newValue);
        }
      } catch (err) {
        console.error("Permission update failed:", err);
        toast.error("Something went wrong");
        setChecked(!newValue);
      }
    });
  };

  return (
    <label className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={isPending}
        className="w-4 h-4 cursor-pointer accent-indigo-600 disabled:accent-amber-400 dark:bg-gray-900"
      />
      <span className="hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer">{label}</span>
    </label>
  );
}
