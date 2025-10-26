"use client";

import React, { useEffect, useState } from "react";
import Input from "../reusable/Input";
import Label from "../reusable/Label";
import Button from "../reusable/Button";
import { EyeIcon, EyeOff, EyeOffIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// ----- Validation schema using Zod -----
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, { message: "At least one letter" })
      .regex(/[0-9]/, { message: "At least one number" }).max(20, "Password must be at most 20 characters"),
    confirmPassword: z.string().max(20, "Confirm password must be at most 20 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Error will be associated with confirmPassword field
  });

// ----- ResetPassword Component -----
export default function ResetPassword({ token, resetPasswordAction }) {
  // ----- Local state -----
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [errors, setErrors] = useState({}); // Form validation errors
  const [loading, setLoading] = useState(false); // Loader state for async action
    const [isValid, setIsValid] = useState(false);
  const router = useRouter(); // Next.js router

    // Run validation whenever formData changes
    useEffect(() => {
      const result = resetPasswordSchema.safeParse(formData);
      setIsValid(result.success);
    }, [formData]);

  // ----- Handle input change -----
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ----- Handle form submit -----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loader

    // Validate form data with Zod
    const result = resetPasswordSchema.safeParse(formData);

    if (!result.success) {
      // If validation fails, format errors for display
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
      const data = formData;

      // Extra safety check (redundant with Zod)
      if (data.password !== data.confirmPassword) {
        toast.error("Passwords do not match!");
        setLoading(false);
        return;
      }

      // ----- Call server action to reset password -----
      const res = await resetPasswordAction(data, token);

      if (res?.success) {
        toast.success(res.message || "Password updated successfully");
        router.push(`/login`); // Redirect to login page
      } else {
        toast.error(res.message || "Failed to reset password");
      }
    } catch (error) {
      // Catch unexpected errors
      toast.error("Something went wrong. Please try again.");
      console.error("Reset Password Error:", error);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">

      {/* Form Container */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          {/* Heading */}
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Reset Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your new password to update your account.
            </p>
          </div>

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Password Field */}
              <div>
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {/* Toggle show/hide password */}
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-white dark:fill-black dark:text-white" />
                    ) : (
                      <EyeOff className="fill-white dark:fill-black dark:text-white" />
                    )}
                  </span>
                </div>
                {/* Display password errors */}
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <Label>
                  Confirm Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {/* Toggle show/hide password */}
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-white dark:fill-black dark:text-white" />
                    ) : (
                      <EyeOffIcon className="fill-white dark:fill-black dark:text-white" />
                    )}
                  </span>
                </div>
                {/* Display confirm password errors */}
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  className="w-full flex justify-center items-center gap-2"
                  size="sm"
                  type="submit"
                  disabled={!isValid || loading}
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </div>
          </form>

          {/* Footer with login link */}
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Wait, I remember my password...
              <Link
                href="/login"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400 ml-1"
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
