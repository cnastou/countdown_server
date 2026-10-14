import { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";

import {
  getAllClients,
  createClient,
  deleteClient,
  updateClientDuration,
  startClientTimer,
  pauseClientTimer,
  resetClientTimer,
} from "../db/clientRepository.server";

import type { Client } from "../types/client";
import type { Route } from "./+types/home";
import DashboardStats from "../components/DashboardStats";
import ClientTimerCard from "../components/ClientTimerCard";
import AddClientModal from "../components/AddClientModal";
import DeleteClientModal from "../components/DeleteClientModal";
import EditTimerModal from "../components/EditTimerModal";
import { useCountdownTimers } from "../hooks/useCountdownTimers";

import "../styles/dashboard.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Countdown Control Center" },
    {
      name: "description",
      content: "Multi-client countdown timer administration",
    },
  ];
}

// ----------------------------------------
// SERVER: LOAD CLIENTS FROM SQLITE
// ----------------------------------------

export async function loader() {
  return {
    clients: getAllClients(),
  };
}

// ----------------------------------------
// SERVER: PROCESS CLIENT OPERATIONS
// ----------------------------------------

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();

  const intent = formData.get("intent");
  const clientId = formData.get("clientId");

  if (typeof intent !== "string") {
    return Response.json({ error: "Missing action" }, { status: 400 });
  }

  // CREATE
  if (intent === "add") {
    const name = formData.get("name");

    if (typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "Invalid client name" }, { status: 400 });
    }

    createClient(name);

    return { success: true };
  }

  if (typeof clientId !== "string" || !clientId) {
    return Response.json({ error: "Missing client ID" }, { status: 400 });
  }

  let updated = false;

  switch (intent) {
    // DELETE
    case "delete":
      updated = deleteClient(clientId);
      break;

    // START
    case "start":
      updated = startClientTimer(clientId);
      break;

    // PAUSE
    case "pause":
      updated = pauseClientTimer(clientId);
      break;

    // RESET
    case "reset":
      updated = resetClientTimer(clientId);
      break;

    // UPDATE DURATION
    case "update": {
      const rawSeconds = formData.get("seconds");

      const seconds =
        typeof rawSeconds === "string" && rawSeconds.trim() !== ""
          ? Number(rawSeconds)
          : NaN;

      if (!Number.isSafeInteger(seconds) || seconds < 0) {
        return Response.json({ error: "Invalid duration" }, { status: 400 });
      }

      updated = updateClientDuration(clientId, seconds);

      break;
    }

    default:
      return Response.json({ error: "Unknown action" }, { status: 400 });
  }

  if (!updated) {
    return Response.json(
      {
        error: "Client not found or operation not permitted",
      },
      { status: 409 },
    );
  }

  return { success: true };
}

export default function Home() {
  const { clients: storedClients } = useLoaderData<typeof loader>();
  const { clients, now } = useCountdownTimers(storedClients);
  const fetcher = useFetcher<typeof action>();
  const busy = fetcher.state !== "idle";
  const error =
    fetcher.data && "error" in fetcher.data
      ? String(fetcher.data.error)
      : undefined;

  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [clientToEdit, setClientToEdit] = useState<string | null>(null);
  const [editHours, setEditHours] = useState("0");
  const [editMinutes, setEditMinutes] = useState("0");
  const [editSeconds, setEditSeconds] = useState("0");

  // Keep a modal open on failure, and close it after the saved data reloads.
  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data &&
      "success" in fetcher.data &&
      fetcher.data.success
    ) {
      setShowAddModal(false);
      setNewClientName("");
      setClientToDelete(null);
      setClientToEdit(null);
    }
  }, [fetcher.state, fetcher.data]);

  const submit = (values: Record<string, string>) => {
    if (busy) return;
    void fetcher.submit(values, { method: "post" });
  };

  const cancelAddClient = () => {
    if (busy) return;
    setNewClientName("");
    setShowAddModal(false);
  };

  const openEditTimer = (client: Client) => {
    if (busy || client.status === "running") return;
    fetcher.reset();
    setEditHours(String(Math.floor(client.seconds / 3600)));
    setEditMinutes(String(Math.floor((client.seconds % 3600) / 60)));
    setEditSeconds(String(client.seconds % 60));
    setClientToEdit(client.id);
  };

  const hours = Number(editHours);
  const minutes = Number(editMinutes);
  const seconds = Number(editSeconds);
  const validDuration =
    editHours.trim() !== "" &&
    editMinutes.trim() !== "" &&
    editSeconds.trim() !== "" &&
    Number.isSafeInteger(hours) &&
    hours >= 0 &&
    hours <= 9999 &&
    Number.isSafeInteger(minutes) &&
    minutes >= 0 &&
    minutes <= 59 &&
    Number.isSafeInteger(seconds) &&
    seconds >= 0 &&
    seconds <= 59;

  const saveEditedTimer = () => {
    if (clientToEdit === null || !validDuration) return;
    submit({
      intent: "update",
      clientId: clientToEdit,
      seconds: String(hours * 3600 + minutes * 60 + seconds),
    });
  };

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-logo" aria-hidden="true">
          ⏱
        </div>
        <div>
          <h1>Countdown Control Center</h1>
          <p className="subtitle">Multi-client timer administration</p>
        </div>
      </header>

      <DashboardStats clients={clients} />

      {error &&
        !showAddModal &&
        clientToDelete === null &&
        clientToEdit === null && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

      <section className="client-section">
        <div className="section-header">
          <h2>Client Timers</h2>
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={() => {
              fetcher.reset();
              setShowAddModal(true);
            }}
          >
            + Add Client
          </button>
        </div>

        <div className="client-grid">
          {clients.map((client) => (
            <ClientTimerCard
              key={client.id}
              client={client}
              now={now}
              busy={busy}
              onStart={(clientId) => submit({ intent: "start", clientId })}
              onPause={(clientId) => submit({ intent: "pause", clientId })}
              onReset={(clientId) => submit({ intent: "reset", clientId })}
              onEdit={openEditTimer}
              onDelete={(clientId) => {
                fetcher.reset();
                setClientToDelete(clientId);
              }}
            />
          ))}
        </div>

        {clients.length === 0 && (
          <div className="empty-state">
            <h3>No clients yet</h3>
            <p>Click Add Client to create your first timer.</p>
          </div>
        )}
      </section>

      {showAddModal && (
        <AddClientModal
          name={newClientName}
          busy={busy}
          error={error}
          onNameChange={setNewClientName}
          onAdd={() => {
            const name = newClientName.trim();
            if (name) submit({ intent: "add", name });
          }}
          onCancel={cancelAddClient}
        />
      )}

      {clientToDelete !== null && (
        <DeleteClientModal
          clientName={
            clients.find((client) => client.id === clientToDelete)?.name ??
            "this client"
          }
          busy={busy}
          error={error}
          onConfirm={() => submit({ intent: "delete", clientId: clientToDelete })}
          onCancel={() => {
            if (!busy) setClientToDelete(null);
          }}
        />
      )}

      {clientToEdit !== null && (
        <EditTimerModal
          clientName={
            clients.find((client) => client.id === clientToEdit)?.name ??
            "this client"
          }
          hours={editHours}
          minutes={editMinutes}
          seconds={editSeconds}
          validDuration={validDuration}
          busy={busy}
          error={error}
          onHoursChange={setEditHours}
          onMinutesChange={setEditMinutes}
          onSecondsChange={setEditSeconds}
          onSave={saveEditedTimer}
          onCancel={() => {
            if (!busy) setClientToEdit(null);
          }}
        />
      )}
    </main>
  );
}
