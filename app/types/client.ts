export type ClientStatus = "ready" | "running" | "paused" | "completed";

export type Client = {
  id: string;
  name: string;
  seconds: number;
  initialSeconds: number;
  status: ClientStatus;
  endsAt: number | null;
};
