"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { webhookService, WebhookEventLog } from "@/services/webhook-service";
import { DataTable } from "@/components/data-table";

const columns = [
  { key: "id",        label: "Log ID",    render: (r: WebhookEventLog) => <span className="font-mono text-xs">{r.id}</span> },
  { key: "eventType", label: "Event Type", render: (r: WebhookEventLog) => r.payload?.event ?? r.eventType ?? "—" },
  { key: "amount",    label: "Amount",    render: (r: WebhookEventLog) => {
    const amt = r.payload?.amount ?? r.amount;
    const curr = r.payload?.currency ?? r.currency ?? "";
    if (amt === undefined || amt === null) return "—";
    return curr ? `${curr} ${amt}` : String(amt);
  }},
  { key: "status",    label: "Status",    render: (r: WebhookEventLog) => {
    const s = String(r.status ?? r.payload?.status ?? "");
    const isSuccess = ["success", "200", "captured", "processed", "completed"].includes(s.toLowerCase());
    const style = isSuccess
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>{s || "—"}</span>;
  }},
  { key: "receivedAt", label: "Date",     render: (r: WebhookEventLog) => {
    const dateVal = r.receivedAt ?? r.createdAt;
    return dateVal ? new Date(dateVal).toLocaleString() : "—";
  }},
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
      .then((data) => {
        console.log(data);
        setData(data);
      })
      .catch(() => setError("Failed to load webhook logs."))
      .finally(() => setLoading(false));
  }, [webhookId]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/${orgId}/webhooks`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-4 mr-1" />
          Back to Webhooks
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Webhook Event Logs</h1>
        <p className="text-muted-foreground text-sm">
          Event logs for webhook:{" "}
          <Link
            href={`/dashboard/${orgId}/webhooks`}
            className="font-mono text-xs font-semibold text-primary underline underline-offset-4 hover:opacity-80"
          >
            {webhookId || "—"}
          </Link>
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
