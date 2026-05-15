"use client";

import { useEffect, useCallback } from "react";
import { connectSocket, disconnectSocket, getSocket } from "./socketClient";
import { useAuctionStore } from "@/store/useAuctionStore";
import { useTeamStore } from "@/store/useTeamStore";
import { toast } from "sonner";

export function useAuctionSocket() {
  const {
    setPhase,
    setCurrentPlayer,
    updateBid,
    tickTimer,
    setTimer,
    incrementSold,
    incrementUnsold,
    syncState,
  } = useAuctionStore();

  const { updateTeamPurse, addPlayerToTeam } = useTeamStore();

  useEffect(() => {
    const socket = connectSocket();

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket.id);
      socket.emit("getState");
    });

    socket.on("auctionState", (data: any) => {
      syncState(data);
    });

    socket.on("auctionPhase", ({ phase }: { phase: "not_started" | "active" | "paused" | "completed" }) => {
      setPhase(phase);
    });

    socket.on("newPlayer", ({ player, basePrice }: { player: unknown; basePrice: number }) => {
      setCurrentPlayer(player as Parameters<typeof setCurrentPlayer>[0], basePrice);
    });

    socket.on("bidUpdate", ({ teamId, teamName, amount }: { teamId: string; teamName?: string; amount: number }) => {
      updateBid(teamId, teamName || "", amount);
    });

    socket.on("timerTick", ({ seconds }: { seconds: number }) => {
      tickTimer(seconds);
    });

    socket.on("timerStop", ({ seconds }: { seconds: number }) => {
      setTimer(seconds, false);
    });

    socket.on("timerExpired", () => {
      tickTimer(0);
      setTimer(0, false);
    });

    socket.on("playerSold", ({ player, team, soldPrice }: { player: { _id: string }; team: { _id: string }; soldPrice: number }) => {
      incrementSold();
      addPlayerToTeam(team._id, player._id);
    });

    socket.on("playerUnsold", () => {
      incrementUnsold();
    });

    socket.on("auctionReset", () => {
      toast.info("Auction has been reset by admin.");
      setTimeout(() => window.location.reload(), 1500);
    });

    socket.on("purseUpdate", ({ teamId, remaining, spent }: { teamId: string; remaining: number; spent: number }) => {
      updateTeamPurse(teamId, remaining, spent);
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("auctionPhase");
      socket.off("newPlayer");
      socket.off("bidUpdate");
      socket.off("timerTick");
      socket.off("timerStop");
      socket.off("timerExpired");
      socket.off("playerSold");
      socket.off("playerUnsold");
      socket.off("purseUpdate");
      socket.off("disconnect");
      disconnectSocket();
    };
  }, [setPhase, setCurrentPlayer, updateBid, tickTimer, setTimer, incrementSold, incrementUnsold, updateTeamPurse, addPlayerToTeam]);

  const placeBid = useCallback((teamId: string, captainId: string, amount: number) => {
    getSocket().emit("bid", { teamId, captainId, amount });
  }, []);

  const requestState = useCallback(() => {
    getSocket().emit("getState");
  }, []);

  return { placeBid, requestState };
}
