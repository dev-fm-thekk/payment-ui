"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { paymentLinkService, PaymentLink } from "@/services/payment-link-service";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const STATUS_STYLES: Record<string, string> = {
  active:   "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  expired:  "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  consumed: "bg-muted text-muted-foreground",
};

const PROVIDERS = ["razorpay", "stripe", "paypal", "other"];

const columns = [
  { key: "id",        label: "ID",       render: (r: PaymentLink) => <span className="font-mono text-xs">{r.id}</span> },
  { key: "provider",  label: "Provider", render: (r: PaymentLink) => <span className="capitalize">{r.provider}</span> },
  { key: "url",       label: "URL",      render: (r: PaymentLink) => (
    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 truncate max-w-xs block">
      {r.url}
    </a>
  )},
  { key: "status",    label: "Status",   render: (r: PaymentLink) => (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[r.status] ?? ""}`}>
      {r.status}
    </span>
  )},
  { key: "expiresAt", label: "Expires",  render: (r: PaymentLink) => new Date(r.expiresAt).toLocaleDateString() },
];

export default function PaymentLinksPage() {
  const { id: companyId } = useParams<{ id: string }>();
  const [data, setData] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dialog state
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState("");
  const [url, setUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchLinks = () => {
    setLoading(true);
    paymentLinkService.getByCompany(companyId)
      .then(setData)
      .catch(() => setError("Failed to load payment links."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLinks(); }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !url.trim() || !expiresAt) return;
    setSubmitting(true);
    setFormError("");
    try {
      // API expects ISO 8601 date-time string
      const isoExpiry = new Date(expiresAt).toISOString();
      await paymentLinkService.create(companyId, provider, url.trim(), isoExpiry);
      setOpen(false);
      setProvider("");
      setUrl("");
      setExpiresAt("");
      fetchLinks();
    } catch {
      setFormError("Failed to create payment link. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) { setProvider(""); setUrl(""); setExpiresAt(""); setFormError(""); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Links</h1>
          <p className="text-muted-foreground text-sm">All payment links for this organisation.</p>
        </div>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Payment Link
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Payment Link</DialogTitle>
              <DialogDescription>Register a new payment link for this organisation.</DialogDescription>
            </DialogHeader>
            <form id="create-pl-form" onSubmit={handleSubmit}>
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
                <div className="space-y-2">
                  <Label htmlFor="pl-url">URL</Label>
                  <Input
                    id="pl-url"
                    type="url"
                    placeholder="https://rzp.io/l/abc123"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={submitting}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pl-expires">Expires at</Label>
                  <Input
                    id="pl-expires"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                {formError && <p className="text-sm text-destructive">{formError}</p>}
              </div>
            </form>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
              <Button
                type="submit"
                form="create-pl-form"
                disabled={submitting || !provider || !url.trim() || !expiresAt}
              >
                {submitting ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No payment links found."
      />
    </div>
  );
}
