"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { webhookService, WebhookEndpoint } from "@/services/webhook-service";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { FileTextIcon } from "lucide-react";

// Razorpay and Stripe are common providers — list can be extended
const PROVIDERS = ["razorpay", "stripe"];

const columns = (companyId: string, orgId: string) => [
  { key: "id",        label: "Webhook ID",  render: (r: WebhookEndpoint) => <span className="font-mono text-xs">{r.id}</span> },
  { key: "provider",  label: "Provider",    render: (r: WebhookEndpoint) => <span className="capitalize">{r.provider}</span> },
  { key: "companyId", label: "Company ID",  render: (r: WebhookEndpoint) => <span className="font-mono text-xs">{r.companyId}</span> },
  {
    key: "logs",
    label: "Logs",
    render: (r: WebhookEndpoint) => (
      <Button variant="ghost" size="sm">
        <Link href={`/dashboard/${orgId}/webhooks/logs?webhookId=${r.id}`}>
          <FileTextIcon className="size-4 mr-1" />
          View Logs
        </Link>
      </Button>
    ),
  },
];

export default function WebhooksPage() {
  const { id: orgId } = useParams<{ id: string }>();
  const [data, setData] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch for all known providers and merge results
    Promise.allSettled(
      PROVIDERS.map((provider) => webhookService.getByCompanyAndProvider(orgId, provider))
    ).then((results) => {
      const merged = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
      setData(merged);
    }).catch(() => setError("Failed to load webhooks."))
      .finally(() => setLoading(false));
  }, [orgId]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Webhooks</h1>
        <p className="text-muted-foreground text-sm">Registered webhook endpoints for this organisation.</p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <DataTable
        columns={columns(orgId, orgId)}
        data={data}
        loading={loading}
        emptyMessage="No webhook endpoints found."
      />
    </div>
  );
}
