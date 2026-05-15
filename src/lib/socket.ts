import type { Server as SocketIOServer } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var __io: SocketIOServer | undefined;
}

export function getIO(): SocketIOServer | null {
  return global.__io || null;
}

export function emitToAll(event: string, data: unknown): void {
  const io = getIO();
  if (io) {
    console.log(`[Socket.IO] Emitting ${event} to all`);
    io.emit(event, data);
  } else {
    console.warn(`[Socket.IO] Cannot emit ${event}: io instance not found`);
  }
}

export function emitToRoom(room: string, event: string, data: unknown): void {
  const io = getIO();
  if (io) {
    io.to(room).emit(event, data);
  }
}
