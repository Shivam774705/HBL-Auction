"use client";

import { create } from "zustand";

interface TeamEntry {
  _id: string;
  name: string;
  hostel: string;
  color: string;
  logo?: string;
  totalPurse: number;
  spentPurse: number;
  remainingPurse: number;
  players: string[];
  maxPlayers: number;
}

interface TeamStore {
  teams: TeamEntry[];
  setTeams: (teams: TeamEntry[]) => void;
  updateTeamPurse: (teamId: string, remaining: number, spent: number) => void;
  addPlayerToTeam: (teamId: string, playerId: string) => void;
}

export const useTeamStore = create<TeamStore>((set) => ({
  teams: [],
  setTeams: (teams) => set({ teams }),
  updateTeamPurse: (teamId, remaining, spent) =>
    set((state) => ({
      teams: state.teams.map((t) =>
        t._id === teamId ? { ...t, remainingPurse: remaining, spentPurse: spent } : t
      ),
    })),
  addPlayerToTeam: (teamId, playerId) =>
    set((state) => ({
      teams: state.teams.map((t) =>
        t._id === teamId ? { ...t, players: [...t.players, playerId] } : t
      ),
    })),
}));
