import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import LayoutContent from "../_components/client/LayoutWrapper";
import { AuthProvider } from "../_context/AuthContext";

export default async function ServerLayoutWrapper({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let user = null;
  if (token) {
    try {
      user = decodeJwt(token);
    } catch (err) {
      console.error("Invalid token:", err.message);
    }
  }

  return (
    <AuthProvider user={user || { display_name: "", role: "", email: "" }}>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}
