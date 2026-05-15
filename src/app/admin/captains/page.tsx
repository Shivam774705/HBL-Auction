"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, RefreshCw, Eye, EyeOff, UserX, Edit2, X } from "lucide-react";

import { downloadTemplate, parseExcel } from "@/lib/excel";

interface Captain {
  _id: string;
  name: string;
  email: string;
  hostel: string;
  loginEnabled: boolean;
  displayPassword?: string;
  team?: { name: string; totalPurse: number; remainingPurse: number };
}

export default function CaptainsPage() {
  const [captains, setCaptains] = useState<Captain[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", hostel: "", color: "#6366f1" });
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  async function loadCaptains() {
    setLoading(true);
    const res = await fetch("/api/captains");
    const data = await res.json();
    setCaptains(data.captains || []);
    setLoading(false);
  }

  useEffect(() => { loadCaptains(); }, []);

  async function handleExcelImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await parseExcel(file);
      const res = await fetch("/api/captains/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captains: data }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        loadCaptains();
      } else {
        toast.error(result.error || "Import failed");
      }
    } catch (err) {
      toast.error("Error reading Excel file");
    } finally {
      setImporting(false);
      e.target.value = ""; // Reset input
    }
  }

  async function createCaptain(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/captains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success(`Captain ${form.name} created!`);
      setShowForm(false);
      setForm({ name: "", email: "", password: "", hostel: "", color: "#6366f1" });
      loadCaptains();
    } finally {
      setSaving(false);
    }
  }

  async function deleteCaptain(id: string, name: string) {
    if (!confirm(`Delete captain ${name}? This will also delete their team.`)) return;
    const res = await fetch(`/api/captains/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Captain deleted"); loadCaptains(); }
    else toast.error("Failed to delete");
  }

  async function deleteAllCaptains() {
    if (!confirm("Are you absolutely sure? This will delete ALL captains and ALL teams. This action cannot be undone.")) return;
    const res = await fetch("/api/captains", { method: "DELETE" });
    if (res.ok) {
      toast.success("All captains and teams deleted");
      loadCaptains();
    } else {
      toast.error("Failed to delete all");
    }
  }

  async function toggleLogin(id: string) {
    const res = await fetch(`/api/captains/${id}/toggle-login`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      toast.success(`Login ${data.loginEnabled ? "enabled" : "disabled"}`);
      loadCaptains();
    }
  }

  async function forceLogout(id: string) {
    await fetch(`/api/captains/${id}/force-logout`, { method: "POST" });
    toast.success("Captain force-logged out");
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 900, lineHeight: 1 }}>Captains</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
              {captains.length} Active Captains
            </p>
          </div>
          <button id="captains-add" onClick={() => setShowForm(true)} className="btn-primary" style={{ borderRadius: "var(--radius-lg)", padding: "0.6rem 1.25rem", height: "auto" }}>
            <Plus size={18} /> Add
          </button>
        </div>

        <div className="action-row" style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem", scrollbarWidth: "none" }}>
          <button onClick={() => downloadTemplate("captains")} className="btn-ghost" style={{ fontSize: "0.7rem", whiteSpace: "nowrap", height: "2.25rem" }}>Template</button>
          <label className="btn-ghost" style={{ cursor: "pointer", fontSize: "0.7rem", whiteSpace: "nowrap", height: "2.25rem", display: "flex", alignItems: "center" }}>
            <input type="file" accept=".xlsx, .xls" onChange={handleExcelImport} style={{ display: "none" }} disabled={importing} />
            {importing ? "..." : "Import"}
          </label>
          <button onClick={loadCaptains} className="btn-ghost" style={{ height: "2.25rem", width: "2.25rem", padding: 0 }}><RefreshCw size={14} /></button>
          <div style={{ flex: 1 }} />
          <button onClick={deleteAllCaptains} className="btn-danger" style={{ fontSize: "0.7rem", whiteSpace: "nowrap", height: "2.25rem", color: "var(--color-danger)", background: "transparent", border: "1px solid rgba(239,68,68,0.2)" }}>Delete All</button>
        </div>
      </div>

      {/* Add form modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, backdropFilter: "blur(4px)" }} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bottom-sheet"
            >
              <div className="bottom-sheet-handle" />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <h2 style={{ fontWeight: 800, fontSize: "1.2rem" }}>Add New Captain</h2>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={createCaptain} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  { key: "name", label: "Full Name", type: "text", placeholder: "Rajesh Kumar" },
                  { key: "email", label: "Email", type: "email", placeholder: "captain@hostel.edu" },
                  { key: "password", label: "Password", type: "password", placeholder: "min 6 characters" },
                  { key: "hostel", label: "Hostel Name", type: "text", placeholder: "Hostel 7" },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--color-text-secondary)" }}>
                      {label}
                    </label>
                    <input
                      id={`captain-form-${key}`}
                      className="input-base"
                      type={type}
                      value={(form as any)[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      required
                      style={{ height: "3.5rem", fontSize: "1rem" }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--color-text-secondary)" }}>
                    Team Color
                  </label>
                  <input
                    id="captain-form-color"
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    style={{ width: "100%", height: 44, borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", background: "var(--color-bg-elevated)", cursor: "pointer" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-ghost" style={{ flex: 1, height: "3.5rem" }}>Cancel</button>
                  <button id="captain-form-submit" type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, height: "3.5rem" }}>
                    {saving ? "Creating..." : "Create Captain"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        @media (min-width: 769px) {
          .bottom-sheet { 
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            bottom: auto !important;
            transform: translate(-50%, -50%) !important;
            max-width: 480px !important;
            border-radius: var(--radius-xl) !important;
          }
          .bottom-sheet-handle { display: none; }
        }
      `}</style>

      {/* Captains list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--color-text-muted)" }}>Loading captains...</div>
      ) : captains.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "4rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👥</div>
          <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>No captains yet</h3>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>Add captains to create teams</p>
          <button onClick={() => setShowForm(true)} className="btn-primary" id="captains-empty-add">
            <Plus size={16} /> Add First Captain
          </button>
        </div>
      ) : (
        <div className="mobile-card-list">
          {captains.map((c, i) => (
            <motion.div
              key={c._id}
              className="mobile-card-item"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ flexDirection: "column", alignItems: "stretch", gap: "0.75rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: 44, height: 44, borderRadius: "var(--radius-full)",
                    background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: "1.1rem", flexShrink: 0,
                  }}
                >
                  {c.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: "1rem" }}>{c.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{c.hostel} · {c.email}</div>
                </div>
                <div
                  style={{
                    padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)",
                    fontSize: "0.6rem", fontWeight: 800,
                    background: c.loginEnabled ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                    color: c.loginEnabled ? "var(--color-success)" : "var(--color-danger)",
                  }}
                >
                  {c.loginEnabled ? "ACTIVE" : "OFF"}
                </div>
              </div>

              {c.team && (
                <div style={{ padding: "0.6rem", background: "var(--color-bg-base)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", fontSize: "0.8rem" }}>
                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                      <span style={{ color: "var(--color-text-secondary)" }}>Team: {c.team.name}</span>
                      <span style={{ fontWeight: 800 }}>₹{c.team.remainingPurse}</span>
                   </div>
                </div>
              )}

              {c.displayPassword && (
                <div style={{ fontSize: "0.75rem", color: "var(--color-accent)", fontWeight: 700 }}>
                  Password: <code style={{ background: "rgba(245,158,11,0.1)", padding: "2px 4px", borderRadius: "4px" }}>{c.displayPassword}</code>
                </div>
              )}

              <div style={{ display: "flex", gap: "0.5rem", borderTop: "1px solid var(--color-border)", paddingTop: "0.75rem" }}>
                <button onClick={() => toggleLogin(c._id)} className="btn-ghost" style={{ flex: 1, padding: "0.5rem", fontSize: "0.75rem" }}>
                   {c.loginEnabled ? <EyeOff size={16} /> : <Eye size={16} />} Login
                </button>
                <button onClick={() => forceLogout(c._id)} className="btn-ghost" style={{ flex: 1, padding: "0.5rem", fontSize: "0.75rem" }}>
                   <UserX size={16} /> Logout
                </button>
                <button onClick={() => deleteCaptain(c._id, c.name)} className="btn-ghost" style={{ flex: 1, padding: "0.5rem", color: "var(--color-danger)", borderColor: "transparent" }}>
                   <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
