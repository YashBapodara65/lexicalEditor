import ForgotPasswordFormClient from "@/app/_components/client/ForgotPasswordClient";
import ResetPassword from "@/app/_components/client/ResetPassword";
import { postData } from "@/app/_lib/api";

export default async function ForgotPasswordPage({ searchParams }) {
  const token = (await searchParams)?.token || null;

  async function forgotPasswordAction(formData) {
    "use server";
    return await postData("/user/forgotpassword", formData);
  }

  async function resetPasswordAction(data, resetToken) {
    "use server";
    return await postData("/user/resetpassword", {
      newPassword: data.password,
      resetToken,
    });
  }

  return token ? (
    <ResetPassword token={token} resetPasswordAction={resetPasswordAction} />
  ) : (
    <ForgotPasswordFormClient forgotPasswordAction={forgotPasswordAction} />
  );
}
