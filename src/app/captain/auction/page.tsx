"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuctionSocket } from "@/socket/useAuctionSocket";
import { useAuctionStore } from "@/store/useAuctionStore";
import { useTeamStore } from "@/store/useTeamStore";
import { useAuthStore } from "@/store/useAuthStore";
import { formatTimer, getTimerColor, getBidIncrement } from "@/lib/utils";
import { toast } from "sonner";
import { Maximize2, Gavel, Menu, X, Users, History, Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuctionHallPage() {
  const { placeBid } = useAuctionSocket();
  const { phase, currentPlayer, currentBid, currentBidder, timerSeconds, bidHistory, soldCount, unsoldCount } = useAuctionStore();
  const { teams, setTeams } = useTeamStore();
  const { user } = useAuthStore();
  const [myTeam, setMyTeam] = useState<typeof teams[0] | null>(null);
  const [bidAmount, setBidAmount] = useState(0);
   const [activeMobileTab, setActiveMobileTab] = useState<"auction" | "teams" | "history">("auction");

  useEffect(() => {
    fetch("/api/teams").then(r => r.json()).then(d => setTeams(d.teams || []));
  }, [setTeams]);

  useEffect(() => {
    if (user?.role === "captain" && user.team) {
      const t = teams.find(t => t._id === user.team);
      if (t) setMyTeam(t);
    }
  }, [user, teams]);

  useEffect(() => {
    if (currentPlayer) {
      setBidAmount(currentBid + getBidIncrement(currentBid));
    }
  }, [currentBid, currentPlayer]);

  function handleBid() {
    if (!user?.team || !currentPlayer) return;
    if (!myTeam || myTeam.remainingPurse < bidAmount) {
      toast.error("Insufficient purse!");
      return;
    }
    placeBid(user.team, user.id, bidAmount);
    toast.success(`Bid ₹${bidAmount} placed!`);
  }

  const playersNeeded = myTeam ? Math.max(0, (myTeam.maxPlayers || 0) - (myTeam.players?.length || 0)) : 0;
  const isSquadFull = playersNeeded === 0;
  const slotsToReserve = Math.max(0, playersNeeded - 1);
  const reserveNeeded = slotsToReserve * 50; 
  const safeBidLimit = myTeam ? Math.max(0, myTeam.remainingPurse - reserveNeeded) : 0;
  const showWarning = myTeam && bidAmount > safeBidLimit;
  const canAfford = myTeam && bidAmount <= myTeam.remainingPurse;
  const timerColor = getTimerColor(timerSeconds);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-base)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
       <header style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "1rem", background: "var(--color-bg-surface)", position: "sticky", top: 0, zIndex: 100 }}>
         <Link href="/captain" className="mobile-only" style={{ width: 32, height: 32, background: "var(--color-bg-overlay)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
            <ArrowLeft size={18} />
         </Link>
         <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
           <span style={{ fontSize: "1.25rem" }}>🏸</span>
           <div>
             <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.95rem" }}>HBL Auction Hall</div>
             <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
               <span style={{ color: phase === "active" ? "var(--color-success)" : "var(--color-warning)", fontWeight: 700 }}>● {phase.replace("_", " ").toUpperCase()}</span>
               {" · "}Sold: {soldCount} · Unsold: {unsoldCount}
             </div>
           </div>
         </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
           <Link href="/bigscreen" target="_blank" className="btn-ghost desktop-only" style={{ textDecoration: "none", fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}>
              <Maximize2 size={14} /> Big Screen
           </Link>
           {user?.role === "admin" && (
             <Link href="/admin" className="btn-ghost" style={{ textDecoration: "none", fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}>
               Dashboard
             </Link>
           )}
        </div>
      </header>

      {/* Main Responsive Layout */}
      <div className="auction-layout" style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        
        {/* Teams Sidebar (Left) */}
        <aside 
          className={`auction-sidebar left ${activeMobileTab === "teams" ? "mobile-visible" : ""}`}
          style={{ width: 300, borderRight: "1px solid var(--color-border)", background: "var(--color-bg-base)", overflowY: "auto", padding: "1rem" }}
        >
          <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>Teams & Purses</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {teams.map(team => {
              const pct = team.totalPurse > 0 ? (team.spentPurse / team.totalPurse) * 100 : 0;
              const isBidder = currentBidder?._id === team._id;
              return (
                <div key={team._id} style={{ padding: "0.6rem 0.75rem", borderRadius: "var(--radius-md)", background: isBidder ? "rgba(245,158,11,0.1)" : "var(--color-bg-surface)", border: `1px solid ${isBidder ? "rgba(245,158,11,0.4)" : "var(--color-border)"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: team.color || "var(--color-primary)" }} />
                    <span style={{ fontWeight: 700, fontSize: "0.8rem", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{team.name}</span>
                    <span style={{ fontWeight: 800, color: "var(--color-success)", fontSize: "0.8rem" }}>₹{team.remainingPurse}</span>
                  </div>
                  <div style={{ height: 3, borderRadius: "var(--radius-full)", background: "var(--color-bg-base)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: team.color || "var(--color-primary)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Auction Area (Center) */}
        <main 
          className={`auction-main-area ${activeMobileTab === "auction" ? "mobile-visible" : ""}`}
          style={{ flex: 1, padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
        >
          {phase === "not_started" ? (
             <div style={{ textAlign: "center" }}>
               <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏸</div>
               <h2 style={{ fontWeight: 900, fontSize: "1.5rem" }}>Waiting for Kickoff</h2>
               <p style={{ color: "var(--color-text-muted)" }}>Admin will start the auction shortly</p>
             </div>
          ) : !currentPlayer ? (
             <div style={{ textAlign: "center" }}>
               <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⏳</div>
               <p style={{ color: "var(--color-text-muted)" }}>Preparing next player...</p>
             </div>
          ) : (
            <div style={{ width: "100%", maxWidth: 480 }}>
              {/* Player Info Card */}
              <motion.div 
                key={currentPlayer._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="card-elevated" 
                style={{ padding: "2rem", borderRadius: "var(--radius-xl)", marginBottom: "1.25rem", textAlign: "center", border: "1px solid rgba(99,102,241,0.2)" }}
              >
                <div style={{ width: 100, height: 100, borderRadius: "20%", background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))", margin: "0 auto 1.25rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", boxShadow: "var(--shadow-glow-primary)" }}>
                  {currentPlayer.photo ? <img src={currentPlayer.photo} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} /> : "🏸"}
                </div>
                <h2 style={{ fontWeight: 900, fontSize: "1.8rem", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>{currentPlayer.name}</h2>
                <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
                   {[currentPlayer.category, currentPlayer.year, currentPlayer.hostel].map(t => (
                     <span key={t} style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", background: "var(--color-bg-overlay)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-full)", fontWeight: 700 }}>{t}</span>
                   ))}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontWeight: 800 }}>BASE: ₹{currentPlayer.basePrice}</div>
              </motion.div>

              {/* Bid & Timer */}
              <div className="card-elevated" style={{ padding: "1.5rem", borderRadius: "var(--radius-xl)", textAlign: "center", marginBottom: "1.25rem", background: "var(--color-bg-surface)", border: "1px solid var(--color-border-bright)", position: "relative" }}>
                {phase === "active" && <div className="pulse-primary" style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", fontSize: "0.6rem", fontWeight: 900, color: "var(--color-primary)", letterSpacing: "0.2em" }}>LIVE BIDDING</div>}
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                   <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", fontWeight: 800, letterSpacing: "0.05em" }}>CURRENT BID</div>
                      <div className="auction-number gradient-text" style={{ fontSize: "3.2rem", fontWeight: 950, lineHeight: 1 }}>₹{currentBid}</div>
                      {currentBidder && <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", fontWeight: 600, marginTop: "0.25rem" }}>by {currentBidder.name}</div>}
                   </div>
                   <div style={{ width: 80, height: 80, borderRadius: "50%", border: `4px solid ${timerColor}20`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: `${timerColor}05` }}>
                      <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", fontWeight: 800 }}>SEC</div>
                      <div className="auction-number" style={{ fontSize: "2rem", fontWeight: 950, color: timerColor, lineHeight: 1 }}>{timerSeconds}</div>
                   </div>
                </div>
              </div>

              {/* Captain Controls - Sticky Bottom on Mobile */}
              {user?.role === "captain" && phase === "active" && (
                <div className="captain-bid-bar">
                   <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.75rem" }}>
                      {[10, 20, 50, 100].map(inc => (
                        <button key={inc} onClick={() => setBidAmount(prev => prev + inc)} className="btn-ghost" style={{ flex: 1, padding: "0.5rem", fontSize: "0.8rem", fontWeight: 900, borderRadius: "var(--radius-md)" }}>+{inc}</button>
                      ))}
                   </div>
                   <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                      <div style={{ flex: 1, background: "var(--color-bg-base)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", padding: "0.4rem 0.75rem", textAlign: "center" }}>
                        <div style={{ fontSize: "0.55rem", color: "var(--color-text-muted)", fontWeight: 800 }}>YOUR BID</div>
                        <div className="auction-number" style={{ fontSize: "1.25rem", fontWeight: 900, color: "white" }}>₹{bidAmount}</div>
                      </div>
                      <button 
                        onClick={handleBid}
                        className="btn-accent glow-accent" 
                        disabled={isSquadFull || !canAfford || bidAmount <= currentBid}
                        style={{ height: "3.25rem", flex: 1.5, borderRadius: "var(--radius-lg)", fontSize: "1rem", fontWeight: 950, boxShadow: "0 8px 24px rgba(245,158,11,0.25)" }}
                      >
                        <Gavel size={20} /> BID NOW
                      </button>
                   </div>
                   {!canAfford && <div style={{ color: "var(--color-danger)", fontSize: "0.7rem", textAlign: "center", marginTop: "0.5rem", fontWeight: 700 }}>⚠️ Insufficient Purse!</div>}
                   {showWarning && canAfford && <div style={{ color: "var(--color-warning)", fontSize: "0.7rem", textAlign: "center", marginTop: "0.5rem", fontWeight: 700 }}>⚠️ Low purse warning</div>}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Bid History (Right) */}
        <aside 
          className={`auction-sidebar right ${activeMobileTab === "history" ? "mobile-visible" : ""}`}
          style={{ width: 300, borderLeft: "1px solid var(--color-border)", background: "var(--color-bg-base)", overflowY: "auto", padding: "1rem" }}
        >
          <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>All Bidding History</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {bidHistory.length === 0 ? <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>No history yet</div> : (
              bidHistory.map((b, i) => (
                <div key={i} style={{ padding: "0.6rem 0.8rem", borderRadius: "var(--radius-md)", background: i === 0 ? "rgba(245,158,11,0.1)" : "var(--color-bg-surface)", border: `1px solid ${i === 0 ? "rgba(245,158,11,0.3)" : "var(--color-border)"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                    <span style={{ fontWeight: 800, color: i === 0 ? "var(--color-accent)" : "white" }}>₹{b.amount}</span>
                    <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>{new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600 }}>{b.playerName}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>{b.teamName}</div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {/* Mobile Tab Bar - Positioned above universal bottom nav */}
      <nav className="mobile-only" style={{ 
        height: 60, 
        background: "var(--color-bg-surface)", 
        borderTop: "1px solid var(--color-border)", 
        display: "flex", 
        position: "fixed",
        bottom: "var(--mobile-nav-height)",
        left: 0,
        right: 0,
        zIndex: 100 
      }}>
        {[
          { id: "teams", icon: Users, label: "Teams" },
          { id: "auction", icon: Trophy, label: "Auction" },
          { id: "history", icon: History, label: "History" }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveMobileTab(t.id as any)}
            style={{ 
              flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.25rem",
              color: activeMobileTab === t.id ? "var(--color-primary)" : "var(--color-text-muted)", cursor: "pointer"
            }}
          >
            <t.icon size={20} />
            <span style={{ fontSize: "0.6rem", fontWeight: 700 }}>{t.label}</span>
          </button>
        ))}
      </nav>

      <style jsx>{`
        .auction-layout { height: calc(100vh - 64px); }
        @media (max-width: 900px) {
          .auction-layout { height: calc(100vh - 124px - var(--mobile-nav-height)); }
          .auction-sidebar { 
            position: absolute; inset: 0; width: 100% !important; z-index: 10; 
            display: none; 
          }
          .auction-sidebar.mobile-visible { display: block; }
          .auction-main-area { display: none; }
          .auction-main-area.mobile-visible { display: flex; }
          
          .captain-bid-bar {
            position: fixed;
            bottom: calc(60px + var(--mobile-nav-height));
            left: 0;
            right: 0;
            background: rgba(10, 11, 15, 0.95);
            backdrop-filter: blur(16px);
            padding: 0.75rem 1rem;
            border-top: 1px solid var(--color-border-bright);
            z-index: 50;
            animation: slide-up 0.3s ease-out;
          }
        }
      `}</style>
    </div>
  );
}
