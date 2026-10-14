import type { Client } from "../types/client";

// Convert seconds into HH:MM:SS
export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

// Calculate a client's remaining countdown time
export function getRemaining(client: Client, now: number): number {
  if (client.status !== "running" || client.endsAt === null || now === 0) {
    return client.seconds;
  }

  return Math.max(
    0,
    // A new server deadline can arrive before the display clock refreshes.
    Math.min(client.seconds, Math.ceil((client.endsAt - now) / 1000)),
  );
}
