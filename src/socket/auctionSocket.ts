import type { Server as SocketIOServer, Socket } from "socket.io";
import connectDB from "@/lib/db";
import Auction from "@/models/Auction";
import Player from "@/models/Player";
import Team from "@/models/Team";
import Bid from "@/models/Bid";
import PurseHistory from "@/models/PurseHistory";

// In-memory auction timer
let auctionTimer: NodeJS.Timeout | null = null;
let timerSeconds = 60;

function getIncrement(currentBid: number): number {
  if (currentBid < 100) return 5;
  if (currentBid < 200) return 10;
  return 20;
}

async function persistBidToDB(
  playerId: string,
  teamId: string,
  captainId: string,
  amount: number,
  auctionId: string
): Promise<void> {
  await connectDB();
  const auction = await Auction.findById(auctionId);
  if (!auction) return;

  // Mark previous bids as not winning
  await Bid.updateMany({ player: playerId }, { isWinning: false });

  // Save new bid
  await Bid.create({
    auction: auctionId,
    player: playerId,
    team: teamId,
    captain: captainId,
    amount,
    isWinning: true,
  });
}

async function stopTimer(io: SocketIOServer) {
  if (auctionTimer) {
    clearInterval(auctionTimer);
    auctionTimer = null;
  }
  await Auction.updateOne({}, { timerRunning: false, timerSeconds });
  io.emit("timerStop", { seconds: timerSeconds });
}

async function startTimer(io: SocketIOServer, seconds: number = 60) {
  if (auctionTimer) clearInterval(auctionTimer);
  timerSeconds = seconds;

  await Auction.updateOne({}, { timerRunning: true, timerSeconds });

  auctionTimer = setInterval(async () => {
    timerSeconds--;
    io.emit("timerTick", { seconds: timerSeconds });

    if (timerSeconds <= 0) {
      clearInterval(auctionTimer!);
      auctionTimer = null;
      io.emit("timerExpired", {});
    }
  }, 1000);
}

export function registerAuctionHandlers(io: SocketIOServer, socket: Socket) {
  // Join rooms
  socket.on("joinRoom", (room: string) => {
    socket.join(room);
  });

  // Bid placed by captain
  socket.on("bid", async (data: { teamId: string; captainId: string; amount: number }) => {
    try {
      await connectDB();
      const auction = await Auction.findOne().lean();
      if (!auction || auction.phase !== "active") {
        socket.emit("bidError", { message: "Auction is not active" });
        return;
      }

      const minBid = (auction.currentBid || 0) + getIncrement(auction.currentBid || 0);
      if (data.amount < minBid) {
        socket.emit("bidError", { message: `Minimum bid is ${minBid}` });
        return;
      }

      const team = await Team.findById(data.teamId);
      if (!team || team.remainingPurse < data.amount) {
        socket.emit("bidError", { message: "Insufficient purse" });
        return;
      }

      await Auction.updateOne(
        {},
        { currentBid: data.amount, currentBidder: data.teamId }
      );

      await persistBidToDB(
        String(auction.currentPlayer),
        data.teamId,
        data.captainId,
        data.amount,
        String(auction._id)
      );

      // Reset timer
      await startTimer(io, 30);

      io.emit("bidUpdate", {
        teamId: data.teamId,
        teamName: team.name,
        amount: data.amount,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error("[Socket] bid error:", err);
      socket.emit("bidError", { message: "Server error" });
    }
  });

  // Admin: start auction
  socket.on("startAuction", async () => {
    try {
      await connectDB();
      await Auction.updateOne(
        {},
        { phase: "active", startedAt: new Date() },
        { upsert: true }
      );
      io.emit("auctionPhase", { phase: "active" });
    } catch (err) {
      console.error("[Socket] startAuction error:", err);
    }
  });

  // Admin: pause
  socket.on("pauseAuction", async () => {
    await stopTimer(io);
    await Auction.updateOne({}, { phase: "paused" });
    io.emit("auctionPhase", { phase: "paused" });
  });

  // Admin: resume
  socket.on("resumeAuction", async () => {
    await Auction.updateOne({}, { phase: "active" });
    await startTimer(io, timerSeconds);
    io.emit("auctionPhase", { phase: "active" });
  });

  // Admin: next player
  socket.on("nextPlayer", async (data: { playerId: string }) => {
    try {
      await connectDB();
      const player = await Player.findById(data.playerId).lean();
      if (!player) return;

      await Auction.updateOne(
        {},
        {
          currentPlayer: data.playerId,
          currentBid: player.basePrice,
          currentBidder: null,
          phase: "active",
        }
      );

      await startTimer(io, 60);

      io.emit("newPlayer", {
        player,
        basePrice: player.basePrice,
      });
    } catch (err) {
      console.error("[Socket] nextPlayer error:", err);
    }
  });

  // Admin: sold
  socket.on("soldPlayer", async (data: { playerId: string; teamId: string; soldPrice: number }) => {
    try {
      await connectDB();
      const [player, team] = await Promise.all([
        Player.findById(data.playerId),
        Team.findById(data.teamId),
      ]);

      if (!player || !team) return;

      const prevPurse = team.remainingPurse;
      player.auctionStatus = "sold";
      player.soldPrice = data.soldPrice;
      player.team = team._id as typeof team._id;
      await player.save();

      team.players.push(player._id as typeof player._id);
      team.spentPurse += data.soldPrice;
      team.remainingPurse -= data.soldPrice;
      await team.save();

      await PurseHistory.create({
        team: team._id,
        action: "debit",
        amount: data.soldPrice,
        reason: `Purchased ${player.name}`,
        balanceBefore: prevPurse,
        balanceAfter: team.remainingPurse,
        player: player._id,
        performedBy: "auction",
      });

      await Auction.updateOne(
        {},
        { $inc: { soldCount: 1 }, currentBid: 0, currentBidder: null }
      );

      io.emit("playerSold", {
        player: { _id: player._id, name: player.name, photo: player.photo },
        team: { _id: team._id, name: team.name },
        soldPrice: data.soldPrice,
      });

      io.emit("purseUpdate", {
        teamId: team._id,
        remaining: team.remainingPurse,
        spent: team.spentPurse,
      });
    } catch (err) {
      console.error("[Socket] soldPlayer error:", err);
    }
  });

  // Admin: unsold
  socket.on("unsoldPlayer", async (data: { playerId: string }) => {
    try {
      await connectDB();
      await Player.findByIdAndUpdate(data.playerId, { auctionStatus: "unsold" });
      const auction = await Auction.findOne();
      if (auction) {
        auction.unsoldPlayers.push(data.playerId as unknown as typeof auction.unsoldPlayers[0]);
        auction.unsoldCount++;
        await auction.save();
      }
      io.emit("playerUnsold", { playerId: data.playerId });
    } catch (err) {
      console.error("[Socket] unsoldPlayer error:", err);
    }
  });

  // Admin: stop timer
  socket.on("stopTimer", async () => {
    await stopTimer(io);
  });

  // Admin: start timer
  socket.on("startTimer", async (data: { seconds?: number }) => {
    await startTimer(io, data.seconds || 60);
  });

  // Broadcast current state on request
  socket.on("getState", async () => {
    try {
      await connectDB();
      const auction = await Auction.findOne()
        .populate("currentPlayer")
        .populate("currentBidder")
        .lean();
      socket.emit("auctionState", auction);
    } catch (err) {
      console.error("[Socket] getState error:", err);
    }
  });
}
