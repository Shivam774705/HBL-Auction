"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { RefreshCw, Plus, X } from "lucide-react";

interface Team {
  _id: string;
  name: string;
  hostel: string;
  color: string;
  totalPurse: number;
  spentPurse: number;
  remainingPurse: number;
  captain?: { name: string; email: string };
  players: Array<{ name: string; category: string; soldPrice?: number }>;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [unsoldPlayers, setUnsoldPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBenchModal, setShowBenchModal] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/teams");
    const data = await res.json();
    setTeams(data.teams || []);
    
    const pRes = await fetch("/api/players?status=unsold");
    const pData = await pRes.json();
    setUnsoldPlayers(pData.players || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addBenchPlayer(teamId: string, playerId: string) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/add-bench`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Bench player added!");
        load();
        setShowBenchModal(null);
      } else {
        toast.error(data.error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800 }}>Teams</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>{teams.length} teams registered</p>
        </div>
        <button onClick={load} className="btn-ghost"><RefreshCw size={16} /> Refresh</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--color-text-muted)" }}>Loading...</div>
      ) : teams.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "4rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏆</div>
          <p style={{ color: "var(--color-text-muted)" }}>No teams yet. Add captains to create teams.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {teams.map((team, i) => {
            const pct = team.totalPurse > 0 ? (team.spentPurse / team.totalPurse) * 100 : 0;
            return (
              <motion.div
                key={team._id}
                className="card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{ borderTop: `3px solid ${team.color || "var(--color-primary)"}` }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: `${team.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>🏸</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>{team.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                      {team.hostel} · {team.captain?.name || "No captain"}
                    </div>
                  </div>
                </div>

                {/* Purse bar */}
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.85rem" }}>
                    <span style={{ color: "var(--color-text-secondary)" }}>Purse used</span>
                    <span style={{ fontWeight: 700 }}>₹{team.spentPurse} / ₹{team.totalPurse}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: "var(--radius-full)", background: "var(--color-bg-elevated)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: "var(--radius-full)", background: pct > 80 ? "var(--color-danger)" : pct > 50 ? "var(--color-warning)" : team.color || "var(--color-primary)", transition: "width 0.8s ease" }} />
                  </div>
                  <div style={{ marginTop: "0.35rem", fontSize: "0.8rem", color: "var(--color-success)", fontWeight: 600 }}>
                    ₹{team.remainingPurse} remaining
                  </div>
                </div>

                {/* Players */}
                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "0.875rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>SQUAD ({team.players.length} players)</div>
                    <button onClick={() => setShowBenchModal(team._id)} className="btn-ghost" style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}>
                      <Plus size={12} /> Add Bench
                    </button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {team.players.slice(0, 8).map((p, j) => (
                      <span
                        key={j}
                        style={{
                          padding: "0.2rem 0.6rem",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          background: "var(--color-bg-elevated)",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        {p.name}
                        {p.soldPrice ? <span style={{ color: "var(--color-accent)", marginLeft: "0.3rem" }}>₹{p.soldPrice}</span> : ""}
                      </span>
                    ))}
                    {team.players.length > 8 && (
                      <span style={{ padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", fontSize: "0.72rem", color: "var(--color-text-muted)", background: "var(--color-bg-elevated)" }}>
                        +{team.players.length - 8} more
                      </span>
                    )}
                    {team.players.length === 0 && <span style={{ color: "var(--color-text-muted)", fontSize: "0.82rem" }}>No players yet</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Bench player modal */}
      <AnimatePresence>
        {showBenchModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBenchModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, backdropFilter: "blur(4px)" }} />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bottom-sheet"
            >
              <div className="bottom-sheet-handle" />
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <h2 style={{ fontWeight: 800, fontSize: "1.1rem" }}>Add Bench Player</h2>
                <button onClick={() => setShowBenchModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}><X size={20} /></button>
              </div>
              <div style={{ maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }} className="mobile-card-list">
                {unsoldPlayers.length === 0 ? (
                  <p style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem" }}>No unsold players available</p>
                ) : unsoldPlayers.map(p => (
                  <div key={p._id} className="mobile-card-item" style={{ padding: "0.75rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>{p.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{p.category} · {p.year} Year</div>
                    </div>
                    <button 
                      onClick={() => addBenchPlayer(showBenchModal!, p._id)} 
                      className="btn-primary" 
                      disabled={submitting}
                      style={{ fontSize: "0.75rem", padding: "0.5rem 0.75rem" }}
                    >
                      Add (₹{p.basePrice})
                    </button>
                  </div>
                ))}
              </div>
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
    </div>
  );
}
