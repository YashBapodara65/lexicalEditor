import SignUpFormClient from "@/app/_components/client/SignUpFormClient";
import { postData } from "@/app/_lib/api";

export default function SignUpForm() {
  async function signupAction(formData) {
    "use server";
    const result = await postData("/user/register", formData);

    return result;
  }

  return (
    <SignUpFormClient signupAction={signupAction} />
  );
}
