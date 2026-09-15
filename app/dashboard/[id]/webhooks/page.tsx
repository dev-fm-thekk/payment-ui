"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { webhookService, WebhookEndpoint } from "@/services/webhook-service";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileTextIcon } from "lucide-react";

// Razorpay and Stripe are common providers — list can be extended
const PROVIDERS = ["razorpay", "stripe", "paypal"];

const columns = (orgId: string) => [
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

  // Dialog state
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchWebhooks = () => {
    setLoading(true);
    Promise.allSettled(
      PROVIDERS.map((p) => webhookService.getByCompanyAndProvider(orgId, p))
    ).then((results) => {
      const merged = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
      setData(merged);
    }).catch(() => setError("Failed to load webhooks."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWebhooks(); }, [orgId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;
    setSubmitting(true);
    setFormError("");
    try {
      await webhookService.create(orgId, provider);
      setOpen(false);
      setProvider("");
      fetchWebhooks();
    } catch {
      setFormError("Failed to create webhook endpoint. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) { setProvider(""); setFormError(""); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Webhooks</h1>
          <p className="text-muted-foreground text-sm">Registered webhook endpoints for this organisation.</p>
        </div>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Webhook Endpoint</DialogTitle>
              <DialogDescription>Register a new webhook endpoint for a payment provider.</DialogDescription>
            </DialogHeader>
            <form id="create-webhook-form" onSubmit={handleSubmit}>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select value={provider} onValueChange={setProvider} disabled={submitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider…" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDERS.map((p) => (
                        <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formError && <p className="text-sm text-destructive">{formError}</p>}
              </div>
            </form>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
              <Button
                type="submit"
                form="create-webhook-form"
                disabled={submitting || !provider}
              >
                {submitting ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <DataTable
        columns={columns(orgId)}
        data={data}
        loading={loading}
        emptyMessage="No webhook endpoints found."
      />
    </div>
  );
}
