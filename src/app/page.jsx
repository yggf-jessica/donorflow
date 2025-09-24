"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [showModal, setShowModal] = useState(true);
  const router = useRouter();

  const go = (role) => router.push(`/register?role=${role}`);

  return (
    <main style={styles.hero}>
      <div style={styles.overlay}>
        <h1 style={styles.title}>Empowering Communities Through Giving</h1>
        <p style={styles.subtitle}>Join our mission to make a difference — as a donor or fundraiser.</p>
      </div>

      {showModal && (
        <div style={styles.modalWrap}>
          <div style={styles.modal}>
            <button onClick={() => setShowModal(false)} style={styles.close}>×</button>
            <h3 style={{ marginBottom: 18 }}>Join Our Community</h3>
            <button style={styles.primaryBtn} onClick={() => go("DONOR")}>✍ I want to contribute</button>
            <button style={styles.outlineBtn} onClick={() => go("RECEIVER")}>🤝 I want to fundraise</button>
            <p style={styles.footer}>Already have an account? <Link href="/login" style={styles.link}>Log in</Link></p>
          </div>
        </div>
      )}
    </main>
  );
}

const styles = {
  hero:{ height:"calc(100vh - 58px)", background:"url('https://picsum.photos/1200/800?blur=3') center/cover no-repeat",
    position:"relative", display:"flex", alignItems:"center", justifyContent:"center"},
  overlay:{ color:"#fff", textAlign:"center", padding:"0 20px" },
  title:{ fontSize:"2.2rem", fontWeight:"700" },
  subtitle:{ marginTop:12, fontSize:"1.2rem" },
  modalWrap:{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.4)"},
  modal:{ background:"#fefce8", padding:"24px 28px", borderRadius:12, maxWidth:360, width:"100%", textAlign:"center", position:"relative"},
  close:{ position:"absolute", top:8, right:12, border:"none", background:"transparent", fontSize:"1.4rem", cursor:"pointer"},
  primaryBtn:{ width:"100%", padding:"12px", margin:"10px 0", background:"#3f6212", color:"#fff", fontWeight:600, border:"none", borderRadius:8, cursor:"pointer"},
  outlineBtn:{ width:"100%", padding:"12px", margin:"10px 0", background:"#fff", border:"2px solid #3f6212", borderRadius:8, fontWeight:600, cursor:"pointer"},
  footer:{ marginTop:14, fontSize:"0.9rem" }, link:{ color:"#3f6212", fontWeight:600, textDecoration:"none" }
};