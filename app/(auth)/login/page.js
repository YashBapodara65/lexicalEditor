import React from "react";
import SignInFormClient from "@/app/_components/client/SignInFormClient";
import { postData } from "@/app/_lib/api";
import TwoStepVerification from "@/app/_components/client/TwoStepVerification";
import { cookies } from "next/headers";

export default async function Login({ searchParams }) {
  const token = (await searchParams)?.token ?? null;

  async function loginAction(formData) {
    "use server";
    return await postData("/user/login", formData);
  }

  async function verifyOtpAction(otp, token) {
    "use server";
    const result = await postData("/user/verify", { otp, token });
    if (!result.success) return result;

    const cookieStore = await cookies();
    cookieStore.set({
      name: "token",
      value: result.data?.token,
      httpOnly: true,
      path: "/",
    });

    return result;
  }

  return token ? (
    <TwoStepVerification token={token} verifyOtpAction={verifyOtpAction} />
  ) : (
    <SignInFormClient loginAction={loginAction} />
  );
}
