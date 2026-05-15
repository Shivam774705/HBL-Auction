"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, RefreshCw } from "lucide-react";

const CATEGORIES = ["Icon", "Top", "Best", "Good", "Average", "Base"];
const YEARS = ["1st", "2nd", "3rd", "4th"];
type PriceMatrix = Record<string, Record<string, number>>;

export default function PricingPage() {
  const [matrix, setMatrix] = useState<PriceMatrix>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/pricing-rules");
    const data = await res.json();
    const m: PriceMatrix = {};
    for (const r of data.rules || []) {
      if (!m[r.category]) m[r.category] = {};
      m[r.category][r.year] = r.basePrice;
    }
    for (const cat of CATEGORIES) {
      if (!m[cat]) m[cat] = {};
      for (const yr of YEARS) { if (!m[cat][yr]) m[cat][yr] = 50; }
    }
    setMatrix(m);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    const rules = CATEGORIES.flatMap(cat => YEARS.map(yr => ({ category: cat, year: yr, basePrice: matrix[cat]?.[yr] || 50 })));
    const res = await fetch("/api/pricing-rules", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rules }) });
    if (res.ok) toast.success("Saved!"); else toast.error("Failed");
    setSaving(false);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800 }}>Pricing Rules</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Base prices by Category × Year</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={load} className="btn-ghost"><RefreshCw size={16} /></button>
          <button id="pricing-save" onClick={save} className="btn-primary" disabled={saving}><Save size={16} /> {saving ? "Saving..." : "Save"}</button>
        </div>
      </div>
      {loading ? <div style={{ textAlign: "center", padding: "4rem", color: "var(--color-text-muted)" }}>Loading...</div> : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 700, color: "var(--color-text-muted)", fontSize: "0.8rem" }}>CATEGORY</th>
                {YEARS.map(yr => <th key={yr} style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 700, color: "var(--color-text-muted)", fontSize: "0.8rem" }}>{yr}</th>)}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map(cat => (
                <tr key={cat} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{ 
                      padding: "0.25rem 0.75rem", 
                      borderRadius: "var(--radius-full)", 
                      fontSize: "0.8rem", 
                      fontWeight: 700, 
                      background: cat === "Icon" ? "rgba(244,63,94,0.15)" : cat === "Top" ? "rgba(245,158,11,0.2)" : cat === "Best" ? "rgba(99,102,241,0.2)" : cat === "Good" ? "rgba(16,185,129,0.2)" : cat === "Average" ? "rgba(100,116,139,0.2)" : "rgba(217,70,239,0.15)",
                      color: cat === "Icon" ? "#f43f5e" : cat === "Top" ? "var(--color-accent)" : cat === "Best" ? "var(--color-primary)" : cat === "Good" ? "var(--color-success)" : cat === "Average" ? "var(--color-text-secondary)" : "#d946ef" 
                    }}>
                      {cat}
                    </span>
                  </td>
                  {YEARS.map(yr => (
                    <td key={yr} style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>
                      <input
                        id={`price-${cat}-${yr}`}
                        type="number" min={10} step={5}
                        value={matrix[cat]?.[yr] || 50}
                        onChange={e => setMatrix(prev => ({ ...prev, [cat]: { ...prev[cat], [yr]: Number(e.target.value) } }))}
                        style={{ width: 80, background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", color: "var(--color-text-primary)", padding: "0.4rem", fontSize: "0.9rem", textAlign: "center", fontWeight: 700, outline: "none" }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
