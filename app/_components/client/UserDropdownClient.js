"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/action";
import { toast } from "react-toastify";
import Image from "next/image";

export default function UserDropdownClient({ user, menuItems }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const toggleDropdown = () => setIsOpen((prev) => !prev);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center cursor-pointer dark:text-gray-400"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
         <Image
        src={user.avatar}
        alt={user.name}
        width={120}
        height={120}
        style={{ borderRadius: "50%" }}
      />
        </span>
        <span className="block mr-1 font-medium text-theme-sm">{user.name}</span>
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

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[260px] flex flex-col rounded-2xl border p-3 shadow-lg z-50">
          {/* User Info */}
          <div className="mb-3">
            <span className="block font-medium text-theme-sm">{user.name}</span>
            <span className="mt-0.5 block text-theme-xs">{user.email}</span>
          </div>

          {/* Menu Items */}
          <ul className="flex flex-col gap-1 pt-4 pb-3 border-b">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-start gap-3 px-3 py-2 font-medium rounded-lg group menu-item-text hover:bg-gray-100"
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Logout */}
          {user.signOut && (
            <button
              onClick={handleLogout}
              className="flex items-center cursor-pointer gap-3 px-3 py-2 mt-3 font-medium rounded-lg group menu-item-text hover:bg-gray-100"
            >
              {user.signOut.icon && <user.signOut.icon className="w-5 h-5" />}
              {user.signOut.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
