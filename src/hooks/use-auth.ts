// hooks/use-auth.ts
"use client";
import { useState, useEffect } from "react";

type User = {
  email: string;
  isLoggedIn: boolean;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage and cookies on mount
    const email = localStorage.getItem("user_email");
    const isLoggedInCookie =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("isLoggedIn="))
        ?.split("=")[1] === "true";

    if (email && isLoggedInCookie) {
      setUser({ email, isLoggedIn: true });
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    // Hardcoded credentials for testing
    const authEmail = "surveycbn@cbn.com";
    const authPassword = "cretivoxogscondfe";


    // Check credentials
    if (email === authEmail && password === authPassword) {
      // Store in localStorage
      localStorage.setItem("user_email", email);

      // Set cookies for middleware
      document.cookie = `isLoggedIn=true; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
      document.cookie = `userEmail=${email}; path=/; max-age=${
        60 * 60 * 24 * 7
      }`; // 7 days

      setUser({ email, isLoggedIn: true });
      return true;
    }

    return false;
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("user_email");

    // Clear cookies
    document.cookie = "isLoggedIn=; path=/; max-age=0";
    document.cookie = "userEmail=; path=/; max-age=0";

    setUser(null);

    // Redirect to login
    window.location.href = "/auth/login";
  };

  return { user, login, logout, isLoading };
}
