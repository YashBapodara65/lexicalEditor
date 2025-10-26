"use client"; // Required to use React hooks and client-side navigation

import React, { useEffect, useState } from "react";
import Input from "../reusable/Input"; // Reusable input component
import Label from "../reusable/Label"; // Reusable label component
import Button from "../reusable/Button"; // Reusable button component
import { ArrowLeft, Loader2 } from "lucide-react"; // Icons
import Link from "next/link"; // Link for navigation
import { z } from "zod"; // Validation library
import { toast } from "react-toastify"; // Toast notifications
import { useRouter } from "next/navigation"; // Router for navigation

// Validation schema for the email field
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Invalid email")
    .min(1, "Email is required")
    .max(50, "Email must be at most 50 characters"),
});

export default function ForgotPasswordClient({ forgotPasswordAction }) {
  // Form state
  const [formData, setFormData] = useState({
    email: "",
  });

  // Form errors state
  const [errors, setErrors] = useState({});

  // Loader state to indicate async action
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Next.js router for navigation
  const router = useRouter();

  // Run validation whenever formData changes
  useEffect(() => {
    const result = forgotPasswordSchema.safeParse(formData);
    setIsValid(result.success);
  }, [formData]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value, // Update corresponding field
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loader

    // Validate form data
    const result = forgotPasswordSchema.safeParse(formData);

    if (!result.success) {
      // Extract validation errors
      const formattedErrors = {};
      result.error.issues.forEach((err) => {
        formattedErrors[err.path[0]] = err.message;
      });
      setErrors(formattedErrors);
      setLoading(false); // Stop loader
      return;
    }

    setErrors({}); // Clear previous errors

    try {
      // Call server action to send reset link
      const res = await forgotPasswordAction(formData);

      if (res?.success) {
        // Show success toast
        toast.success(res.message);
        setFormData({
          email: "",
        });
        // Navigate to reset password page with token
        router.push(`/forgot-password?token=${res.data.resetToken}`);
      } else {
        // Show error toast
        toast.error(res.message);
      }
    } catch (error) {
      // Catch network or unexpected errors
      toast.error("Something went wrong. Please try again.");
      console.error("Forgot Password Error:", error);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          {/* Form title and description */}
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Forgot Your Password?
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter the email address linked to your account, and we’ll send you
              a link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Email field */}
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder="info@gmail.com"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Submit button */}
              <div>
                <Button
                  className="w-full flex justify-center items-center gap-2"
                  size="sm"
                  type="submit"
                  disabled={!isValid || loading}
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Wait, I remember my password...
              <Link
                href="/login"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Click here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
