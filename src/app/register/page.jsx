"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = useMemo(() => params.get("role") || "DONOR", [params]);

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // UI only
  const [working, setWorking] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "/api";

  const submit = async (e) => {
    e.preventDefault();
    setWorking(true);

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }), // password omitted
      });

      let json = {};
      try {
        json = await res.json();
      } catch (err) {
        console.error("Failed to parse JSON", err);
      }

      if (!res.ok) {
        alert(json.error || `Registration failed (${res.status})`);
        return;
      }

      // ✅ success
      alert(`Registered as ${role}. Proceed to login.`);
      router.replace("/login");
    } catch (err) {
      console.error("Registration error", err);
      alert("Network or server error");
    } finally {
      setWorking(false);
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.left}>
          <h2>Join Our Community</h2>
          <p>Create an account to start your journey of giving or fundraising.</p>
        </div>
        <div style={styles.right}>
          <h3 style={{ marginBottom: 14 }}>Register</h3>
          <form onSubmit={submit}>
            <label style={styles.label}>Full Name</label>
            <input
              value={name}
              onChange={(e)=>setName(e.target.value)}
              style={styles.input}
              placeholder="Your name"
              required
            />
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              style={styles.input}
              placeholder="Enter your email"
              required
            />
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              style={styles.input}
              placeholder="Create a password"
              required
            />
            <label style={styles.label}>Role</label>
            <select
              value={role}
              onChange={(e)=>setRole(e.target.value)}
              style={styles.input}
            >
              <option value="DONOR">Contributor (Donor)</option>
              <option value="RECEIVER">Fundraiser (Receiver)</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button type="submit" style={styles.primaryBtn} disabled={working}>
              {working ? "Creating..." : "Create Account"}
            </button>
          </form>
          <p style={{ marginTop: 18, textAlign: "center" }}>
            Already have an account?{" "}
            <Link href="/login" style={styles.link}>Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

const styles = {
  page:{ background:"#fefce8", minHeight:"calc(100vh - 58px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 },
  container:{ display:"flex", background:"#fff", borderRadius:12, overflow:"hidden", maxWidth:900, width:"100%", boxShadow:"0 4px 16px rgba(0,0,0,0.1)" },
  left:{ flex:1, background:"#3f6212", color:"#fff", padding:40 },
  right:{ flex:1, padding:40 },
  label:{ display:"block", marginTop:12, marginBottom:6, fontWeight:600 },
  input:{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid #d1d5db", marginBottom:12 },
  primaryBtn:{ width:"100%", padding:"12px", marginTop:12, background:"#3f6212", color:"#fff", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer" },
  link:{ color:"#3f6212", fontWeight:500, textDecoration:"none" }
};