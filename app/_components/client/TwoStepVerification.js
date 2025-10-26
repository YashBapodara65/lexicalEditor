"use client";

import React, { useState, useRef, useEffect } from "react";
import Button from "../reusable/Button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function TwoStepVerification({ token, verifyOtpAction }) {
  const CODE_LENGTH = 6; // Number of digits in OTP

  // ----- State & Refs -----
  const [code, setCode] = useState(Array(CODE_LENGTH).fill("")); // OTP digits
  const inputsRef = useRef([]); // Refs for input fields
  const router = useRouter();
  const [loading, setLoading] = useState(false); // Loader for submission
  const [isValid, setIsValid] = useState(false);

  // ✅ Check if all fields are filled whenever code changes
  useEffect(() => {
    const filled = code.every((digit) => digit !== "");
    setIsValid(filled);
  }, [code]);

  // ----- Input Handlers -----
  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/, ""); // Only digits
    setCode((prev) => {
      const newCode = [...prev];
      newCode[index] = value;
      return newCode;
    });

    // Auto-focus next input if value entered
    if (value && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (e.target.value === "" && index > 0) {
        inputsRef.current[index - 1].focus();
      } else {
        setCode((prev) => {
          const newCode = [...prev];
          newCode[index] = "";
          return newCode;
        });
      }
    }
    if (e.key === "ArrowLeft" && index > 0)
      inputsRef.current[index - 1].focus();
    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1)
      inputsRef.current[index + 1].focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim();
    const digits = paste
      .split("")
      .filter((c) => /\d/.test(c))
      .slice(0, CODE_LENGTH);

    if (digits.length === 0) return;

    setCode((prev) => {
      const newCode = [...prev];
      digits.forEach((d, i) => (newCode[i] = d));
      return newCode;
    });

    const lastIndex = digits.length - 1;
    if (lastIndex < CODE_LENGTH) inputsRef.current[lastIndex].focus();
  };

  // ----- Submit Handler -----
  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");

    if (!isValid) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOtpAction(verificationCode, token);

      if (!result.success) toast.error(result.message);
      else {
        toast.success(result.message);
        setCode(Array(CODE_LENGTH).fill(""));
        router.push("/login");
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      {/* Back Link */}
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft />
          Back to Login
        </Link>
      </div>

      {/* Verification Form */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Two Step Verification
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              A verification code has been sent to your email&apos;ID. Please
              enter it in the field below.
            </p>
          </div>

          <h1 className="text-sm mb-2 text-gray-500 dark:text-gray-400 font-semibold">
            Type your 6 digits security code
          </h1>

          {/* OTP Input Fields */}
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-between mb-6">
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  value={digit}
                  onChange={(e) => handleChange(e, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  onPaste={handlePaste}
                  className="h-13 w-13 rounded-lg font-semibold text-center border appearance-none px-4 py-2.5 text-lg shadow-theme-xs placeholder:text-gray-400 border-gray-300 focus:outline-hidden focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              ))}
            </div>

            {/* Submit Button */}
            <Button
              className="w-full flex justify-center items-center gap-2"
              type="submit"
              size="sm"
              disabled={!isValid || loading}
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? "Verifying..." : "Verify My Account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
