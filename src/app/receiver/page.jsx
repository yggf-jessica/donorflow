"use client";

import React, { useEffect, useState } from "react";
import RequireRole from "../../components/RequireRole";
import { useAuth } from "../../components/AuthProvider";

const GREEN = "#3f6212";
const LIGHT = "#fefce8";
const BORDER = "#e5e7eb";
const MUTED = "#64748b";
const TEXT = "#0f172a";

export default function ReceiverPage() {
  return (
    <RequireRole allow={["RECEIVER"]}>
      <ReceiverDashboard />
    </RequireRole>
  );
}

function ReceiverDashboard() {
  const { user, logout } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const [categories, setCategories] = useState([]);

  const API = process.env.NEXT_PUBLIC_API_URL || "/api";
  const DEMO_RECEIVER_ID = "000000000000000000000001";
  const receiverId = user?.dbId || user?.id || null;
  const receiverEmail = user?.email || null;

  const displayName =
    user?.name || (user?.email ? user.email.split("@")[0] : "—");
  const avatar =
    user?.avatarUrl ||
    `https://api.dicebear.com/6.x/adventurer/svg?seed=${encodeURIComponent(
      displayName
    )}`;

  const buildMineQuery = () => {
    if (receiverId && is24Hex(receiverId))
      return `${API}/campaigns?receiverId=${receiverId}`;
    if (receiverEmail)
      return `${API}/campaigns?receiverEmail=${encodeURIComponent(
        receiverEmail
      )}`;
    return `${API}/campaigns`;
  };

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const url = buildMineQuery();
      const res = await fetch(url);
      const json = await res.json();
      setItems(json.campaigns || []);
    } catch (e) {
      console.error("Load campaigns failed", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch(`${API}/categories`);
      const json = await res.json();
      setCategories(json.categories || []);
    } catch (e) {
      console.error("Load categories failed", e);
      setCategories([]);
    }
  };

  useEffect(() => {
    if (user) {
      load();
      loadCategories();
    }
  }, [user?.dbId, user?.email]);

  const onCreated = (c) => setItems((prev) => [c, ...prev]);
  const onUpdated = (c) =>
    setItems((prev) => prev.map((x) => (x._id === c._id ? c : x)));
  const onDeleted = (id) =>
    setItems((prev) => prev.filter((x) => x._id !== id));

  return (
    <main style={{ background: LIGHT, minHeight: "calc(100vh - 58px)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 16,
          maxWidth: 1280,
          margin: "0 auto",
          padding: 16,
        }}
      >
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.profileCard}>
            <img src={avatar} alt="avatar" style={styles.avatar} />
            <div>
              <div style={{ fontWeight: 700 }}>{displayName}</div>
              <div style={{ color: MUTED, fontSize: 14 }}>
                {user?.email || ""}
              </div>
              <div style={styles.smallBadge}>Campaign Creator</div>
            </div>
          </div>

          <nav style={{ marginTop: 16 }}>
            <SideLink active>Home</SideLink>
            <SideLink onClick={() => setShowCreate(true)}>
              + Create Campaign
            </SideLink>
          </nav>

          <div style={{ marginTop: 24 }}>
            <SideLink onClick={() => setShowProfile(true)}>Edit Profile</SideLink>
            <SideLink danger onClick={logout}>
              Sign Out
            </SideLink>
          </div>
        </aside>

        {/* Main */}
        <section>
          <div style={styles.banner}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={avatar}
                alt="av"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  border: "3px solid #fff",
                }}
              />
              <div>
                <div style={{ fontWeight: 800 }}>{displayName}</div>
                <div style={{ color: "#e5e7eb", fontSize: 14 }}>
                  {user?.email || ""}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              style={styles.createBtn}
            >
              + Create Campaign
            </button>
          </div>

          <h3 style={{ margin: "16px 0" }}>Your Campaigns</h3>

          {loading ? (
            <div style={{ padding: 16 }}>Loading…</div>
          ) : items.length === 0 ? (
            <EmptyState onCreate={() => setShowCreate(true)} />
          ) : (
            <div style={styles.grid}>
              {items.map((c) => (
                <CampaignCard
                  key={c._id}
                  c={c}
                  onEdit={() => setShowEdit(c)}
                  onDelete={() => setConfirmDel(c._id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* CREATE */}
      {showCreate && (
        <CampaignModal
          title="Create New Campaign"
          categories={categories}
          onClose={() => setShowCreate(false)}
          onSubmit={async (payload) => {
            const res = await fetch(`${API}/campaigns`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...payload,
                receiverId: receiverId || DEMO_RECEIVER_ID,
              }),
            });
            const json = await res.json().catch(() => ({}));
            if (res.ok) {
              onCreated(json.campaign);
              setShowCreate(false);
            } else {
              alert(json.error || "Failed to create");
            }
          }}
        />
      )}

      {/* EDIT */}
      {showEdit && (
        <CampaignModal
          title="Edit Campaign"
          categories={categories}
          initial={showEdit}
          onClose={() => setShowEdit(null)}
          onSubmit={async (payload) => {
            const res = await fetch(`${API}/campaigns/${showEdit._id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const json = await res.json().catch(() => ({}));
            if (res.ok) {
              onUpdated(json.campaign);
              setShowEdit(null);
            } else {
              alert(json.error || "Failed to update");
            }
          }}
        />
      )}

      {/* DELETE */}
      {confirmDel && (
        <ConfirmDialog
          message="Delete this campaign? This action cannot be undone."
          onCancel={() => setConfirmDel(null)}
          onConfirm={async () => {
            const res = await fetch(`${API}/campaigns/${confirmDel}`, {
              method: "DELETE",
            });
            if (res.ok) {
              onDeleted(confirmDel);
              setConfirmDel(null);
            } else {
              alert("Failed to delete");
            }
          }}
        />
      )}

      {/* PROFILE */}
      {showProfile && (
        <ProfileModal
          user={{ ...user }}
          onClose={() => setShowProfile(false)}
          onSave={(updated) => {
            console.log("Profile save (stub):", updated);
            setShowProfile(false);
          }}
        />
      )}
    </main>
  );
}

/* ---------- Status Badge ---------- */
function StatusBadge({ status }) {
  const map = {
    APPROVED: { bg: "#dcfce7", color: "#166534", text: "APPROVED" },
    REJECTED: { bg: "#fee2e2", color: "#7f1d1d", text: "REJECTED" },
    PENDING: { bg: "#fef9c3", color: "#854d0e", text: "PENDING REVIEW" },
    UNREVIEWED: { bg: "#e0f2fe", color: "#075985", text: "UNREVIEWED" },
  };
  const m = map[status] || map.UNREVIEWED;
  return (
    <span
      style={{
        background: m.bg,
        color: m.color,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {m.text}
    </span>
  );
}

/* ---------- Campaign Card ---------- */
function CampaignCard({ c, onEdit, onDelete }) {
  const pct = Math.min(
    100,
    Math.floor(((c.raisedAmount || 0) / (c.goalAmount || 1)) * 100)
  );

  return (
    <article style={styles.card}>
      <div style={styles.thumbWrap}>
        <img
          src={c.images?.[0] || "https://placehold.co/600x400?text=No+Image"}
          alt={c.title}
          style={styles.thumb}
        />
        <div style={styles.cardTopRow}>
          <span style={styles.catChip}>{c.category || "General"}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StatusBadge status={c.status} />
            <span style={styles.pctChip}>{pct}% funded</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 14px 8px" }}>
        <h3 style={{ margin: 0 }}>{c.title}</h3>
        <p style={{ color: MUTED, margin: "6px 0 0" }}>{c.description}</p>
      </div>

      <div style={{ padding: "0 14px 10px" }}>
        <div style={styles.progressMiniTrack}>
          <div style={{ ...styles.progressMiniFill, width: `${pct}%` }} />
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 6, fontSize: 13 }}>
          <strong>${fmt(c.raisedAmount)}</strong>
          <span style={{ color: MUTED }}>of ${fmt(c.goalAmount)}</span>
        </div>
      </div>

      <div style={styles.cardFooter}>
        <button onClick={onEdit} style={styles.editBtn}>
          ✎ Edit
        </button>
        <button onClick={onDelete} style={styles.delBtn}>
          🗑 Delete
        </button>
      </div>
    </article>
  );
}

/* ---------- Modals & helpers ---------- */
function CampaignModal({ title, initial, onClose, onSubmit, categories = [] }) {
  const [imageUrl, setImageUrl] = useState(initial?.images?.[0] || "");
  const [name, setName] = useState(initial?.title || "");
  const [desc, setDesc] = useState(initial?.description || "");
  const [goal, setGoal] = useState(initial?.goalAmount || 0);
  const [cat, setCat] = useState(initial?.category || "");

  return (
    <div
      style={styles.modalWrap}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={styles.xBtn}>
            ×
          </button>
        </div>

        <label style={styles.label}>Image URL</label>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={styles.input}
          placeholder="https://..."
        />

        <label style={styles.label}>Campaign Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
          placeholder="Enter a compelling name"
        />

        <label style={styles.label}>Description *</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          style={styles.textarea}
          placeholder="Describe your campaign and its purpose"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={styles.label}>Amount Needed *</label>
            <input
              type="number"
              min="0"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              style={styles.input}
              placeholder="$ 0.00"
            />
          </div>
          <div>
            <label style={styles.label}>Category *</label>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              style={styles.input}
            >
              <option value="">Select a category</option>
              {categories.length
                ? categories.map((ct) => (
                    <option key={ct._id} value={ct.name}>
                      {ct.name}
                    </option>
                  ))
                : ["Health", "Education", "Community", "Animals"].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
            </select>
          </div>
        </div>

        <div style={styles.modalActions}>
          <button onClick={onClose} style={styles.cancelBtn}>
            Cancel
          </button>
          <button
            onClick={() => {
              if (!name || !goal || !cat)
                return alert("Please fill required fields");
              onSubmit({
                title: name,
                description: desc,
                goalAmount: Number(goal),
                category: cat,
                images: imageUrl ? [imageUrl] : [],
              });
            }}
            style={styles.primaryBtn}
          >
            {initial ? "Save Changes" : "Create Campaign"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onCancel, onConfirm }) {
  return (
    <div
      style={styles.modalWrap}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0 }}>Confirm</h3>
          <button onClick={onCancel} style={styles.xBtn}>
            ×
          </button>
        </div>
        <p style={{ marginTop: 8 }}>{message}</p>
        <div style={styles.modalActions}>
          <button onClick={onCancel} style={styles.cancelBtn}>
            Cancel
          </button>
          <button onClick={onConfirm} style={styles.delBtn}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [pass, setPass] = useState("");

  return (
    <div
      style={styles.modalWrap}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0 }}>Edit Profile</h3>
          <button onClick={onClose} style={styles.xBtn}>
            ×
          </button>
        </div>

        <label style={styles.label}>Avatar URL</label>
        <input
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          style={styles.input}
          placeholder="https://..."
        />

        <label style={styles.label}>Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Email *</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Password (optional)</label>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={styles.input}
          placeholder="Leave blank to keep current password"
        />

        <div style={styles.modalActions}>
          <button onClick={onClose} style={styles.cancelBtn}>
            Cancel
          </button>
          <button
            onClick={() => onSave({ name, email, pass, avatarUrl: avatarUrl || null })}
            style={styles.primaryBtn}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small UI helpers ---------- */
function SideLink({ children, active, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        borderRadius: 10,
        border: `1px solid ${active ? GREEN : "transparent"}`,
        background: active ? "#ecfccb" : "transparent",
        color: danger ? "#b91c1c" : TEXT,
        cursor: "pointer",
        marginBottom: 8,
      }}
    >
      {children}
    </button>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div style={styles.empty}>
      <p>No campaigns yet. Create your first one!</p>
      <button onClick={onCreate} style={styles.createBtn}>
        + Create Campaign
      </button>
    </div>
  );
}

/* ---------- Utils ---------- */
function fmt(n) {
  return (n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function is24Hex(s) {
  return typeof s === "string" && /^[0-9a-fA-F]{24}$/.test(s);
}

/* ---------- Styles ---------- */
const styles = {
  sidebar: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    padding: 12,
    height: "fit-content",
  },
  profileCard: { display: "flex", alignItems: "center", gap: 12, padding: 8 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    objectFit: "cover",
  },
  smallBadge: {
    marginTop: 6,
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    background: "#ecfccb",
    color: GREEN,
    fontSize: 12,
  },
  banner: {
    background: GREEN,
    color: "#fff",
    borderRadius: 12,
    padding: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  createBtn: {
    padding: "10px 12px",
    background: "#1f2937",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 18,
  },
  card: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  thumbWrap: { position: "relative", height: 160, overflow: "hidden" },
  thumb: { width: "100%", height: "100%", objectFit: "cover" },
  cardTopRow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  catChip: {
    background: "#0f172a",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
  },
  pctChip: {
    background: "#14532d",
    color: "#d1fae5",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
  },
  progressMiniTrack: {
    width: "100%",
    height: 8,
    background: "#f3f4f6",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressMiniFill: { height: "100%", background: GREEN },
  cardFooter: {
    marginTop: "auto",
    padding: "10px 14px 14px",
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    borderTop: `1px solid ${BORDER}`,
  },
  editBtn: {
    padding: "8px 10px",
    borderRadius: 8,
    border: `1px solid ${BORDER}`,
    background: "#fff",
    cursor: "pointer",
  },
  delBtn: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "none",
    background: "#fee2e2",
    color: "#991b1b",
    cursor: "pointer",
  },
  empty: {
    border: `1px solid ${BORDER}`,
    background: "#fff",
    borderRadius: 12,
    padding: 24,
    textAlign: "center",
  },
  modalWrap: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  modal: {
    width: "min(680px, 92vw)",
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    border: `1px solid ${BORDER}`,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  xBtn: {
    background: "transparent",
    border: "none",
    fontSize: 24,
    lineHeight: 1,
    cursor: "pointer",
  },
  label: { display: "block", marginTop: 10, marginBottom: 6, fontWeight: 600 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: `1px solid ${BORDER}`,
  },
  textarea: {
    width: "100%",
    minHeight: 100,
    padding: "10px 12px",
    borderRadius: 8,
    border: `1px solid ${BORDER}`,
    resize: "vertical",
  },
  modalActions: {
    marginTop: 14,
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelBtn: {
    padding: "10px 12px",
    borderRadius: 8,
    border: `1px solid ${BORDER}`,
    background: "#fff",
    cursor: "pointer",
  },
  primaryBtn: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "none",
    background: GREEN,
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
};