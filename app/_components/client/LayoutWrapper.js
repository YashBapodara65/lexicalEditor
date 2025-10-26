"use client";

import { SidebarProvider, useSidebar } from "@/app/_context/SidebarContext";
import { usePathname } from "next/navigation";
import Backdrop from "@/app/_layout/Backdrop";
import SidebarClient from "./SidebarClient";
import HeaderClient from "./HeaderClient";

function LayoutWrapper({ children }) {
  const { isExpanded, isMobileOpen, isHovered } = useSidebar();
  const pathname = usePathname();

    const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  const authPaths = [
    "/login",
    "/signup",
    "/forgot-password",
    "/two-verification",
  ];

  const isAuthPage =
    authPaths.includes(pathname) ||
    pathname.startsWith("/login/") ||
    pathname.startsWith("/forgot-password/");

  if (isAuthPage) return children;

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <SidebarClient />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <HeaderClient />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function LayoutContent({ children }) {
  return (
    <SidebarProvider>
      <LayoutWrapper>{children}</LayoutWrapper>
    </SidebarProvider>
  );
}
