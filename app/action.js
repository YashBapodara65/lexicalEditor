"use server";

import { postData } from "./_lib/api";
import { cookies } from "next/headers";

export async function removeCookie() {
  const cookieStore = await cookies();

  // delete token cookie (works for HttpOnly too)
    cookieStore.set({
    name: "token",
    value: "",
    path: "/",
    httpOnly: true,
    expires: new Date(0), // expired immediately
  });

  // return a plain object only — no Response
  return { success: true, message: "You have been logged out due to login from another device" };
}

// logout handler
export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const result = await postData("/user/logout", {}, token);

  if(result.success)
  {
    cookieStore.set({
      name: "token",
      value: "",
      path: "/",
      expires: new Date(0),
    });
  }
  return result;
}