"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header style={styles.bar}>
      <div style={styles.left}>
        <Link href="/" style={styles.brand}>DonateNow</Link>
        <Link href="/register" style={styles.link}>Join</Link>
        <Link href="/donor" style={styles.link}>Donate</Link>
      </div>
      <nav style={styles.right}>
        {user ? (
          <>
            <span style={{ marginRight: 12, color: "#64748b" }}>
              {user.name} • {user.role}
            </span>
            {user.role === "DONOR" && <Link href="/donor" style={styles.link}>Dashboard</Link>}
            {user.role === "RECEIVER" && <Link href="/receiver" style={styles.link}>Dashboard</Link>}
            {user.role === "ADMIN" && <Link href="/admin" style={styles.link}>Admin</Link>}
            <button onClick={logout} style={styles.btn}>Logout</button>
          </>
        ) : (
          <Link href="/login" style={styles.link}>Login</Link>
        )}
      </nav>
    </header>
  );
}

const styles = {
  bar: { display:"flex", alignItems:"center", justifyContent:"space-between",
    padding:"12px 18px", borderBottom:"1px solid #e5e7eb", background:"#fff", position:"sticky", top:0, zIndex:10 },
  left: { display:"flex", alignItems:"center", gap:12 },
  right: { display:"flex", alignItems:"center", gap:12 },
  brand: { fontWeight:700, textDecoration:"none", color:"#0f172a", marginRight:8 },
  link: { textDecoration:"none", color:"#0f172a" },
  btn: { border:"1px solid #e5e7eb", background:"#f8fafc", padding:"6px 10px", borderRadius:8, cursor:"pointer" }
};