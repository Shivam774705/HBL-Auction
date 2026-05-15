"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Gavel, Trophy, Users } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CaptainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user || user.role !== "captain") {
      router.push("/login");
    }
  }, [user, router]);

  if (!mounted || !user) return null;

  const navItems = [
    { href: "/captain", label: "Home", icon: LayoutDashboard },
    { href: "/captain/auction", label: "Bidding", icon: Gavel },
    { href: "/captain/team", label: "My Team", icon: Trophy },
    { href: "/captain/standings", label: "Standings", icon: Users },
  ];

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "var(--mobile-nav-height)" }}>
      {/* Desktop Sidebar (Optional, but let's keep it mobile-first) */}
      <main style={{ paddingBottom: "2rem" }}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`bottom-nav-item ${isActive ? "active" : ""}`}>
              <Icon size={24} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
