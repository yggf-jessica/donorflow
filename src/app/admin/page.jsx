"use client";

import React, { useEffect, useState } from "react";
import RequireRole from "../../components/RequireRole";
import { useAuth } from "../../components/AuthProvider";

const GREEN = "#3f6212";
const BG = "#fefce8";
const BORDER = "#e5e7eb";
const TEXT = "#0f172a";
const MUTED = "#6b7280";

const API = process.env.NEXT_PUBLIC_API_URL || "/project/api";

export default function AdminPage() {
  return (
    <RequireRole allow={["ADMIN"]}>
      <AdminDashboard />
    </RequireRole>
  );
}

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("campaigns"); // campaigns | categories | donations | users

  return (
    <main style={{ background: BG, minHeight: "calc(100vh - 58px)" }}>
      <div style={styles.shell}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.brand}>
            <div style={styles.logo} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: TEXT }}>
                {user?.name || "Admin"}
              </div>
              <div style={{ fontSize: 12, color: MUTED }}>Admin</div>
            </div>
          </div>

          <div style={styles.menuSectionTitle}>DASHBOARD</div>
          <NavItem icon="🎯" active={tab === "campaigns"} onClick={() => setTab("campaigns")}>
            Campaigns
          </NavItem>
          <NavItem icon="🏷️" active={tab === "categories"} onClick={() => setTab("categories")}>
            Categories
          </NavItem>
          <NavItem icon="💸" active={tab === "donations"} onClick={() => setTab("donations")}>
            Donations
          </NavItem>
          <NavItem icon="👥" active={tab === "users"} onClick={() => setTab("users")}>
            Users
          </NavItem>

          <div style={{ marginTop: "auto" }}>
            <div style={styles.menuSectionTitle}>ACCOUNT</div>
            <NavItem icon="↩️" danger onClick={logout}>
              Sign Out
            </NavItem>
          </div>
        </aside>

        {/* Content */}
        <section style={styles.content}>
          <TopBar name={user?.name} />
          {tab === "campaigns" && <CampaignsPanel />}
          {tab === "categories" && <CategoriesPanel />}
          {tab === "donations" && <DonationsPanel />}
          {tab === "users" && <UsersPanel />}
        </section>
      </div>
    </main>
  );
}

/* ---------- Top bar ---------- */
function TopBar({ name }) {
  return (
    <div style={styles.topBar}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={styles.brandMark} />
        <div style={{ fontWeight: 800, fontSize: 22, color: TEXT }}>Admin Dashboard</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: MUTED }}>Welcome,&nbsp;</span>
        <strong>{name || "Admin"}</strong>
      </div>
    </div>
  );
}

/* ============================== PANELS ============================== */

