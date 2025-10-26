import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("token");

  if (tokenCookie) {
    cookieStore.delete("token"); // ✅ deletes HttpOnly cookie
    return Response.json(
      { success: true, message: "You have been logged out due to login from another device" },
      { status: 200 }
    );
  } else {
    // Cookie does not exist
    return Response.json(
      { success: false, message: "No token found to remove" },
      { status: 400 }
    );
  }
}
