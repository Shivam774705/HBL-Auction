"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Standing {
  _id: string;
  position: number;
  played: number;
  won: number;
  lost: number;
  points: number;
  team: { name: string; hostel: string; color: string; logo?: string };
}

export default function StandingsPage() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/standings");
    const data = await res.json();
    setStandings(data.standings || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-base)", padding: "2rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/captain" style={{ width: 40, height: 40, background: "var(--color-bg-surface)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--color-border)", color: "white" }}>
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Trophy size={28} color="var(--color-accent)" /> Standings
              </h1>
              <p style={{ color: "var(--color-text-secondary)" }}>Live tournament points table</p>
            </div>
          </div>
          <button onClick={load} className="btn-ghost"><RefreshCw size={16} /></button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--color-text-muted)" }}>Loading...</div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg-elevated)" }}>
                  {["#", "Team", "P", "W", "L", "Pts"].map(h => (
                    <th key={h} style={{ padding: "0.875rem 1rem", textAlign: h === "Team" ? "left" : "center", fontSize: "0.8rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standings.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>No standings yet</td></tr>
                ) : standings.map((s, i) => (
                  <tr key={s._id} style={{ borderBottom: "1px solid var(--color-border)", background: i < 3 ? `${s.team.color}08` : "transparent" }}>
                    <td style={{ padding: "0.875rem 1rem", textAlign: "center", fontWeight: 900, color: i === 0 ? "var(--color-accent)" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7f32" : "var(--color-text-muted)", fontSize: i < 3 ? "1.1rem" : "1rem" }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : s.position}
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.team.color || "var(--color-primary)", flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 700 }}>{s.team.name}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>{s.team.hostel}</div>
                        </div>
                      </div>
                    </td>
                    {[s.played, s.won, s.lost].map((v, j) => (
                      <td key={j} style={{ padding: "0.875rem 1rem", textAlign: "center", color: "var(--color-text-secondary)" }}>{v}</td>
                    ))}
                    <td style={{ padding: "0.875rem 1rem", textAlign: "center", fontWeight: 900, fontSize: "1.1rem", color: "var(--color-primary)" }}>{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
