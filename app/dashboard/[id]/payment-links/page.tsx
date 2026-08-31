"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { paymentLinkService, PaymentLink } from "@/services/payment-link-service";
import { DataTable } from "@/components/data-table";

const STATUS_STYLES: Record<string, string> = {
  active:   "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  expired:  "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  consumed: "bg-muted text-muted-foreground",
};

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

  useEffect(() => {
    paymentLinkService.getByCompany(companyId)
      .then(setData)
      .catch(() => setError("Failed to load payment links."))
      .finally(() => setLoading(false));
  }, [companyId]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment Links</h1>
        <p className="text-muted-foreground text-sm">All payment links for this organisation.</p>
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
