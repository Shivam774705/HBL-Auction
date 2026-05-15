import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 100) {
    return `₹${amount}`;
  }
  return `₹${amount}`;
}

export function getBidIncrement(currentBid: number): number {
  if (currentBid < 100) return 5;
  if (currentBid < 200) return 10;
  return 20;
}

export function calculatePursePerTeam(
  totalBaseValue: number,
  numTeams: number
): number {
  if (numTeams === 0) return 0;
  return Math.round((totalBaseValue / numTeams) * 1.35);
}

export function calculateMaxBid(
  remainingPurse: number,
  rosterSize: number,
  maxPlayers: number,
  cheapestRemainingPrice: number
): number {
  const remainingSlots = maxPlayers - rosterSize;
  if (remainingSlots <= 1) return remainingPurse;
  return remainingPurse - (remainingSlots - 1) * cheapestRemainingPrice;
}

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function getTimerColor(seconds: number): string {
  if (seconds <= 10) return "#ef4444";
  if (seconds <= 20) return "#f59e0b";
  return "#10b981";
}

export function validateSquad(players: Array<{ year: string; category: string }>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const years = ["1st", "2nd", "3rd", "4th"] as const;

  for (const year of years) {
    const count = players.filter((p) => p.year === year).length;
    if (count < 2) {
      errors.push(`Must have at least 2 players from ${year} year`);
    }
  }

  const topCount = players.filter((p) => p.category === "Top").length;
  const bestCount = players.filter((p) => p.category === "Best").length;

  if (topCount > 2) errors.push("Maximum 2 Top category players allowed");
  if (bestCount > 3) errors.push("Maximum 3 Best category players allowed");

  return { valid: errors.length === 0, errors };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
