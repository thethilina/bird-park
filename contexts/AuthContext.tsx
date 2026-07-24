"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext<any>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Sync to local storage wrapper
  const handleSetUser = (newUser: any) => {
    setUser(newUser);
    if (typeof window !== "undefined") {
      if (newUser) {
        localStorage.setItem("user_data", JSON.stringify(newUser));
      } else {
        localStorage.removeItem("user_data");
      }
    }
  };

  useEffect(() => {
    // 1. Sync from localStorage on mount (hydration safe)
    const hasLoggedInCookie = document.cookie
      .split(";")
      .some((item) => item.trim().startsWith("logged_in="));

    if (!hasLoggedInCookie) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("user_data");
      }
      setUser(null);
      setLoading(false);
    } else {
      const cached = localStorage.getItem("user_data");
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          localStorage.removeItem("user_data");
        }
      }
      setLoading(false);
    }

    // 2. Perform background revalidation
    const verifySession = async () => {
      try {
        const res = await fetch("/api/auth/me");

        if (res.ok) {
          const data = await res.json();
          handleSetUser(data.user);
        } else {
          // Token expired or invalid
          handleSetUser(null);
        }
      } catch {
        // Keep offline data on network issue
      }
    };

    if (hasLoggedInCookie) {
      verifySession();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser: handleSetUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () =>
  useContext(AuthContext);