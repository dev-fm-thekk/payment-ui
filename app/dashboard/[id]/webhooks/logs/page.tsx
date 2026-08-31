"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { webhookService, WebhookEventLog } from "@/services/webhook-service";
import { DataTable } from "@/components/data-table";

const columns = [
  { key: "id",        label: "Log ID",    render: (r: WebhookEventLog) => <span className="font-mono text-xs">{r.id}</span> },
  { key: "webhookId", label: "Webhook",   render: (r: WebhookEventLog) => <span className="font-mono text-xs">{r.webhookId}</span> },
  { key: "eventType", label: "Event Type" },
  { key: "status",    label: "Status",    render: (r: WebhookEventLog) => {
    const s = String(r.status ?? "");
    const style = s === "success" || s === "200"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>{s || "—"}</span>;
  }},
  { key: "createdAt", label: "Date",      render: (r: WebhookEventLog) => r.createdAt ? new Date(r.createdAt).toLocaleString() : "—" },
];

export default function WebhookLogsPage() {
  const { id: orgId } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const webhookId = searchParams.get("webhookId") ?? "";

  const [data, setData] = useState<WebhookEventLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!webhookId) {
      setError("No webhook ID provided.");
      setLoading(false);
      return;
    }
    webhookService.getLogs(webhookId)
      .then(setData)
      .catch(() => setError("Failed to load webhook logs."))
      .finally(() => setLoading(false));
  }, [webhookId]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Webhook Event Logs</h1>
        <p className="text-muted-foreground text-sm">
          Event logs for webhook: <span className="font-mono text-xs">{webhookId || "—"}</span>
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No event logs found for this webhook."
      />
    </div>
  );
}
