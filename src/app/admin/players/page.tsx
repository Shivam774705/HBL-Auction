"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, RefreshCw, Search, X } from "lucide-react";

import { downloadTemplate, parseExcel } from "@/lib/excel";

interface Player {
  _id: string;
  name: string;
  hostel: string;
  year: string;
  category: string;
  basePrice: number;
  soldPrice?: number;
  auctionStatus: string;
  team?: { name: string };
}

const CATEGORIES = ["Icon", "Top", "Best", "Good", "Average", "Base"];
const YEARS = ["1st", "2nd", "3rd", "4th"];

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", hostel: "", year: "1st", category: "Good", skills: "" });
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  async function loadPlayers() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (filterCategory) params.set("category", filterCategory);
    const res = await fetch(`/api/players?${params}`);
    const data = await res.json();
    setPlayers(data.players || []);
    setLoading(false);
  }

  useEffect(() => { loadPlayers(); }, [filterStatus, filterCategory]);

  async function handleExcelImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await parseExcel(file);
      const res = await fetch("/api/players/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ players: data }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        loadPlayers();
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

  async function createPlayer(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, skills: form.skills.split(",").map(s => s.trim()).filter(Boolean) }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success(`Player added! Base: ₹${data.player.basePrice}`);
      setShowForm(false);
      setForm({ name: "", hostel: "", year: "1st", category: "Good", skills: "" });
      loadPlayers();
    } finally { setSaving(false); }
  }

  async function deletePlayer(id: string, name: string) {
    if (!confirm(`Delete ${name}?`)) return;
    await fetch(`/api/players/${id}`, { method: "DELETE" });
    toast.success("Deleted"); loadPlayers();
  }

  async function deleteAllPlayers() {
    if (!confirm("Are you absolutely sure? This will delete ALL players. This action cannot be undone.")) return;
    const res = await fetch("/api/players", { method: "DELETE" });
    if (res.ok) {
      toast.success("All players deleted");
      loadPlayers();
    } else {
      toast.error("Failed to delete all");
    }
  }

  async function deleteSelectedPlayers() {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected players?`)) return;
    const res = await fetch("/api/players/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerIds: selectedIds }),
    });
    if (res.ok) {
      toast.success(`Deleted ${selectedIds.length} players`);
      setSelectedIds([]);
      loadPlayers();
    } else {
      toast.error("Failed to delete selected");
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleSelectAll() {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(p => p._id));
  }

  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.hostel.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor: Record<string, string> = { pending: "#6366f1", sold: "#10b981", unsold: "#ef4444" };
  const catColor: Record<string, string> = { 
    Icon: "#f43f5e", // Rose
    Top: "#f59e0b", // Amber
    Best: "#6366f1", // Indigo
    Good: "#10b981", // Emerald
    Average: "#64748b", // Slate
    Base: "#d946ef" // Fuchsia
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 900, lineHeight: 1 }}>Players</h1>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
               <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-sm)", color: "var(--color-text-secondary)" }}>
                 {players.length} Total
               </span>
               <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", background: "rgba(16,185,129,0.1)", borderRadius: "var(--radius-sm)", color: "var(--color-success)" }}>
                 {players.filter(p => p.auctionStatus === "sold").length} Sold
               </span>
            </div>
          </div>
          <button id="players-add" onClick={() => setShowForm(true)} className="btn-primary" style={{ borderRadius: "var(--radius-lg)", padding: "0.6rem 1.25rem", height: "auto" }}>
            <Plus size={18} /> Add
          </button>
        </div>

        <div className="action-row" style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem", marginBottom: "0.75rem", scrollbarWidth: "none" }}>
          <button onClick={() => downloadTemplate("players")} className="btn-ghost" style={{ fontSize: "0.7rem", whiteSpace: "nowrap", height: "2.25rem" }}>Template</button>
          <label className="btn-ghost" style={{ cursor: "pointer", fontSize: "0.7rem", whiteSpace: "nowrap", height: "2.25rem", display: "flex", alignItems: "center" }}>
            <input type="file" accept=".xlsx, .xls" onChange={handleExcelImport} style={{ display: "none" }} disabled={importing} />
            {importing ? "..." : "Import"}
          </label>
          <button onClick={loadPlayers} className="btn-ghost" style={{ height: "2.25rem", width: "2.25rem", padding: 0 }}><RefreshCw size={14} /></button>
          <div style={{ flex: 1 }} />
          <button onClick={deleteAllPlayers} className="btn-danger" style={{ fontSize: "0.7rem", whiteSpace: "nowrap", height: "2.25rem", color: "var(--color-danger)", background: "transparent", border: "1px solid rgba(239,68,68,0.2)" }}>Delete All</button>
          {selectedIds.length > 0 && (
            <button onClick={deleteSelectedPlayers} className="btn-danger" style={{ fontSize: "0.7rem", whiteSpace: "nowrap", height: "2.25rem" }}>
               Del ({selectedIds.length})
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "nowrap" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
            <input className="input-base" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: "2.25rem", height: "2.75rem", fontSize: "0.9rem" }} />
          </div>
          <select className="input-base" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: "auto", height: "2.75rem", fontSize: "0.85rem", padding: "0 0.5rem" }}>
            <option value="">Status</option>
            {["pending", "sold", "unsold"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input-base" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ width: "auto", height: "2.75rem", fontSize: "0.85rem", padding: "0 0.5rem" }}>
            <option value="">Cat</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

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
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <h2 style={{ fontWeight: 800, fontSize: "1.2rem" }}>Add Player</h2>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}><X size={20} /></button>
              </div>
              <form onSubmit={createPlayer} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input id="pf-name" className="input-base" placeholder="Player Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ height: "3.5rem", fontSize: "1rem" }} />
                <input id="pf-hostel" className="input-base" placeholder="Hostel" value={form.hostel} onChange={e => setForm({ ...form, hostel: e.target.value })} required style={{ height: "3.5rem", fontSize: "1rem" }} />
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <select id="pf-year" className="input-base" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} style={{ height: "3.5rem", fontSize: "1rem" }}>
                    {YEARS.map(y => <option key={y} value={y}>{y} Year</option>)}
                  </select>
                  <select id="pf-cat" className="input-base" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ height: "3.5rem", fontSize: "1rem" }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <input className="input-base" placeholder="Skills (comma-separated)" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} style={{ height: "3.5rem", fontSize: "1rem" }} />
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textAlign: "center" }}>Base price auto-calculated from pricing rules.</p>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-ghost" style={{ flex: 1, height: "3.5rem" }}>Cancel</button>
                  <button id="pf-submit" type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, height: "3.5rem" }}>{saving ? "Adding..." : "Add Player"}</button>
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

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--color-text-muted)" }}>Loading...</div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="card desktop-only" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", width: 40 }}>
                      <input type="checkbox" checked={filtered.length > 0 && selectedIds.length === filtered.length} onChange={toggleSelectAll} style={{ cursor: "pointer" }} />
                    </th>
                    {["Name", "Hostel", "Year", "Category", "Base", "Status", "Team", ""].map(h => (
                      <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p._id} style={{ borderBottom: "1px solid var(--color-border)", background: selectedIds.includes(p._id) ? "rgba(99,102,241,0.05)" : "transparent" }}>
                      <td style={{ padding: "0.7rem 1rem" }}>
                        <input type="checkbox" checked={selectedIds.includes(p._id)} onChange={() => toggleSelect(p._id)} style={{ cursor: "pointer" }} />
                      </td>
                      <td style={{ padding: "0.7rem 1rem", fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: "0.7rem 1rem", color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>{p.hostel}</td>
                      <td style={{ padding: "0.7rem 1rem", fontSize: "0.875rem" }}>{p.year}</td>
                      <td style={{ padding: "0.7rem 1rem" }}>
                        <span style={{ padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700, background: `${catColor[p.category] || "#64748b"}20`, color: catColor[p.category] || "var(--color-text-secondary)" }}>{p.category}</span>
                      </td>
                      <td style={{ padding: "0.7rem 1rem", fontWeight: 700 }}>₹{p.basePrice}</td>
                      <td style={{ padding: "0.7rem 1rem" }}>
                        <span style={{ padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700, background: `${statusColor[p.auctionStatus] || "#6366f1"}20`, color: statusColor[p.auctionStatus] || "#6366f1" }}>
                          {p.auctionStatus}{p.soldPrice ? ` ₹${p.soldPrice}` : ""}
                        </span>
                      </td>
                      <td style={{ padding: "0.7rem 1rem", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>{p.team?.name || "—"}</td>
                      <td style={{ padding: "0.7rem 1rem" }}>
                        <button onClick={() => deletePlayer(p._id, p.name)} className="btn-danger" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}><Trash2 size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>No players found</div>}
            </div>
          </div>

          {/* Mobile Card List View */}
          <div className="mobile-only mobile-card-list">
            {filtered.map((p) => (
              <div key={p._id} className="mobile-card-item" style={{ flexDirection: "column", alignItems: "stretch", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>{p.name}</div>
                   <span style={{ padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", fontSize: "0.65rem", fontWeight: 800, background: `${statusColor[p.auctionStatus] || "#6366f1"}20`, color: statusColor[p.auctionStatus] || "#6366f1", textTransform: "uppercase" }}>
                      {p.auctionStatus}
                   </span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                   <span>{p.hostel}</span> • <span>{p.year} Year</span> • 
                   <span style={{ color: catColor[p.category] }}>{p.category}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "0.5rem" }}>
                   <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--color-text-primary)" }}>
                      ₹{p.basePrice}
                      {p.soldPrice && <span style={{ fontSize: "0.8rem", color: "var(--color-accent)", marginLeft: "0.4rem" }}>→ Sold ₹{p.soldPrice}</span>}
                   </div>
                   <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => deletePlayer(p._id, p.name)} className="btn-ghost" style={{ padding: "0.5rem", color: "var(--color-danger)", borderColor: "transparent" }}>
                        <Trash2 size={18} />
                      </button>
                   </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>No players found</div>}
          </div>
        </>
      )}

      <style jsx>{`
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
