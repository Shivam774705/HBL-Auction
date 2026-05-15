import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Hostel Badminton League — Auction System",
    template: "%s | HBL Auction",
  },
  description:
    "Real-time IPL-style player auction platform for the Hostel Badminton League. Live bidding, team management, and standings.",
  keywords: ["auction", "badminton", "hostel", "sports", "league"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border-bright)",
              color: "var(--color-text-primary)",
            },
          }}
        />
      </body>
    </html>
  );
}
