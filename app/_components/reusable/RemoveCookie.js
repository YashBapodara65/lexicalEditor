"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function RemoveCookie() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Run only on client after first render
    if (!mounted) {
      setMounted(true);
      return;
    }

    fetch("/api/remove-token")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
        router.push("/login");
      })
      .catch((err) => {
        console.error("Failed to remove cookie:", err);
        toast.error("Failed to remove cookie");
        router.push("/login");
      });
  }, [mounted, router]);

  return null;
}
