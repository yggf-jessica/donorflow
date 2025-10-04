"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";

// test comment
export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("DONOR");

  const submit = async (e) => {
    e.preventDefault();
    await login({ email, password, role });

    if (role === "DONOR") router.replace("/donor");
    else if (role === "RECEIVER") router.replace("/receiver");
    else router.replace("/admin");
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.left}>
          <h2>Welcome Back!</h2>
          <p>Your generosity makes a difference. Sign in to continue your journey of giving.</p>
        </div>
        <div style={styles.right}>
          <h3 style={{ marginBottom: 14 }}>Login</h3>
          <p style={{ marginBottom: 18, color: "#6b7280" }}>Please sign in to your account</p>
          <form onSubmit={submit}>
            <label style={styles.label}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} placeholder="Enter your email" required />
            <label style={styles.label}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} placeholder="Enter your password" required />
            <label style={styles.label}>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
              <option value="DONOR">Donor</option>
              <option value="RECEIVER">Receiver</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button type="submit" style={styles.primaryBtn}>Sign in</button>
          </form>
          <p style={{ marginTop: 18, textAlign: "center" }}>
            Don’t have an account?{" "}
            <Link href="/register" style={styles.link}>Create Account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

const styles = {
  page: { background: "#fefce8", minHeight: "calc(100vh - 58px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  container: { display: "flex", background: "#fff", borderRadius: 12, overflow: "hidden", maxWidth: 900, width: "100%", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
  left: { flex: 1, background: "#3f6212", color: "#fff", padding: 40 },
  right: { flex: 1, padding: 40 },
  label: { display: "block", marginTop: 12, marginBottom: 6, fontWeight: 600 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", marginBottom: 12 },
  primaryBtn: { width: "100%", padding: "12px", marginTop: 12, background: "#3f6212", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" },
  link: { color: "#3f6212", fontWeight: 500, textDecoration: "none" }
};
