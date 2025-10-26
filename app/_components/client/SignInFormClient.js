"use client";

import React, { useEffect, useState } from "react";
import Input from "../reusable/Input";
import Label from "../reusable/Label";
import Button from "../reusable/Button";
import { EyeIcon, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// ----- Zod schema for form validation -----
const signInSchema = z.object({
  email: z.string().email("Invalid email").min(1, "Email is required").max(50, "Email must be at most 50 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, { message: "At least one letter" })
    .regex(/[0-9]/, { message: "At least one number" }).max(20, "Password must be at most 20 characters"),
});

export default function SignInFormClient({loginAction}) {
  // ----- State -----
  const [showPassword, setShowPassword] = useState(false); // toggle password visibility
  const [formData, setFormData] = useState({ email: "", password: "" }); // form values
  const [errors, setErrors] = useState({}); // validation errors
  const [loading, setLoading] = useState(false); // loader for submit
const [isValid, setIsValid] = useState(false);
  const router = useRouter();

  // Run validation whenever formData changes
useEffect(() => {
  const result = signInSchema.safeParse(formData);
  setIsValid(result.success);
}, [formData]);

  // ----- Input change handler -----
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.type === "email" ? "email" : "password"]: e.target.value,
    });
  };

  // ----- Form submit handler -----
 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const result = signInSchema.safeParse(formData);
  if (!result.success) {
    const formattedErrors = {};
    result.error.issues.forEach((err) => {
      formattedErrors[err.path[0]] = err.message;
    });
    setErrors(formattedErrors);
    setLoading(false);
    return;
  }

  setErrors({});
  try {
    const res = await loginAction(formData);

    if (res?.success) {
      toast.success(res.message);
      setFormData({ email: "", password: "" });
      console.log("🚀 ~ handleSubmit ~ res:", res.data.otp)
      router.push(`/login?token=${res.data.token}`);
    } else {
      toast.error(res.message);
    }
  } catch (error) {
    toast.error("Something went wrong. Please try again.");
    console.error("Login Error:", error);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">

      {/* Sign In Form Section */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          {/* Header */}
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Email */}
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder="info@gmail.com"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
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
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {/* Toggle password visibility */}
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
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Forgot password?
                </Link>
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
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
