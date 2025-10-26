import Link from "next/link";
import React from "react";

const Pagination = ({ currentPage, totalPages, baseUrl }) => {
  // Generate page numbers around current page
  const pagesAroundCurrent = [];
  for (let i = currentPage - 1; i <= currentPage + 1; i++) {
    if (i >= 1 && i <= totalPages) pagesAroundCurrent.push(i);
  }

  const buttonClasses = (active) =>
    `px-4 py-2 flex w-10 h-10 items-center justify-center rounded-lg text-sm font-medium ${
      active
        ? "bg-brand-500 text-white"
        : "text-gray-700 dark:text-gray-400 hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500"
    }`;

  const navClasses = (disabled) =>
    `flex items-center h-10 justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] ${
      disabled ? "pointer-events-none opacity-50" : ""
    }`;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {/* Previous */}
      <Link
        href={`${baseUrl}?page=${currentPage - 1}`}
        className={navClasses(currentPage === 1)}
      >
        Previous
      </Link>

      {/* Page Numbers */}
      {currentPage > 3 && <span className="px-2 dark:text-gray-100">...</span>}
      {pagesAroundCurrent.map((page) => (
        <Link
          key={page}
          href={`${baseUrl}?page=${page}`}
          className={buttonClasses(page === currentPage)}
        >
          {page}
        </Link>
      ))}
      {currentPage < totalPages - 2 && <span className="px-2 dark:text-gray-100">...</span>}

      {/* Next */}
      <Link
        href={`${baseUrl}?page=${currentPage + 1}`}
        className={navClasses(currentPage === totalPages)}
      >
        Next
      </Link>
    </div>
  );
};

export default Pagination;
