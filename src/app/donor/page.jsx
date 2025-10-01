"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../components/AuthProvider";

const GREEN = "#3f6212";
const BG = "#fefce8";
const BORDER = "#e5e7eb";
const TEXT_MUTED = "#64748b";

export default function DonorPage() {
  const { user, setUser } = useAuth();
  const API = process.env.NEXT_PUBLIC_API_URL || "/api";
  const donorId = user?.dbId || user?.id;

  /* ---------- campaigns ---------- */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCampaigns = async () => {
    setLoading(true);
    const res = await fetch(`${API}/campaigns`);
    const json = await res.json();
    // ✅ Only show approved campaigns
    const campaigns = Array.isArray(json.campaigns) ? json.campaigns : [];
    setItems(campaigns.filter(c => c.status === "APPROVED"));
    setLoading(false);
  };
  useEffect(() => { loadCampaigns(); }, [API]);

  const featured = useMemo(() => {
    if (!items.length) return null;
    return items.find(c => c.images?.[0]) || items[0];
  }, [items]);

  const cards = useMemo(() => {
    if (!items.length) return [];
    const fid = featured?._id;
    return items.filter(c => c._id !== fid);
  }, [items, featured]);

  /* ---------- tabs / history ---------- */
  const [tab, setTab] = useState("discover");
  const [history, setHistory] = useState([]);
  const [hLoading, setHLoading] = useState(false);

  const loadHistory = async () => {
    if (!donorId) return setHistory([]);
    setHLoading(true);
    const res = await fetch(`${API}/donations?donorId=${donorId}`);
    const json = await res.json();
    setHistory(Array.isArray(json.donations) ? json.donations : []);
    setHLoading(false);
  };
  useEffect(() => { if (tab === "history") loadHistory(); }, [tab]); 

  /* ---------- donation modal ---------- */
  const [active, setActive] = useState(null); 
  const [amount, setAmount] = useState(100);
  const [step, setStep] = useState(1); 
  const [working, setWorking] = useState(false);

  const openDonate = (c) => { setActive(c); setAmount(100); setStep(1); };
  const confirmDonate = async () => {
    try {
      setWorking(true);
      const res = await fetch(`${API}/campaigns/${active._id}/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), donorId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to donate");
      await loadCampaigns();
      if (tab === "history") loadHistory();
      setActive(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setWorking(false);
    }
  };

  /* ---------- profile ---------- */
  const [pName, setPName] = useState(user?.name || "");
  const [pEmail, setPEmail] = useState(user?.email || "");
  const [pAvatar, setPAvatar] = useState(user?.avatarUrl || "");
  const saveProfile = async () => {
    if (!donorId) return;
    const res = await fetch(`${API}/users/${donorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: pName, email: pEmail, avatarUrl: pAvatar }),
    });
    const json = await res.json();
    if (res.ok) {
      setUser?.((prev) => ({ ...prev, ...json.user, id: prev.id, dbId: prev.dbId }));
      alert("Profile updated");
    } else {
      alert(json.error || "Failed to update profile");
    }
  };

  return (
    <main style={{ background: BG, minHeight: "calc(100vh - 58px)" }}>
      <div style={styles.container}>
        {/* Top bar w/ tabs */}
        <div style={styles.topBar}>
          <div style={{ display: "flex", gap: 8 }}>
            <TabBtn active={tab === "discover"} onClick={() => setTab("discover")}>Discover</TabBtn>
            <TabBtn active={tab === "history"} onClick={() => setTab("history")}>History</TabBtn>
            <TabBtn
              active={tab === "profile"}
              onClick={() => { setPName(user?.name||""); setPEmail(user?.email||""); setPAvatar(user?.avatarUrl||""); setTab("profile"); }}
            >
              Profile
            </TabBtn>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: TEXT_MUTED }}>Welcome,&nbsp;</span>
            <strong>{user?.name || user?.email || "Guest"}</strong>
            <button
              style={styles.donateTop}
              disabled={!featured}
              onClick={() => featured && openDonate(featured)}
            >
              Donate
            </button>
          </div>
        </div>

        {/* DISCOVER */}
        {tab === "discover" && (
          <>
            <Hero
              featured={featured}
              onSupport={() => featured && openDonate(featured)}
            />
            <ListGrid loading={loading} cards={cards} onDonate={openDonate} />
          </>
        )}

        {/* HISTORY */}
        {tab === "history" && (
          <HistorySection loading={hLoading} items={history} />
        )}

        {/* PROFILE */}
        {tab === "profile" && (
          <div style={styles.profilePanel}>
            <h3 style={{ marginTop: 0 }}>Edit Profile</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={styles.label}>Name</label>
                <input style={styles.input} value={pName} onChange={(e)=>setPName(e.target.value)} />
              </div>
              <div>
                <label style={styles.label}>Email</label>
                <input style={styles.input} value={pEmail} onChange={(e)=>setPEmail(e.target.value)} />
              </div>
              <div style={{ gridColumn: "1 / span 2" }}>
                <label style={styles.label}>Avatar URL</label>
                <input style={styles.input} value={pAvatar} onChange={(e)=>setPAvatar(e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button onClick={saveProfile} style={styles.primaryBtn}>Save Changes</button>
            </div>
          </div>
        )}
      </div>

      {/* Donation modal */}
      {active && (
        <Modal onClose={() => setActive(null)}>
          {step === 1 ? (
            <AmountStep
              title="Support this campaign"
              amount={amount}
              setAmount={setAmount}
              onCancel={() => setActive(null)}
              onContinue={() => setStep(2)}
            />
          ) : (
            <ConfirmStep
              title={`Are you sure you want to contribute ฿${Number(amount)} to ${active.title}?`}
              working={working}
              onCancel={() => setActive(null)}
              onConfirm={confirmDonate}
            />
          )}
        </Modal>
      )}
    </main>
  );
}

