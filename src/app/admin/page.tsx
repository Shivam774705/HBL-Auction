"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Trophy, Hammer, DollarSign, TrendingUp, Activity, RefreshCw, Wand2, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Stats {
  players: { total: number; sold: number; unsold: number; pending: number };
  teams: number;
  captains: number;
  auctionPhase: string;
  totalPurseDistributed: number;
}

interface Team {
  _id: string;
  name: string;
  remainingPurse: number;
  spentPurse: number;
  totalPurse: number;
}

const STAT_CARDS = [
  { key: "captains", label: "Captains", icon: Users, color: "#6366f1" },
  { key: "teams", label: "Teams", icon: Trophy, color: "#f59e0b" },
  { key: "players.total", label: "Total Players", icon: Activity, color: "#10b981" },
  { key: "players.sold", label: "Players Sold", icon: TrendingUp, color: "#ef4444" },
];

function getVal(stats: Stats | null, key: string): number {
  if (!stats) return 0;
  if (key.includes(".")) {
    const [a, b] = key.split(".");
    return (stats as any)[a]?.[b] ?? 0;
  }
  return (stats as any)[key] ?? 0;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const sRes = await fetch("/api/admin/stats");
      const sData = await sRes.json();
      setStats(sData.stats);
      setTeams(sData.teams || []);
    } catch (e) {
      console.error("Load error", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleHardReset() {
    if (resetConfirmText !== "RESET") {
      toast.error("Please type RESET to confirm");
      return;
    }
    
    setLoading(true);
    setShowResetModal(false);
    try {
      const res = await fetch("/api/admin/initialize-auction", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("SYSTEM HARD RESET SUCCESSFUL!");
        setResetConfirmText("");
        loadData();
      } else {
        toast.error(data.error || "Reset failed");
      }
    } catch (e) {
      toast.error("Network error during reset");
    } finally {
      setLoading(false);
    }
  }

  async function handleDistribute() {
    if (!confirm("Randomly assign all unsold players to teams?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/distribute-unsold", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        loadData();
      } else toast.error(data.error);
    } catch { toast.error("Failed"); } finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 900 }}>Dashboard</h1>
        <p style={{ color: "var(--color-text-secondary)" }}>HBL Auction Management Hub</p>
      </div>

      <div className="admin-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 350px), 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {/* Quick Actions */}
        <div className="card-elevated" style={{ padding: "1.25rem" }}>
          <h2 style={{ fontWeight: 800, marginBottom: "1rem", fontSize: "1rem" }}>Quick Actions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <button 
              id="admin-reset-btn"
              onClick={() => setShowResetModal(true)} 
              className="btn-ghost" 
              disabled={loading} 
              style={{ padding: "1rem 0.5rem", flexDirection: "column", height: "auto", fontSize: "0.75rem", borderColor: "var(--color-danger)", color: "var(--color-danger)" }}
            >
              <RefreshCw size={20} style={{ marginBottom: "0.4rem" }} /> Reset System
            </button>
            <button 
              onClick={handleDistribute} 
              className="btn-ghost" 
              disabled={loading || stats?.players.unsold === 0} 
              style={{ padding: "1rem 0.5rem", flexDirection: "column", height: "auto", fontSize: "0.75rem", borderColor: "var(--color-accent)", color: "var(--color-accent)" }}
            >
              <Wand2 size={20} style={{ marginBottom: "0.4rem" }} /> Auto-Dist
            </button>
            <Link href="/admin/auction" className="btn-accent" style={{ gridColumn: "span 2", padding: "1rem", textDecoration: "none", display: "flex", flexDirection: "column", height: "auto" }}>
              <Hammer size={24} style={{ marginBottom: "0.4rem" }} />
              <span style={{ fontWeight: 800 }}>OPEN AUCTION HALL</span>
            </Link>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="card-elevated overview-card" style={{ padding: "1.25rem" }}>
           <h2 style={{ fontWeight: 800, marginBottom: "1.25rem", fontSize: "1rem" }}>Auction Progress</h2>
           <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
              {[
                { label: "Players", val: stats?.players.total || 0, color: "var(--color-primary)" },
                { label: "Sold", val: stats?.players.sold || 0, color: "var(--color-success)" },
                { label: "Unsold", val: stats?.players.unsold || 0, color: "var(--color-danger)" },
                { label: "Remaining", val: stats?.players.pending || 0, color: "var(--color-warning)" }
              ].map(s => (
                <div key={s.label} style={{ background: "var(--color-bg-base)", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>{s.label}</div>
                  <div className="auction-number" style={{ fontSize: "1.5rem", fontWeight: 900, color: s.color }}>{s.val}</div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
         <div className="card">
            <h3 style={{ fontWeight: 800, marginBottom: "1rem" }}>Registration Stats</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
               {[
                 { label: "Teams", val: stats?.teams || 0, icon: Trophy },
                 { label: "Captains", val: stats?.captains || 0, icon: Users },
                 { label: "Purse / Team", val: teams[0] ? `₹${teams[0].totalPurse}` : "N/A", icon: DollarSign }
               ].map(s => (
                 <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", background: "var(--color-bg-elevated)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                       <s.icon size={18} color="var(--color-text-muted)" />
                       <span style={{ fontSize: "0.9rem" }}>{s.label}</span>
                    </div>
                    <span style={{ fontWeight: 800 }}>{s.val}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="card">
            <h3 style={{ fontWeight: 800, marginBottom: "1rem" }}>Team Purses</h3>
            <div style={{ maxHeight: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
               {teams.map(t => (
                 <div key={t._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.8rem", borderRadius: "var(--radius-md)", background: "var(--color-bg-elevated)" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{t.name}</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--color-success)" }}>₹{t.remainingPurse}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <AnimatePresence>
        {showResetModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetModal(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, backdropFilter: "blur(4px)" }}
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bottom-sheet" 
            >
              <div className="bottom-sheet-handle" />
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--color-danger)", marginBottom: "1rem" }}>
                <AlertTriangle size={24} />
                <h2 style={{ fontWeight: 900, fontSize: "1.25rem" }}>CRITICAL ACTION</h2>
                <button onClick={() => setShowResetModal(false)} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer" }}><X size={24} /></button>
              </div>
              
              <p style={{ marginBottom: "1.5rem", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
                This will permanently <strong>DELETE</strong> all auction history. This action <strong>CANNOT</strong> be undone.
              </p>
              
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>Type "RESET" to confirm:</label>
                <input 
                  type="text" 
                  value={resetConfirmText} 
                  onChange={(e) => setResetConfirmText(e.target.value.toUpperCase())}
                  placeholder="RESET"
                  className="input-base"
                  style={{ textAlign: "center", fontSize: "1.25rem", fontWeight: 900, height: "3.5rem" }}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button onClick={() => setShowResetModal(false)} className="btn-ghost" style={{ flex: 1, height: "3.5rem" }}>Cancel</button>
                <button 
                  onClick={handleHardReset} 
                  className="btn-danger" 
                  style={{ flex: 1, height: "3.5rem" }}
                  disabled={resetConfirmText !== "RESET"}
                >
                  Hard Reset
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        @media (min-width: 769px) {
          .overview-card { grid-column: span 2; }
          .bottom-sheet { 
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            bottom: auto !important;
            transform: translate(-50%, -50%) !important;
            max-width: 450px !important;
            border-radius: var(--radius-xl) !important;
          }
          .bottom-sheet-handle { display: none; }
        }
      `}</style>
    </div>
  );
}
