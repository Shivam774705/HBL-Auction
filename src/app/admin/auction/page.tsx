"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, RotateCcw, ChevronRight, Hammer, RefreshCw, Trophy, UserX, Clock } from "lucide-react";
import { useAuctionSocket } from "@/socket/useAuctionSocket";
import { useAuctionStore } from "@/store/useAuctionStore";

interface AuctionState {
  phase: string;
  currentPlayer?: { _id: string; name: string; category: string; year: string; basePrice: number; photo?: string };
  currentBid: number;
  currentBidder?: { _id: string; name: string };
  timerSeconds: number;
  soldCount: number;
  unsoldCount: number;
}

interface Player {
  _id: string;
  name: string;
  hostel: string;
  year: string;
  category: string;
  basePrice: number;
  auctionStatus: string;
  soldPrice?: number;
  team?: { name: string; color: string };
}

export default function AuctionControlPage() {
  useAuctionSocket();
  const store = useAuctionStore();
  
  const [pendingPlayers, setPendingPlayers] = useState<Player[]>([]);
  const [soldPlayers, setSoldPlayers] = useState<Player[]>([]);
  const [unsoldPlayers, setUnsoldPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [tab, setTab] = useState<"pending" | "sold" | "unsold">("pending");

  async function loadData() {
    setLoading(true);
    try {
      const [pRes, sRes, uRes] = await Promise.all([
        fetch("/api/players?status=pending"),
        fetch("/api/players?status=sold"),
        fetch("/api/players?status=unsold"),
      ]);
      const [pData, sData, uData] = await Promise.all([pRes.json(), sRes.json(), uRes.json()]);
      setPendingPlayers(pData.players || []);
      setSoldPlayers(sData.players || []);
      setUnsoldPlayers(uData.players || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [store.currentPlayer, store.soldCount, store.unsoldCount]);

  async function action(endpoint: string, body?: Record<string, unknown>) {
    setActing(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed");
        return;
      }
      
      toast.success(data.message || "Done");
      
      // Auto-switch to next player if sold/unsold
      if (endpoint.includes("sold") || endpoint.includes("unsold")) {
        const pRes = await fetch("/api/players?status=pending");
        const pData = await pRes.json();
        const nextPending = pData.players || [];
        
        if (nextPending.length > 0) {
          const nextPlayer = nextPending[0];
          await action("/api/auction/next-player", { playerId: nextPlayer._id });
        }
      }
      
      loadData();
    } finally { setActing(false); }
  }

  const state = store;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }} className="desktop-only">
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 900 }}>Auction Control</h1>
        <p style={{ color: "var(--color-text-secondary)" }}>Master control panel for the live event</p>
      </div>

      <div className="auction-layout">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Phase controls */}
          <div className="card-elevated" style={{ padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                 <div style={{ width: 10, height: 10, borderRadius: "50%", background: state.phase === "active" ? "var(--color-success)" : "var(--color-warning)", animation: state.phase === "active" ? "pulse-ring 1.5s infinite" : "none" }} />
                 <h2 style={{ fontWeight: 800, fontSize: "0.9rem" }}>{state.phase.toUpperCase()}</h2>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {state.phase !== "active" ? (
                  <button className="btn-primary" onClick={() => action("/api/auction/start")} disabled={acting} style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                    <Play size={14} /> Resume
                  </button>
                ) : (
                  <button className="btn-ghost" onClick={() => action("/api/auction/pause")} disabled={acting} style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                    <Pause size={14} /> Pause
                  </button>
                )}
                <button className="btn-ghost" onClick={loadData} style={{ padding: "0.4rem" }}><RefreshCw size={14} /></button>
              </div>
            </div>
          </div>

          {/* Current player card - Large for thumb access on mobile */}
          <div className="card-elevated current-player-card" style={{ 
            padding: "1.5rem", 
            border: "1px solid var(--color-primary-glow)", 
            background: "rgba(99,102,241,0.05)",
            position: "relative",
            overflow: "hidden"
          }}>
             {!state.currentPlayer ? (
               <div style={{ textAlign: "center", padding: "1.5rem" }}>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Waiting for next player...</p>
               </div>
             ) : (
               <div>
                  <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, borderRadius: "var(--radius-lg)", background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                      {state.currentPlayer.photo ? <img src={state.currentPlayer.photo} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} /> : "🏸"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h2 style={{ fontSize: "1.25rem", fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{state.currentPlayer.name}</h2>
                      <p style={{ color: "var(--color-text-secondary)", fontSize: "0.8rem" }}>{state.currentPlayer.category} · Base: ₹{state.currentPlayer.basePrice}</p>
                    </div>
                  </div>

                  <div style={{ background: "var(--color-bg-base)", padding: "1rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", marginBottom: "1.5rem", textAlign: "center" }}>
                     <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Current Bid</div>
                     <div className="auction-number" style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--color-accent)" }}>₹{state.currentBid}</div>
                     {state.currentBidder ? (
                       <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--color-primary)" }}>{state.currentBidder.name}</div>
                     ) : (
                       <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>No bids yet</div>
                     )}
                  </div>

                  {/* Actions - Sticky at bottom on mobile */}
                  <div className="action-buttons">
                    <button 
                      className="btn-accent" 
                      style={{ flex: 2, height: "3.2rem", fontSize: "0.9rem", borderRadius: "var(--radius-lg)", fontWeight: 900 }}
                      disabled={acting || !state.currentBidder}
                      onClick={() => {
                        if (state.currentBidder?._id) {
                          action("/api/auction/sold", { 
                            playerId: state.currentPlayer?._id, 
                            teamId: state.currentBidder._id, 
                            soldPrice: state.currentBid 
                          });
                        }
                      }}
                    >
                      <Hammer size={18} /> SOLD {state.currentBidder ? "TO " + state.currentBidder.name : ""}
                    </button>
                    {!state.currentBidder && (
                      <button 
                        className="btn-danger" 
                        style={{ flex: 1, height: "3.2rem", borderRadius: "var(--radius-lg)", fontSize: "0.9rem", fontWeight: 900 }}
                        disabled={acting}
                        onClick={() => action("/api/auction/unsold", { playerId: state.currentPlayer?._id })}
                      >
                        UNSOLD
                      </button>
                    )}
                  </div>
               </div>
             )}
          </div>

          {/* Player Tabs */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
             <div className="tab-bar">
                {[
                  { id: "pending", label: "Pending", icon: Clock },
                  { id: "sold", label: "Sold", icon: Trophy },
                  { id: "unsold", label: "Unsold", icon: UserX }
                ].map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setTab(t.id as any)}
                    className={`tab-item ${tab === t.id ? "active" : ""}`}
                  >
                    <t.icon size={16} /> <span>{t.label}</span>
                  </button>
                ))}
             </div>
             <div style={{ maxHeight: "350px", overflowY: "auto", padding: "0.5rem" }} className="mobile-card-list">
                {tab === "pending" && (
                  pendingPlayers.map(p => (
                    <div key={p._id} className="mobile-card-item">
                       <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>{p.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{p.category} · ₹{p.basePrice}</div>
                       </div>
                       <button 
                         className="btn-ghost" 
                         style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem" }}
                         onClick={() => action("/api/auction/next-player", { playerId: p._id })}
                         disabled={acting || !!state.currentBidder}
                       >
                         Start <ChevronRight size={14} />
                       </button>
                    </div>
                  ))
                )}
                {tab === "sold" && (
                  soldPlayers.map(p => (
                    <div key={p._id} className="mobile-card-item">
                       <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>{p.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Sold to {p.team?.name} for ₹{p.soldPrice}</div>
                       </div>
                       <Trophy size={18} style={{ color: "var(--color-success)" }} />
                    </div>
                  ))
                )}
                {tab === "unsold" && (
                  unsoldPlayers.map(p => (
                    <div key={p._id} className="mobile-card-item">
                       <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>{p.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Base ₹{p.basePrice}</div>
                       </div>
                       <UserX size={18} style={{ color: "var(--color-danger)" }} />
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        {/* Sidebar Info - Hidden on mobile */}
        <aside className="desktop-only" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
           <div className="card">
              <h3 style={{ fontWeight: 800, marginBottom: "0.75rem", fontSize: "0.9rem" }}>Live Stats</h3>
              <div style={{ display: "flex", gap: "1rem" }}>
                 <div style={{ flex: 1, padding: "0.75rem", background: "var(--color-bg-base)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>SOLD</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-success)" }}>{state.soldCount}</div>
                 </div>
                 <div style={{ flex: 1, padding: "0.75rem", background: "var(--color-bg-base)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>UNSOLD</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-danger)" }}>{state.unsoldCount}</div>
                 </div>
              </div>
           </div>
        </aside>
      </div>

      <style jsx>{`
        .auction-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 1.5rem;
          align-items: start;
        }
        .tab-bar {
          display: flex;
          border-bottom: 1px solid var(--color-border);
        }
        .tab-item {
          flex: 1;
          padding: 0.875rem;
          border: none;
          background: transparent;
          color: var(--color-text-muted);
          font-weight: 700;
          font-size: 0.8rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tab-item.active {
          color: var(--color-primary);
          border-bottom: 2px solid var(--color-primary);
        }
        .action-buttons {
          display: flex;
          gap: 0.75rem;
        }

        @media (max-width: 768px) {
          .auction-layout { grid-template-columns: 1fr; gap: 1rem; }
          .desktop-only { display: none !important; }
          .action-buttons {
            position: fixed;
            bottom: var(--mobile-nav-height);
            left: 0;
            right: 0;
            z-index: 900;
            background: rgba(10, 11, 15, 0.95);
            backdrop-filter: blur(12px);
            padding: 0.75rem 1rem;
            border-top: 1px solid var(--color-border-bright);
            box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
            border-radius: 0;
          }
          .current-player-card {
            padding-bottom: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