/* ================= components ================= */

function Hero({ featured, onSupport }) {
  return (
    <div style={styles.heroWrap}>
      <div style={styles.heroLeft}>
        <div style={styles.featuredBadge}>Featured Campaign</div>
        <h1 style={styles.heroTitle}>{featured?.title || "No campaign yet"}</h1>
        <p style={{ color: "#e2e8f0", marginTop: 6 }}>
          {featured?.description || "New campaigns from our community will appear here."}
        </p>
        <HeroProgress raised={featured?.raisedAmount || 0} goal={featured?.goalAmount || 0} />
        <button style={styles.supportBtn} disabled={!featured} onClick={onSupport}>
          Support This Campaign
        </button>
      </div>
      <div style={styles.heroRight}>
        <img
          src={featured?.images?.[0] || "https://placehold.co/900x560?text=No+Image"}
          alt={featured?.title || "Featured"}
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 14 }}
          onError={(e) => (e.currentTarget.src = "https://placehold.co/900x560?text=No+Image")}
        />
      </div>
    </div>
  );
}

function HeroProgress({ raised, goal }) {
  const safeGoal = Math.max(0, Number(goal) || 0);
  const safeRaised = Math.max(0, Number(raised) || 0);
  const pct = safeGoal === 0 ? 0 : Math.min(100, Math.floor((safeRaised / safeGoal) * 100));
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ width: "100%", height: 10, background: "#ffffff33", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#a3e635" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 13, color: "#e5e7eb" }}>
        <span>฿{safeRaised.toLocaleString()} raised</span>
        <span>Goal: ฿{safeGoal.toLocaleString()}</span>
      </div>
    </div>
  );
}

function ListGrid({ loading, cards, onDonate }) {
  if (loading) return <div style={{ padding: 16 }}>Loading campaigns…</div>;
  if (!cards.length) {
    return (
      <div style={styles.emptyState}>
        <p style={{ color: TEXT_MUTED, margin: 0 }}>No other campaigns yet.</p>
      </div>
    );
  }
  return (
    <div style={styles.grid}>
      {cards.map((c) => (
        <CampaignCard key={c._id} c={c} onDonate={() => onDonate(c)} />
      ))}
    </div>
  );
}

