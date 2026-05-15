"use client";

import Link from "next/link";
import { ShieldOff, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-base)",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "var(--radius-lg)",
          background: "rgba(239,68,68,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}
      >
        <ShieldOff size={36} color="var(--color-danger)" />
      </div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, marginBottom: "0.75rem" }}>
        Access Denied
      </h1>
      <p style={{ color: "var(--color-text-secondary)", maxWidth: 400, marginBottom: "2rem" }}>
        You don&apos;t have permission to access this page. Please login with the appropriate account.
      </p>
      <Link href="/login" className="btn-primary" style={{ textDecoration: "none" }}>
        <ArrowLeft size={16} /> Back to Login
      </Link>
    </div>
  );
}
