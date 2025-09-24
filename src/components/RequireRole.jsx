// "use client";

// import { useAuth } from "./AuthProvider";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// export default function RequireRole({ allow = [], children }) {
//   const { user } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!user) router.replace("/login");
//     else if (!allow.includes(user.role)) router.replace("/");
//   }, [user, router, allow]);

//   if (!user || !allow.includes(user?.role)) return null;
//   return children;
// }
"use client";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RequireRole({ allow, children }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) return; // wait until AuthProvider loads
    if (!user || !allow.includes(user.role)) {
      router.replace("/login");
    }
  }, [user, allow, router]);

  if (!user) return <p>Loading...</p>;

  return children;
}