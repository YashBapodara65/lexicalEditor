"use client";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

export default function ConfirmationModal({
  isOpen = false,
  setIsOpen,
  icon,
  iconBackground="",
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Yes",
  cancelText = "Cancel",
  confirmClassName = "", // ✅ new prop
  onConfirm,
  loading = false,
}) {
  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen && setIsOpen(false)}
      className="relative z-99999"
    >
      <DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity" />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            
            {/* Modal Body */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className={`mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:mx-0 ${iconBackground !== "" ? iconBackground : "bg-red-100"}`}>
                  {icon}
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <DialogTitle className="text-base font-semibold text-gray-900">{title}</DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{message}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : confirmClassName !== "" ? confirmClassName : 'bg-red-600 hover:bg-red-500'
                }`} // ✅ merge additional classes
              >
                {loading ? 'Processing...' : confirmText}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen && setIsOpen(false)}
                disabled={loading}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                {cancelText}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

