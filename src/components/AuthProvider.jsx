
// "use client";
// import { createContext, useContext, useEffect, useState } from "react";

// const AuthContext = createContext();

// export function useAuth() {
//   return useContext(AuthContext);
// }

// export default function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const saved = localStorage.getItem("user");
//     if (saved && saved !== "undefined") {
//       try {
//         setUser(JSON.parse(saved));
//       } catch (err) {
//         console.error("Failed to parse saved user:", err);
//         localStorage.removeItem("user");
//       }
//     }
//   }, []);

//   const login = (userData) => {
//     if (!userData) return;
//     setUser(userData);
//     localStorage.setItem("user", JSON.stringify(userData));
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem("user");
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Safely hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("user");
      if (saved && saved !== "undefined" && saved !== "null") {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") setUser(parsed);
      }
    } catch (e) {
      console.warn("AuthProvider: bad localStorage user, clearing.", e);
      localStorage.removeItem("user");
    }
  }, []);

  const login = async ({ email, password, role, name }) => {
    // hit your login (find-or-create) endpoint
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role, name }), // name optional; server will return stored name
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `Login failed (${res.status})`);

    // normalize the user object we keep in memory/localStorage
    const normalized = {
      id: data.id,            // server _id
      dbId: data.id,          // alias used elsewhere
      name: data.name || (data.email ? data.email.split("@")[0] : "User"),
      email: data.email,
      role: data.role,
      status: data.status,
      avatarUrl: data.avatarUrl || null,
    };

    setUser(normalized);
    localStorage.setItem("user", JSON.stringify(normalized));
    return normalized;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = { user, setUser, login, logout };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}