"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Dropdown } from "./Dropdown";
import { DropdownItem } from "./DropdownItem";
import { Info, LogOut, Settings, UserCircle } from "lucide-react";
import { logoutAction } from "@/app/action";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/_context/AuthContext";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const userData = useAuth();

  const router = useRouter();

  function toggleDropdown(e) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleLogout = async () => {
      const result = await logoutAction(); // server action
      if (result.success) {
        setIsOpen(false);
        toast.success(result.message);
        router.push("/login"); // redirect after logout
      } else if (result.message === "Unauthenticated!") {
        router.push("/login"); // redirect after logout
        toast.info("Your session expired. Please log in again.");
      } else {
        router.push("/login"); // redirect after logout
        toast.error(result.message);
      }
    };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <Image
            width={44}
            height={44}
            src="/images/user/owner.jpg"
            alt="User"
          />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">{userData.display_name || "Welcome User"}</span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {userData.display_name || ""}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {userData.email || "user@gmail.com"}
          </span>
        </div>

        {/* <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <UserCircle className="group-hover:fill-gray-200 dark:group-hover:fill-gray-700" />
              Edit profile
            </DropdownItem>
          </li>

          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <Settings className="group-hover:fill-gray-200 dark:group-hover:fill-gray-700" />
              Account Settings
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <Info className="group-hover:fill-gray-200 dark:group-hover:fill-gray-700" />
              Support
            </DropdownItem>
          </li>
        </ul> */}

        <button
          href="/signin"
              onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          <LogOut className="group-hover:fill-gray-200 dark:group-hover:fill-gray-700" />
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
