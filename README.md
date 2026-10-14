# Multi-Client Countdown Server

A full-stack countdown management application built with **React Router v7 (Remix Framework Mode), React, TypeScript, Node.js, and SQLite**.

The application provides a centralized dashboard for managing multiple independent client countdown timers, with timer state stored persistently on the server.

## Features

- **Independent countdown timers:** Each client has its own duration, status, and deadline.
- **Client management:** Create, view, and delete clients.
- **Timer management:** Configure durations, start, pause, resume, and reset timers.
- **Persistent storage:** SQLite stores client records and countdown state.
- **Deadline-based countdowns:** Timers calculate remaining time from saved expiration timestamps rather than updating the database every second.
- **Responsive dashboard:** View and manage multiple timers from one interface.
- **Server-side data operations:** React Router loaders and actions handle database reads and updates.

## Technology Stack

| Technology | Purpose |
|---|---|
| React Router v7 | Full-stack application framework |
| React | Dashboard user interface |
| TypeScript | Type-safe development |
| Node.js | Server-side runtime |
| SQLite | Persistent database |
| better-sqlite3 | SQLite database access |
| Vite | Development tooling |

## Project Structure

```text
countdown_server/
├── app/
│   ├── components/       # Reusable dashboard components
│   ├── db/               # SQLite connection, schema, repository
│   ├── hooks/            # Countdown-related React hooks
│   ├── routes/           # React Router pages and actions
│   ├── styles/           # Dashboard styling
│   ├── types/            # TypeScript types
│   └── utils/            # Timer utilities
├── data/                 # Local SQLite database (ignored by Git)
├── package.json
└── README.md
```

## Installation

**Requirements:** A supported Node.js version, npm, and a compatible development environment.

Clone the repository:

```bash
git clone <repository-url>
cd countdown_server
```

Install dependencies:

```bash
npm install
```

Initialize the SQLite database:

```bash
npx tsx app/db/setup.server.ts
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal, typically:

http://localhost:5173

## Database Design

The SQLite `clients` table stores the state of each countdown.

| Column | Description |
|---|---|
| `id` | Unique client identifier |
| `name` | Client display name |
| `seconds` | Saved countdown duration or remaining seconds |
| `initial_seconds` | Configured duration used for resetting |
| `status` | `ready`, `running`, `paused`, or `completed` |
| `ends_at` | Countdown completion timestamp in milliseconds |

### Countdown Persistence

When a timer starts, the server saves its expiration timestamp.

For example, a timer started at 2:00 PM with a 60-minute duration has a deadline of 3:00 PM.

If the browser closes at 2:20 PM and reopens at 2:45 PM, the remaining time is calculated from the stored deadline: **15 minutes**.

Each client's countdown is independent. Starting, pausing, or resetting one timer does not change the others.

## Development Status

**Implemented in the codebase:**

- SQLite database initialization
- Client repository with CRUD operations
- Countdown start, pause, reset, and completion logic
- React Router loader for retrieving clients
- React Router actions for timer operations
- Countdown dashboard interface

**Integration testing in progress:** End-to-end verification of the new server-backed dashboard, including browser restart and persistence tests.

**Planned improvements:**

- Real-time synchronization across multiple browsers
- Administrator authentication and authorization
- Automated tests
- Improved server-side expiration notifications
- Deployment configuration

## Security Notes

Local database files, `.env`, and other development-specific files are excluded from version control.

The application is currently intended for local development. Authentication and authorization must be implemented before exposing timer-management operations publicly.

## License

No license has been specified for this project.

