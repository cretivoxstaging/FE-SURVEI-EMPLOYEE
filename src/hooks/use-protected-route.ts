"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useProtectedRoute() {
  const router = useRouter();

  useEffect(() => {
    // Simple check: if user_email exists in localStorage
    const email = localStorage.getItem("user_email");

    if (!email) {
      router.push("/auth/login");
      return;
    }

  }, [router]);
}
