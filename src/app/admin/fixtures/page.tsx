"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Zap } from "lucide-react";

interface Fixture {
  _id: string;
  round: number;
  matchNumber: number;
  teamA: { name: string; hostel: string; color: string };
  teamB: { name: string; hostel: string; color: string };
  scheduledAt?: string;
  result?: { completed: boolean; winner?: { name: string }; scoreA?: string; scoreB?: string };
}

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/fixtures");
    const data = await res.json();
    setFixtures(data.fixtures || []);
    setLoading(false);
  }

  async function generate() {
    if (!confirm("Generate round-robin fixtures? This will delete existing ones.")) return;
    setGenerating(true);
    const res = await fetch("/api/fixtures", { method: "POST" });
    const data = await res.json();
    if (res.ok) { toast.success(data.message); load(); }
    else toast.error(data.error);
    setGenerating(false);
  }

  useEffect(() => { load(); }, []);

  const rounds = [...new Set(fixtures.map(f => f.round))].sort((a, b) => a - b);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800 }}>Fixtures</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>{fixtures.length} matches scheduled</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={load} className="btn-ghost"><RefreshCw size={16} /></button>
          <button id="fixtures-generate" onClick={generate} className="btn-primary" disabled={generating}><Zap size={16} /> {generating ? "Generating..." : "Generate Fixtures"}</button>
        </div>
      </div>

      {loading ? <div style={{ textAlign: "center", padding: "4rem", color: "var(--color-text-muted)" }}>Loading...</div>
        : fixtures.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "4rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
            <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>No fixtures yet</h3>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>Click Generate to create round-robin fixtures</p>
            <button onClick={generate} className="btn-primary" disabled={generating}><Zap size={16} /> Generate</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {rounds.map(r => (
              <div key={r}>
                <h2 style={{ fontWeight: 700, marginBottom: "0.75rem", color: "var(--color-text-secondary)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Round {r}</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {fixtures.filter(f => f.round === r).map(f => (
                    <div key={f._id} className="card" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: f.teamA?.color || "var(--color-primary)" }} />
                        <span style={{ fontWeight: 700 }}>{f.teamA?.name}</span>
                      </div>
                      <span style={{ color: "var(--color-text-muted)", fontWeight: 700, padding: "0.25rem 0.75rem", background: "var(--color-bg-elevated)", borderRadius: "var(--radius-sm)" }}>vs</span>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "flex-end" }}>
                        <span style={{ fontWeight: 700 }}>{f.teamB?.name}</span>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: f.teamB?.color || "var(--color-accent)" }} />
                      </div>
                      {f.result?.completed && (
                        <span style={{ padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700, background: "rgba(16,185,129,0.15)", color: "var(--color-success)" }}>
                          ✓ {f.result.winner?.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
