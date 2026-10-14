import { randomUUID } from "node:crypto";
import { db } from "./database.server";
import { initializeDatabase } from "./init.server";
import type { Client } from "../types/client";

// Ensure the clients table exists.
initializeDatabase();

type ClientRow = {
  id: string;
  name: string;
  seconds: number;
  initial_seconds: number;
  status: Client["status"];
  ends_at: number | null;
};

// Convert SQLite snake_case fields into TypeScript camelCase.
function mapClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    seconds: row.seconds,
    initialSeconds: row.initial_seconds,
    status: row.status,
    endsAt: row.ends_at,
  };
}

// Get all clients.
export function getAllClients(): Client[] {
  completeExpiredTimers();

  const rows = db
    .prepare(
      `
      SELECT
        id,
        name,
        seconds,
        initial_seconds,
        status,
        ends_at
      FROM clients
      ORDER BY rowid ASC
    `,
    )
    .all() as ClientRow[];

  return rows.map(mapClient);
}

// Get one client by ID.
export function getClientById(clientId: string): Client | null {
  completeExpiredTimers();

  const row = db
    .prepare(
      `
      SELECT
        id,
        name,
        seconds,
        initial_seconds,
        status,
        ends_at
      FROM clients
      WHERE id = ?
    `,
    )
    .get(clientId) as ClientRow | undefined;

  return row ? mapClient(row) : null;
}

// Create a new client.
export function createClient(clientName: string): Client {
  const name = clientName.trim();

  if (!name) {
    throw new Error("Client name cannot be empty");
  }

  const client: Client = {
    id: randomUUID(),
    name,
    seconds: 0,
    initialSeconds: 0,
    status: "ready",
    endsAt: null,
  };

  db.prepare(
    `
    INSERT INTO clients (
      id,
      name,
      seconds,
      initial_seconds,
      status,
      ends_at
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `,
  ).run(
    client.id,
    client.name,
    client.seconds,
    client.initialSeconds,
    client.status,
    client.endsAt,
  );

  return client;
}

// Rename an existing client.
export function renameClient(clientId: string, clientName: string): boolean {
  const name = clientName.trim();

  if (!name) {
    throw new Error("Client name cannot be empty");
  }

  const result = db
    .prepare(
      `
      UPDATE clients
      SET name = ?
      WHERE id = ?
    `,
    )
    .run(name, clientId);

  return result.changes > 0;
}

// Configure a client's countdown duration.
export function updateClientDuration(
  clientId: string,
  durationSeconds: number,
): boolean {
  if (!Number.isSafeInteger(durationSeconds) || durationSeconds < 0) {
    throw new Error("Duration must be a non-negative integer");
  }

  const result = db
    .prepare(
      `
      UPDATE clients
      SET
        seconds = ?,
        initial_seconds = ?,
        status = 'ready',
        ends_at = NULL
      WHERE id = ?
    `,
    )
    .run(durationSeconds, durationSeconds, clientId);

  return result.changes > 0;
}

// Start or resume a countdown.
export function startClientTimer(clientId: string): boolean {
  // Use the database clock for the deadline.
  const result = db
    .prepare(
      `
      UPDATE clients
      SET
        status = 'running',
        ends_at =
          CAST(unixepoch('subsec') * 1000 AS INTEGER)
          + (seconds * 1000)
      WHERE id = ?
        AND status IN ('ready', 'paused')
        AND seconds > 0
    `,
    )
    .run(clientId);

  return result.changes > 0;
}

// Pause a countdown and save its remaining seconds.
export function pauseClientTimer(clientId: string): boolean {
  const result = db
    .prepare(
      `
      UPDATE clients
      SET
        seconds = MAX(
          0,
          CAST(
            (
              ends_at -
              CAST(unixepoch('subsec') * 1000 AS INTEGER)
              + 999
            ) / 1000 AS INTEGER
          )
        ),
        status = CASE
          WHEN ends_at <=
            CAST(unixepoch('subsec') * 1000 AS INTEGER)
          THEN 'completed'
          ELSE 'paused'
        END,
        ends_at = NULL
      WHERE id = ?
        AND status = 'running'
        AND ends_at IS NOT NULL
    `,
    )
    .run(clientId);

  return result.changes > 0;
}

// Reset a countdown to its original duration.
export function resetClientTimer(clientId: string): boolean {
  const result = db
    .prepare(
      `
      UPDATE clients
      SET
        seconds = initial_seconds,
        status = 'ready',
        ends_at = NULL
      WHERE id = ?
    `,
    )
    .run(clientId);

  return result.changes > 0;
}

// Mark countdowns whose deadlines have passed as completed.
export function completeExpiredTimers(): number {
  const result = db
    .prepare(
      `
      UPDATE clients
      SET
        seconds = 0,
        status = 'completed',
        ends_at = NULL
      WHERE status = 'running'
        AND ends_at IS NOT NULL
        AND ends_at <=
          CAST(unixepoch('subsec') * 1000 AS INTEGER)
    `,
    )
    .run();

  return result.changes;
}

// Delete a client.
export function deleteClient(clientId: string): boolean {
  const result = db
    .prepare(
      `
      DELETE FROM clients
      WHERE id = ?
    `,
    )
    .run(clientId);

  return result.changes > 0;
}
