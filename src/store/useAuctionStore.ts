"use client";

import { create } from "zustand";

interface Player {
  _id: string;
  name: string;
  hostel: string;
  year: string;
  category: string;
  photo?: string;
  basePrice: number;
  soldPrice?: number;
  auctionStatus: string;
  skills?: string[];
}

interface Team {
  _id: string;
  name: string;
  hostel: string;
  color: string;
}

interface BidEntry {
  playerName: string;
  teamId: string;
  teamName: string;
  amount: number;
  timestamp: Date;
}

interface AuctionStore {
  phase: "not_started" | "active" | "paused" | "completed";
  currentPlayer: Player | null;
  currentBid: number;
  currentBidder: Team | null;
  timerSeconds: number;
  timerRunning: boolean;
  bidHistory: BidEntry[];
  soldCount: number;
  unsoldCount: number;

  setPhase: (phase: AuctionStore["phase"]) => void;
  setCurrentPlayer: (player: Player | null, basePrice: number) => void;
  updateBid: (teamId: string, teamName: string, amount: number) => void;
  setCurrentBidder: (team: Team | null) => void;
  setTimer: (seconds: number, running: boolean) => void;
  tickTimer: (seconds: number) => void;
  incrementSold: () => void;
  incrementUnsold: () => void;
  resetBidHistory: () => void;
  resetAuction: () => void;
  syncState: (data: any) => void;
}

export const useAuctionStore = create<AuctionStore>((set) => ({
  phase: "not_started",
  currentPlayer: null,
  currentBid: 0,
  currentBidder: null,
  timerSeconds: 60,
  timerRunning: false,
  bidHistory: [],
  soldCount: 0,
  unsoldCount: 0,

  setPhase: (phase) => set({ phase }),

  setCurrentPlayer: (player, basePrice) =>
    set({ 
      currentPlayer: player, 
      currentBid: basePrice, 
      currentBidder: null 
      // Removed bidHistory: [] to keep persistence across players
    }),

  updateBid: (teamId, teamName, amount) =>
    set((state) => ({
      currentBid: amount,
      currentBidder: { _id: teamId, name: teamName } as any,
      bidHistory: [
        { 
          playerName: state.currentPlayer?.name || "Unknown", 
          teamId, 
          teamName, 
          amount, 
          timestamp: new Date() 
        },
        ...state.bidHistory.slice(0, 99), // Keep more history entries
      ],
    })),

  setCurrentBidder: (team) => set({ currentBidder: team }),

  setTimer: (seconds, running) => set({ timerSeconds: seconds, timerRunning: running }),

  tickTimer: (seconds) => set({ timerSeconds: seconds }),

  incrementSold: () => set((s) => ({ soldCount: s.soldCount + 1 })),
  incrementUnsold: () => set((s) => ({ unsoldCount: s.unsoldCount + 1 })),

  resetBidHistory: () => set({ bidHistory: [], currentBid: 0, currentBidder: null }),

  resetAuction: () =>
    set({
      phase: "not_started",
      currentPlayer: null,
      currentBid: 0,
      currentBidder: null,
      timerSeconds: 60,
      timerRunning: false,
      bidHistory: [],
      soldCount: 0,
      unsoldCount: 0,
    }),

  syncState: (data) => {
    if (!data) return;
    set({
      phase: data.phase || "not_started",
      currentPlayer: data.currentPlayer || null,
      currentBid: data.currentBid || 0,
      currentBidder: data.currentBidder || null,
      timerSeconds: data.timerSeconds ?? 60,
      timerRunning: data.timerRunning || false,
      soldCount: data.soldCount || 0,
      unsoldCount: data.unsoldCount || 0,
    });
  },
}));
