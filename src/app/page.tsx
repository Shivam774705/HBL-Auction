"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Zap, Users, BarChart3, ArrowRight, Shield, Wifi } from "lucide-react";

const FEATURES = [
  { icon: Zap, title: "Real-Time Bidding", desc: "Live Socket.IO auction with instant bid updates across all devices" },
  { icon: Users, title: "Team Management", desc: "Auto-purse calculation, squad fairness rules, and roster tracking" },
  { icon: BarChart3, title: "Live Analytics", desc: "Purse charts, category distribution, and strength radars" },
  { icon: Shield, title: "Role-Based Access", desc: "Separate admin and captain dashboards with JWT security" },
  { icon: Trophy, title: "Standings & Fixtures", desc: "Auto-generated round-robin fixtures and real-time points table" },
  { icon: Wifi, title: "Big Screen Mode", desc: "Fullscreen projector view for live event display" },
];

export default function LandingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--color-bg-base)" }}>
      {/* Animated background grid */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(245,158,11,0.08) 0%, transparent 50%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header
        className="glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: "1px solid var(--color-border)",
          borderRadius: 0,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "1rem 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
              }}
            >
              🏸
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", lineHeight: 1 }}>
                HBL Auction
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Hostel Badminton League</div>
            </div>
          </div>
          <Link href="/login" className="btn-primary" style={{ textDecoration: "none" }}>
            Login <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "6rem 2rem 4rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 1rem",
              borderRadius: "var(--radius-full)",
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "var(--color-primary)",
              fontSize: "0.8rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--color-primary)",
                animation: "pulse-ring 1.5s infinite",
                display: "inline-block",
              }}
            />
            LIVE AUCTION PLATFORM
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: "1.5rem",
            }}
          >
            Hostel Badminton
            <br />
            <span className="gradient-text">League Auction</span>
          </h1>
          <p
            style={{
              fontSize: "1.15rem",
              color: "var(--color-text-secondary)",
              maxWidth: 560,
              margin: "0 auto 2.5rem",
              lineHeight: 1.7,
            }}
          >
            IPL-style real-time player auction system. Live bidding, instant purse updates, squad management — all in one platform.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" className="btn-primary" style={{ textDecoration: "none", fontSize: "1rem", padding: "0.75rem 2rem" }}>
              Start Auction <ArrowRight size={18} />
            </Link>
            <Link href="/bigscreen" className="btn-ghost" style={{ textDecoration: "none", fontSize: "1rem", padding: "0.75rem 2rem" }}>
              Big Screen Mode
            </Link>
          </div>
        </motion.div>

        {/* Live ticker */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{ marginTop: "4rem", maxWidth: 800, margin: "4rem auto 0" }}
        >
          <div
            className="card-elevated glow-primary"
            style={{
              padding: "2rem",
              borderRadius: "var(--radius-xl)",
              background: "var(--color-bg-card)",
              border: "1px solid rgba(99,102,241,0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              {/* Current player mock */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "var(--radius-lg)",
                    background: "linear-gradient(135deg, var(--color-primary), #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                  }}
                >
                  🏸
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Current Player
                  </div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>Arjun Sharma</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>Top Category · 3rd Year</div>
                </div>
              </div>

              {/* Current bid */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Current Bid</div>
                <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--color-accent)", fontFamily: "var(--font-display)" }}>₹240</div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>by Hostel 7</div>
              </div>

              {/* Timer */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Time Left</div>
                <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--color-success)", fontFamily: "var(--font-mono)" }}>0:23</div>
                <div
                  style={{
                    width: 120,
                    height: 4,
                    background: "var(--color-bg-elevated)",
                    borderRadius: "var(--radius-full)",
                    overflow: "hidden",
                    marginTop: "0.25rem",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: "38%",
                      background: "var(--color-success)",
                      borderRadius: "var(--radius-full)",
                      transition: "width 1s linear",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ position: "relative", zIndex: 1, padding: "4rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, marginBottom: "3rem" }}>
          Everything you need for a{" "}
          <span className="gradient-text">professional auction</span>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                transition: "border-color 0.2s, transform 0.2s",
                cursor: "default",
              }}
              whileHover={{ y: -4, borderColor: "var(--color-border-bright)" }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius-md)",
                  background: "rgba(99,102,241,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <f.icon size={22} color="var(--color-primary)" />
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>{f.title}</h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "4rem 2rem 6rem" }}>
        <div
          className="card-elevated"
          style={{
            maxWidth: 600,
            margin: "0 auto",
            padding: "3rem",
            borderRadius: "var(--radius-xl)",
            border: "1px solid rgba(99,102,241,0.3)",
            background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(245,158,11,0.05))",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏆</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, marginBottom: "1rem" }}>
            Ready to start?
          </h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
            Login as admin to set up captains, add players, and run the live auction.
          </p>
          <Link href="/login" className="btn-accent" style={{ textDecoration: "none", fontSize: "1rem", padding: "0.875rem 2.5rem" }}>
            Get Started →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--color-border)", textAlign: "center", padding: "1.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
        🏸 Hostel Badminton League Auction System
      </footer>
    </main>
  );
}
