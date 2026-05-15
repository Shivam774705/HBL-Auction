"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Player { _id: string; name: string; year: string; category: string; soldPrice?: number; }
interface Team { _id: string; name: string; hostel: string; color: string; totalPurse: number; spentPurse: number; remainingPurse: number; players: Player[]; }

export default function CaptainTeamPage() {
  const { user } = useAuthStore();
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    if (user?.team) {
      fetch(`/api/teams/${user.team}`).then(r => r.json()).then(d => setTeam(d.team));
    }
  }, [user]);

  if (!team) return <div style={{ padding: "4rem", textAlign: "center", color: "var(--color-text-muted)" }}>Loading team...</div>;

  const pct = team.totalPurse > 0 ? (team.remainingPurse / team.totalPurse) * 100 : 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-base)" }}>
      {/* Header with gradient */}
      <div style={{ 
        padding: "2rem 1.5rem", 
        background: `linear-gradient(180deg, ${team.color}20 0%, rgba(10,11,15,0) 100%)`,
        borderBottom: "1px solid var(--color-border)"
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
            <Link href="/captain" style={{ width: 40, height: 40, background: "var(--color-bg-surface)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--color-border)" }}>
              <ArrowLeft size={20} />
            </Link>
            <div style={{ width: 64, height: 64, borderRadius: "20%", background: `${team.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", border: `2px solid ${team.color}` }}>
              {team.name[0]}
            </div>
          </div>
          
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.25rem", fontWeight: 950, marginBottom: "0.25rem" }}>{team.name}</h1>
          <p style={{ color: "var(--color-text-secondary)", fontWeight: 600, fontSize: "1rem", marginBottom: "2rem" }}>{team.hostel} · Squad Stats</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
            <div className="card-elevated" style={{ padding: "1.25rem", background: "var(--color-bg-surface)" }}>
               <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem" }}>Purse Remaining</div>
               <div style={{ fontSize: "1.75rem", fontWeight: 950, color: "var(--color-success)" }}>₹{team.remainingPurse}</div>
               <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-full)", marginTop: "0.75rem", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: team.color, transition: "width 1s ease" }} />
               </div>
            </div>
            <div className="card-elevated" style={{ padding: "1.25rem", background: "var(--color-bg-surface)" }}>
               <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem" }}>Total Spent</div>
               <div style={{ fontSize: "1.75rem", fontWeight: 950 }}>₹{team.spentPurse}</div>
               <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "0.75rem" }}>From ₹{team.totalPurse}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem" }}>
        <h2 style={{ fontWeight: 800, marginBottom: "1.25rem", fontSize: "1.1rem" }}>Squad Members ({team.players.length})</h2>
        {team.players.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem", background: "var(--color-bg-card)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📋</div>
            <p style={{ color: "var(--color-text-muted)" }}>No players bought yet.</p>
          </div>
        ) : (
          <div className="mobile-card-list">
            {team.players.map((p, i) => (
              <motion.div 
                key={p._id} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="mobile-card-item" 
                style={{ padding: "1.25rem" }}
              >
                <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--color-bg-overlay)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 800 }}>
                  {p.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "white" }}>{p.name}</div>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>{p.category}</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>•</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>{p.year} Year</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 900, color: "var(--color-accent)", fontSize: "1.1rem" }}>₹{p.soldPrice}</div>
                  <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 800 }}>Sold Price</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