function HistorySection({ loading, items }) {
  return (
    <div style={styles.historyWrap}>
      <h3 style={{ marginTop: 0 }}>Your Donations</h3>
      {loading ? (
        <div>Loading…</div>
      ) : items.length === 0 ? (
        <div style={styles.emptyState}><p style={{ color: TEXT_MUTED, margin: 0 }}>No donations yet.</p></div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
          {items.map((d) => (
            <li key={d._id} style={styles.historyItem}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={d.campaign?.images?.[0] || "https://placehold.co/80x60?text=No+Image"}
                  alt=""
                  style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 8, border: `1px solid ${BORDER}` }}
                />
                <div>
                  <div style={{ fontWeight: 700 }}>{d.campaign?.title || "Campaign"}</div>
                  <div style={{ color: TEXT_MUTED, fontSize: 13 }}>
                    Donated ฿{Number(d.amount).toFixed(2)} • {new Date(d.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div style={{ fontWeight: 700 }}>฿{Number(d.amount).toFixed(2)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CampaignCard({ c, onDonate }) {
  const goal = Math.max(0, Number(c.goalAmount) || 0);
  const raised = Math.max(0, Number(c.raisedAmount) || 0);
  const pct = goal === 0 ? 0 : Math.min(100, Math.floor((raised / goal) * 100));

  return (
    <article style={styles.card}>
      <div style={styles.thumbWrap}>
        <img
          src={c.images?.[0] || "https://placehold.co/600x400?text=No+Image"}
          alt={c.title}
          style={styles.thumb}
          onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400?text=No+Image")}
        />
        <div style={styles.cardTopRow}>
          <span style={styles.catChip}>{c.category || "General"}</span>
          <span style={styles.pctChip}>{pct}% Funded</span>
        </div>
      </div>

      <div style={{ padding: "12px 14px 10px" }}>
        <h3 style={{ margin: 0, lineHeight: 1.3 }}>{c.title}</h3>
        <p style={{ margin: "6px 0 0", color: TEXT_MUTED }}>{c.description}</p>
      </div>

      <div style={{ padding: "0 14px 12px" }}>
        <div style={styles.progressMiniTrack}>
          <div style={{ ...styles.progressMiniFill, width: `${pct}%` }} />
        </div>
        <div style={styles.miniAmounts}>
          <strong>฿{fmtMoney(raised)}</strong>
          <span>of ฿{fmtMoney(goal)}</span>
        </div>
      </div>

      <div style={styles.cardFooter}>
        <span title="Flag" style={{ color: "#9ca3af", fontSize: 18 }}>🚩</span>
        <button style={styles.donateBtn} onClick={onDonate}>Donate</button>
      </div>
    </article>
  );
}

function Modal({ children, onClose }) {
  return (
    <div style={styles.modalWrap} onClick={onClose}>
      <div style={styles.modal} onClick={(e)=>e.stopPropagation()}>{children}</div>
    </div>
  );
}

function AmountStep({ title, amount, setAmount, onCancel, onContinue }) {
  const setPreset = (v) => () => setAmount(v);
  const isSel = (v) => Number(amount) === v;

  return (
    <>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div style={styles.amountGrid}>
        {[100, 250, 500, 1000].map((v) => (
          <button key={v} onClick={setPreset(v)} style={{ ...styles.amountBtn, ...(isSel(v) ? styles.amountBtnSel : {}) }}>
            ฿{v}
          </button>
        ))}
      </div>
      <div style={styles.customRow}>
        <input type="number" min="1" value={amount} onChange={(e)=>setAmount(Number(e.target.value))} style={styles.input} />
        <span style={{ color: "#9ca3af" }}>฿</span>
      </div>
      <div style={styles.modalActions}>
        <button onClick={onCancel} style={styles.cancelBtn}>Cancel</button>
        <button onClick={onContinue} style={styles.primaryBtn}>Continue</button>
      </div>
    </>
  );
}

function ConfirmStep({ title, working, onCancel, onConfirm }) {
  return (
    <>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div style={styles.modalActions}>
        <button onClick={onCancel} style={styles.cancelBtn} disabled={working}>Cancel</button>
        <button onClick={onConfirm} style={styles.primaryBtn} disabled={working}>
          {working ? "Processing…" : "Donate"}
        </button>
      </div>
    </>
  );
}

function TabBtn({ active, children, ...props }) {
  return (
    <button
      {...props}
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        border: `1px solid ${active ? GREEN : BORDER}`,
        background: active ? "#ecfccb" : "#fff",
        color: active ? GREEN : "#0f172a",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

/* ================= styles & utils ================= */

const styles = {
  container: { maxWidth: 1280, margin: "0 auto", padding: "16px 20px 28px" },

  topBar: {
    background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14,
    padding: "10px 14px", display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 14, boxShadow: "0 2px 10px rgba(0,0,0,.04)",
  },
  donateTop: { padding: "6px 12px", background: GREEN, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700 },

  heroWrap: { display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 16, alignItems: "stretch" },
  heroLeft: { background: GREEN, color: "#fff", borderRadius: 14, padding: 22, minHeight: 280, display: "flex", flexDirection: "column", boxShadow: "0 4px 18px rgba(16,24,40,.08)" },
  heroRight: { background: "#ffffff", border: `1px solid ${BORDER}`, borderRadius: 14, minHeight: 280, overflow: "hidden", boxShadow: "0 4px 18px rgba(16,24,40,.06)" },
  featuredBadge: { display: "inline-block", padding: "6px 10px", background: "#a3e63533", border: "1px solid #a3e63566", borderRadius: 999, color: "#e5e7eb", fontSize: 12 },
  heroTitle: { margin: "10px 0 4px", fontSize: 28, fontWeight: 800 },
  supportBtn: { marginTop: "auto", alignSelf: "flex-start", background: "#fff", color: "#0f172a", padding: "10px 16px", borderRadius: 999, border: "none", cursor: "pointer", fontWeight: 700 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18, marginTop: 4 },

  card: { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 10px rgba(0,0,0,.04)" },
  thumbWrap: { position: "relative", height: 188, overflow: "hidden" },
  thumb: { width: "100%", height: "100%", objectFit: "cover" },
  cardTopRow: { position: "absolute", top: 8, left: 8, right: 8, display: "flex", justifyContent: "space-between", alignItems: "center" },
  catChip: { background: "#0f172a", color: "#fff", padding: "6px 10px", borderRadius: 999, fontSize: 12 },
  pctChip: { background: "#14532d", color: "#d1fae5", padding: "6px 10px", borderRadius: 999, fontSize: 12 },

  progressMiniTrack: { width: "100%", height: 8, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" },
  progressMiniFill: { height: "100%", background: GREEN },
  miniAmounts: { display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 13, color: TEXT_MUTED },

  historyWrap: { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,.04)" },
  historyItem: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: 10, border: `1px solid ${BORDER}`, borderRadius: 12, background: "#fff" },

  profilePanel: { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,.04)" },

  modalWrap: { position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.45)", zIndex: 60 },
  modal: { width: "min(420px, 92vw)", background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(0,0,0,.2)" },

  amountGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 6, marginBottom: 10 },
  amountBtn: { padding: "10px 0", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#fff", cursor: "pointer", fontWeight: 700 },
  amountBtnSel: { background: GREEN, color: "#fff", borderColor: GREEN },

  label: { display: "block", marginBottom: 6, fontWeight: 600 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${BORDER}` },

  modalActions: { marginTop: 14, display: "flex", justifyContent: "space-between", gap: 10 },
  cancelBtn: { padding: "10px 12px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#fff", cursor: "pointer" },
  primaryBtn: { padding: "10px 12px", borderRadius: 10, border: "none", background: GREEN, color: "#fff", fontWeight: 700, cursor: "pointer" },
};

function fmtMoney(n) {
  return Number(n || 0).toLocaleString(undefined, {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
