"use client";

import React, { useState } from "react";
import Input from "../reusable/Input";
import Label from "../reusable/Label";
import Button from "../reusable/Button";
import { ArrowLeft, EyeIcon, EyeClosedIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// ----- Zod schema for validation -----
const signInSchema = z.object({
  display_name: z
    .string()
    .min(2, "Full Name must be at least 2 characters")
    .max(50, "Full Name cannot exceed 50 characters"),
  email: z.string().email("Invalid email").min(1, "Email is required").max(50, "Email must be at most 50 characters"),
  user_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain letters")
    .regex(/[0-9]/, "Password must contain at least one number").max(20, "Password must be at most 20 characters"),
  employee_code: z
    .string()
    .regex(/^[0-9]+$/, "Employee code must be numbers only")
    .min(3, "Employee code must be at least 3 digits")
    .max(10, "Employee code cannot exceed 10 digits"),
});

export default function SignUpFormClient({ signupAction }) {
  // ----- State -----
  const [showPassword, setShowPassword] = useState(false); // toggle password visibility
  const [formData, setFormData] = useState({
    display_name: "",
    email: "",
    password: "",
    employee_code: "",
  });
  const [errors, setErrors] = useState({}); // validation errors
  const [loading, setLoading] = useState(false); // loader for submit
  const router = useRouter();

  // ----- Input change handler -----
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ----- Form submit handler -----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // start loader

    // Validate form data using Zod
    const result = signInSchema.safeParse({
      display_name: formData.display_name,
      email: formData.email,
      user_password: formData.password,
      employee_code: formData.employee_code,
    });

    if (!result.success) {
      // Set validation errors
      const formattedErrors = {};
      result.error.issues.forEach((err) => {
        formattedErrors[err.path[0]] = err.message;
      });
      setErrors(formattedErrors);
      setLoading(false); // stop loader
      return;
    }

    setErrors({}); // clear errors

    try {
      // Call signup action
      const res = await signupAction(formData);

      if (res?.success) {
        toast.success(res.message);
        router.push("/login"); // redirect to login
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Signup Error:", error);
    } finally {
      setLoading(false); // stop loader
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      {/* Back Link */}
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ArrowLeft />
          Back to dashboard
        </Link>
      </div>

      {/* Sign Up Form Section */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          {/* Header */}
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Create an account
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your details to sign up and get started
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <Label>
                  Full Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder="John Doe"
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                />
                {errors.display_name && (
                  <p className="mt-1 text-sm text-red-500">{errors.display_name}</p>
                )}
              </div>

              {/* Email */}
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

              {/* Employee Code */}
              <div>
                <Label>
                  Employee Code <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder="12345"
                  type="text"
                  name="employee_code"
                  value={formData.employee_code}
                  onChange={handleChange}
                />
                {errors.employee_code && (
                  <p className="mt-1 text-sm text-red-500">{errors.employee_code}</p>
                )}
              </div>

              {/* Password */}
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
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-white dark:fill-gray-400" />
                    ) : (
                      <EyeClosedIcon className="fill-white dark:fill-gray-400" />
                    )}
                  </span>
                </div>
                {errors.user_password && (
                  <p className="mt-1 text-sm text-red-500">{errors.user_password}</p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  className="w-full flex justify-center items-center gap-2"
                  size="sm"
                  type="submit"
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {loading ? "Signing up..." : "Sign up"}
                </Button>
              </div>
            </div>
          </form>

          {/* Footer with Login Link */}
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
