import { useEffect, useState } from "react";
import type { Client } from "../types/client";

// The loader owns persisted clients; this hook only updates their display time.
export function useCountdownTimers(storedClients: Client[]) {
  const [now, setNow] = useState(0);
  const hasRunningTimers = storedClients.some(
    (client) => client.status === "running",
  );

  useEffect(() => {
    setNow(Date.now());
    if (!hasRunningTimers) return;

    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [hasRunningTimers, storedClients]);

  const clients: Client[] = storedClients.map((client) =>
    now > 0 &&
    client.status === "running" &&
    client.endsAt !== null &&
    client.endsAt <= now
      ? { ...client, seconds: 0, endsAt: null, status: "completed" }
      : client,
  );

  return { clients, now };
}