function CampaignsPanel() {
  const [rows, setRows] = useState([]);
  const load = async () => {
    const r = await fetch(`${API}/admin/campaigns`);
    const j = await r.json();
    setRows(j.campaigns || []);
  };
  useEffect(() => { load(); }, []);

  const act = async (id, action) => {
    await fetch(`${API}/admin/campaigns`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    load();
  };

  return (
    <Card title="All Campaigns">
      <Table
        cols={["Title", "Receiver", "Goal", "Raised", "Status", "Actions"]}
        rows={rows.map((c) => [
          <div key={"t"+c._id} style={{ fontWeight: 600 }}>{c.title}</div>,
          <code key={"r"+c._id} style={{ color: MUTED }}>{(c.receiver || "").toString().slice(-6)}</code>,
          `฿${fmtMoney(c.goalAmount)}`,
          `฿${fmtMoney(c.raisedAmount)}`,
          <StatusBadge s={c.status || "UNREVIEWED"} key={"s"+c._id} />,
          !c.status || c.status === "PENDING"
            ? <RowActions
                key={c._id}
                primary={{ label: "Approve", onClick: () => act(c._id, "APPROVE") }}
                danger={{ label: "Reject", onClick: () => act(c._id, "REJECT") }}
              />
            : <span key={"na"+c._id} style={{ color: MUTED }}>—</span>,
        ])}
      />
    </Card>
  );
}

function CategoriesPanel() {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");

  const load = async () => {
    const r = await fetch(`${API}/categories`);
    const j = await r.json();
    setRows(j.categories || []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    await fetch(`${API}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    load();
  };

  const startEdit = (cat) => { setEditing(cat._id); setEditName(cat.name); };
  const saveEdit = async (id) => {
    await fetch(`${API}/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    setEditing(null);
    load();
  };

  const delItem = async (id) => {
    await fetch(`${API}/categories/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <Card
      title="Categories"
      right={
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={name}
            onChange={(e)=>setName(e.target.value)}
            placeholder="New category name"
            style={styles.input}
          />
          <button onClick={add} style={styles.primaryBtn}>Add</button>
        </div>
      }
    >
      <Table
        cols={["Name", "Slug", "Actions"]}
        rows={rows.map((c) => [
          editing === c._id
            ? <input key={"e"+c._id} value={editName} onChange={(e)=>setEditName(e.target.value)} style={styles.input}/>
            : c.name,
          <code key={"s"+c._id} style={{ color: MUTED }}>{c.slug}</code>,
          editing === c._id
            ? <RowActions key={c._id}
                primary={{ label: "Save", onClick: () => saveEdit(c._id) }}
                danger={{ label: "Cancel", onClick: () => setEditing(null) }}
              />
            : <div key={c._id} style={{ display:"flex", gap:8 }}>
                <button onClick={() => startEdit(c)} style={styles.ghostBtnSm}>Edit</button>
                <button onClick={() => delItem(c._id)} style={styles.dangerBtnSm}>Delete</button>
              </div>,
        ])}
      />
    </Card>
  );
}

function DonationsPanel() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    fetch(`${API}/admin/donations`).then(r=>r.json()).then(j=>setRows(j.donations || []));
  }, []);
  return (
    <Card title="All Donations">
      <Table
        cols={["Donor", "Campaign", "Amount", "Status", "When"]}
        rows={rows.map((d) => [
          `${d.donor?.name || ""} (${d.donor?.email || ""})`,
          d.campaign?.title || "—",
          `฿${fmtMoney(d.amount)}`,
          d.status,
          new Date(d.createdAt).toLocaleString(),
        ])}
      />
    </Card>
  );
}

function UsersPanel() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch(`${API}/admin/users`).then(r=>r.json()).then(j=>{
      setRows((j.users || []).filter(u => u.role !== "ADMIN"));
    });
  }, []);

  const filtered = rows.filter(u =>
    filter === "ALL" ? true : u.role === filter
  );

  return (
    <Card
      title="All Users"
      right={
        <select value={filter} onChange={(e)=>setFilter(e.target.value)} style={styles.input}>
          <option value="ALL">All</option>
          <option value="DONOR">Donors</option>
          <option value="RECEIVER">Receivers</option>
        </select>
      }
    >
      <Table
        cols={["Name", "Email", "Role", "Created"]}
        rows={filtered.map((u) => [
          u.name,
          u.email,
          <RoleBadge key={"rb"+u._id} r={u.role} />,
          new Date(u.createdAt).toLocaleString(),
        ])}
      />
    </Card>
  );
}

/* ============================== UI helpers ============================== */

function Card({ title, right, children }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function Table({ cols, rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={styles.table}>
        <thead><tr>{cols.map((c) => <th key={c} style={styles.th}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={cols.length} style={{ textAlign: "center", color: MUTED, padding: 12 }}>No data</td></tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i}>
                {r.map((cell, j) => <td key={j} style={styles.td}>{cell}</td>)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function RowActions({ primary, danger }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {primary && <button onClick={primary.onClick} style={styles.primaryBtnSm}>{primary.label}</button>}
      {danger && <button onClick={danger.onClick} style={styles.dangerBtnSm}>{danger.label}</button>}
    </div>
  );
}

function NavItem({ icon, children, active, danger, ...props }) {
  return (
    <button
      {...props}
      style={{
        ...styles.navItem,
        ...(active ? styles.navItemActive : {}),
        ...(danger ? styles.navItemDanger : {}),
      }}
    >
      <span style={{ width: 20 }}>{icon}</span> {children}
    </button>
  );
}

function StatusBadge({ s }) {
  const map = {
    APPROVED: { bg: "#dcfce7", color: "#166534" },
    PENDING:  { bg: "#fef9c3", color: "#854d0e" },
    REJECTED: { bg: "#fee2e2", color: "#7f1d1d" },
    UNREVIEWED:{ bg: "#e0f2fe", color: "#075985" },
  };
  const m = map[s] || map.UNREVIEWED;
  return (
    <span style={{ background: m.bg, color: m.color, padding: "6px 10px", borderRadius: 999, fontWeight: 700 }}>
      {s}
    </span>
  );
}

function RoleBadge({ r }) {
  const map = {
    ADMIN: { bg: "#ecfccb", color: GREEN },
    DONOR: { bg: "#dbeafe", color: "#1e3a8a" },
    RECEIVER: { bg: "#fae8ff", color: "#6b21a8" },
  };
  const m = map[r] || { bg: "#e5e7eb", color: "#374151" };
  return (
    <span style={{ background: m.bg, color: m.color, padding: "6px 10px", borderRadius: 999, fontWeight: 700 }}>
      {r}
    </span>
  );
}

/* ============================== styles & utils ============================== */

const styles = {
  shell: { display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, maxWidth: 1280, margin: "0 auto", padding: "16px 20px 28px" },
  sidebar: { display: "flex", flexDirection: "column", gap: 6, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 14 },
  brand: { display: "flex", alignItems: "center", gap: 12, marginBottom: 8 },
  logo: { width: 44, height: 44, borderRadius: "50%", background: GREEN },
  menuSectionTitle: { marginTop: 14, marginBottom: 6, color: MUTED, fontSize: 12, fontWeight: 700 },
  navItem: { width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#fff", cursor: "pointer", fontWeight: 700, color: TEXT },
  navItemActive: { borderColor: GREEN, background: "#ecfccb", color: GREEN },
  navItemDanger: { color: "#7f1d1d", borderColor: "#fecaca" },

  content: { display: "flex", flexDirection: "column", gap: 16 },
  topBar: { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  brandMark: { width: 36, height: 18, borderRadius: 4, background: GREEN },

  card: { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 14 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },

  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
  th: { textAlign: "left", padding: 10, background: "#f8fafc", borderBottom: `1px solid ${BORDER}` },
  td: { padding: 10, borderBottom: `1px solid ${BORDER}`, verticalAlign: "top" },

  input: { padding: "10px 12px", borderRadius: 10, border: `1px solid ${BORDER}`, minWidth: 220 },
  primaryBtn: { padding: "10px 12px", borderRadius: 10, border: "none", background: GREEN, color: "#fff", fontWeight: 700, cursor: "pointer" },
  primaryBtnSm: { padding: "6px 10px", borderRadius: 10, border: "none", background: GREEN, color: "#fff", fontWeight: 700 },
  dangerBtnSm: { padding: "6px 10px", borderRadius: 10, border: "none", background: "#7f1d1d", color: "#fff", fontWeight: 700 },
  ghostBtnSm: { padding: "6px 10px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#fff", color: TEXT, fontWeight: 700 },
};

function fmtMoney(n) {
  return Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}