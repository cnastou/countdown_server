import type { Client } from "../types/client";
import { formatTime, getRemaining } from "../utils/timer";

type ClientTimerCardProps = {
  client: Client;
  now: number;
  busy?: boolean;
  onStart: (clientId: string) => void;
  onPause: (clientId: string) => void;
  onReset: (clientId: string) => void;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
};

export default function ClientTimerCard({
  client,
  now,
  busy = false,
  onStart,
  onPause,
  onReset,
  onEdit,
  onDelete,
}: ClientTimerCardProps) {
  const remaining = getRemaining(client, now);

  const progress =
    client.initialSeconds > 0 ? (remaining / client.initialSeconds) * 100 : 0;

  return (
    <article className="client-card">
      <div className="client-card-content">
        <div className="client-header">
          <h3 className="client-name">{client.name}</h3>

          <button
            type="button"
            className="btn btn-delete"
            disabled={busy}
            onClick={() => onDelete(client.id)}
            aria-label={`Delete ${client.name}`}
          >
            Delete
          </button>
        </div>

        <div
          className="timer-display"
          aria-label={`Remaining time ${formatTime(remaining)}`}
        >
          {formatTime(remaining)}
        </div>

        <div className="status-row">
          <span className={`status-badge status-${client.status}`}>
            {client.status}
          </span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${Math.max(0, Math.min(100, progress))}%`,
            }}
          />
        </div>
      </div>

      {/* Timer controls */}
      <div className="timer-actions">
        {client.status === "running" ? (
          <button
            type="button"
            className="btn btn-pause"
            disabled={busy}
            onClick={() => onPause(client.id)}
          >
            ⏸ Pause
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-start"
            disabled={busy || remaining <= 0 || client.status === "completed"}
            onClick={() => onStart(client.id)}
          >
            ▶ Start
          </button>
        )}

        <button
          type="button"
          className="btn btn-secondary"
          disabled={busy}
          onClick={() => onReset(client.id)}
        >
          ↺ Reset
        </button>

        <button
          type="button"
          className="btn btn-primary"
          disabled={busy || client.status === "running"}
          onClick={() => onEdit(client)}
          title={
            client.status === "running"
              ? "Pause the timer before editing"
              : "Edit countdown duration"
          }
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          Edit
        </button>
      </div>
    </article>
  );
}
