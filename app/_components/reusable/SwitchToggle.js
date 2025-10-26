"use client";
import React, { useState, useEffect } from "react";

const SwitchToggle = ({
  label,
  checked,              // ✅ controlled prop
  defaultChecked = false,
  disabled = false,
  onChange,
  color = "blue",
}) => {
  // keep internal state only if "checked" is not passed
  const [isChecked, setIsChecked] = useState(defaultChecked);

  // sync with parent if controlled
  useEffect(() => {
    if (typeof checked === "boolean") {
      setIsChecked(checked);
    }
  }, [checked]);

  const handleToggle = () => {
    if (disabled) return;
    const newCheckedState = !isChecked;

    // update local state only if uncontrolled
    if (typeof checked !== "boolean") {
      setIsChecked(newCheckedState);
    }

    if (onChange) {
      onChange(newCheckedState);
    }
  };

  const switchColors = (() => {
    if (color === "blue") {
      return {
        background: isChecked
          ? "bg-brand-500"
          : "bg-gray-200 dark:bg-white/10",
        knob: "translate-x-" + (isChecked ? "full bg-white" : "0 bg-white"),
      };
    } else if (color === "gray") {
      return {
        background: isChecked
          ? "bg-gray-800 dark:bg-white/10"
          : "bg-gray-200 dark:bg-white/10",
        knob: "translate-x-" + (isChecked ? "full bg-white" : "0 bg-white"),
      };
    } else if (color === "green") {
      return {
        background: isChecked
          ? "bg-green-500 dark:bg-blue-500"
          : "bg-gray-200 dark:bg-gray-500",
        knob: "translate-x-" + (isChecked ? "full bg-white" : "0 bg-white"),
      };
    } else if (color === "red") {
      return {
        background: isChecked
          ? "bg-red-500 dark:bg-red-600"
          : "bg-gray-200 dark:bg-white/10",
        knob: "translate-x-" + (isChecked ? "full bg-white" : "0 bg-white"),
      };
    } else {
      return {
        background: isChecked
          ? "bg-blue-500 dark:bg-blue-600"
          : "bg-gray-200 dark:bg-white/10",
        knob: "translate-x-" + (isChecked ? "full bg-white" : "0 bg-white"),
      };
    }
  })();

  return (
    <label
      className={`flex cursor-pointer justify-center select-none items-center gap-3 text-sm font-medium ${
        disabled ? "text-gray-400" : "text-gray-700 dark:text-gray-400"
      }`}
      onClick={handleToggle}
    >
      <div className="relative">
        <div
          className={`block transition duration-150 ease-linear h-5 w-9 rounded-full ${
            disabled
              ? "bg-gray-100 pointer-events-none dark:bg-gray-800"
              : switchColors.background
          }`}
        ></div>
       <div
  className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full shadow-theme-sm duration-150 ease-linear transform ${
    isChecked ? "translate-x-4 bg-white" : "translate-x-0 bg-white"
  }`}></div>
      </div>
      {label}
    </label>
  );
};

export default SwitchToggle;
