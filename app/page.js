import Image from "next/image";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";

export default async function Home() {
  // ✅ Await cookies()
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let decoded = null;
  if (token) {
    try {
      decoded = decodeJwt(token); // Decode only (no signature check)
    } catch (err) {
      decoded = { error: "Invalid JWT" };
    }
  }

  return (
     <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[60vh] p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="relative flex flex-col items-center justify-center min-h-[50vh] p-6 overflow-hidden z-1">
                {/* Simple background shape */}
                <div className="absolute inset-0 bg-dynamic" />
        
                <div className="relative z-10 mx-auto w-full max-w-[242px] text-center sm:max-w-[672px]">
                  <h1 className="mb-4 font-bold text-black dark:text-gray-100 text-title-md xl:text-title-xl">
                    Comming Soon
                  </h1>
                  <p className="mb-6 text-base dark:text-gray-400 sm:text-md">
                    We're working hard to bring you an amazing new portal. Stay tuned!
                  </p>
                </div>
              </div>
      </main>
    </div>
  );
}
