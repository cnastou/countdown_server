import type { Client } from "../types/client";

type DashboardStatsProps = {
  clients: Client[];
};

export default function DashboardStats({ clients }: DashboardStatsProps) {
  const stats = [
    {
      label: "Total Clients",
      value: clients.length,
    },
    {
      label: "Running",
      value: clients.filter((client) => client.status === "running").length,
    },
    {
      label: "Paused",
      value: clients.filter((client) => client.status === "paused").length,
    },
  ];

  return (
    <section className="stats-grid">
      {stats.map((stat) => (
        <div className="stat-card" key={stat.label}>
          <p className="stat-label">{stat.label}</p>
          <p className="stat-value">{stat.value}</p>
        </div>
      ))}
    </section>
  );
}
