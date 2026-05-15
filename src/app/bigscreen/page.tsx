"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuctionSocket } from "@/socket/useAuctionSocket";
import { useAuctionStore } from "@/store/useAuctionStore";
import { formatTimer, getTimerColor } from "@/lib/utils";

export default function BigScreenPage() {
  useAuctionSocket();
  const { phase, currentPlayer, currentBid, currentBidder, timerSeconds } = useAuctionStore();
  const timerColor = getTimerColor(timerSeconds);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-base)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
      {/* Radial background */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Logo */}
      <div style={{ position: "fixed", top: "2rem", left: "2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "2rem" }}>🏸</span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem" }}>HBL Auction</span>
      </div>

      {phase === "not_started" ? (
        <div>
          <div style={{ fontSize: "6rem", marginBottom: "1.5rem" }}>🏸</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "4rem", fontWeight: 900, marginBottom: "1rem" }}>Hostel Badminton League</h1>
          <p style={{ fontSize: "1.5rem", color: "var(--color-text-secondary)" }}>Auction starts soon...</p>
        </div>
      ) : !currentPlayer ? (
        <div>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⏳</div>
          <p style={{ fontSize: "2rem", color: "var(--color-text-secondary)" }}>Preparing next player...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={currentPlayer._id} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.5 }} style={{ width: "100%", maxWidth: 900 }}>
            {/* Player */}
            <div style={{ width: 160, height: 160, borderRadius: "var(--radius-xl)", background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem", margin: "0 auto 2rem", boxShadow: "var(--shadow-glow-primary)" }}>
              {currentPlayer.photo ? <img src={currentPlayer.photo} alt={currentPlayer.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} /> : "🏸"}
            </div>

            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "5rem", fontWeight: 900, lineHeight: 1, marginBottom: "1rem" }}>{currentPlayer.name}</h1>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
              {[currentPlayer.category, currentPlayer.year, currentPlayer.hostel].map(tag => (
                <span key={tag} style={{ padding: "0.5rem 1.5rem", borderRadius: "var(--radius-full)", fontSize: "1.1rem", fontWeight: 600, background: "var(--color-bg-card)", border: "1px solid var(--color-border-bright)" }}>{tag}</span>
              ))}
            </div>

            {/* Bid & Timer row */}
            <div style={{ display: "flex", gap: "4rem", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "1rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>CURRENT BID</div>
                <div style={{ fontSize: "6rem", fontWeight: 900, color: "var(--color-accent)", fontFamily: "var(--font-display)", lineHeight: 1 }}>₹{currentBid}</div>
                {currentBidder && <div style={{ fontSize: "1.5rem", color: "var(--color-text-secondary)", marginTop: "0.5rem" }}>by {currentBidder.name}</div>}
              </div>

              <div style={{ width: 2, height: 100, background: "var(--color-border)", display: "flex" }} />

              <div>
                <div style={{ fontSize: "1rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>TIME LEFT</div>
                <div style={{ fontSize: "6rem", fontFamily: "var(--font-mono)", fontWeight: 900, color: timerColor, lineHeight: 1 }}>{formatTimer(timerSeconds)}</div>
              </div>
            </div>

            {/* Timer bar */}
            <div style={{ marginTop: "2rem", height: 8, background: "var(--color-bg-elevated)", borderRadius: "var(--radius-full)", overflow: "hidden", maxWidth: 600, margin: "2rem auto 0" }}>
              <div style={{ height: "100%", width: `${(timerSeconds / 60) * 100}%`, background: timerColor, borderRadius: "var(--radius-full)", transition: "width 1s linear" }} />
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
