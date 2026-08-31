"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { invoiceService, Invoice } from "@/services/invoice-service";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  draft:   "bg-muted text-muted-foreground",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  paid:    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  expired: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

const columns = [
  { key: "id",      label: "ID",       render: (r: Invoice) => <span className="font-mono text-xs">{r.id}</span> },
  { key: "title",   label: "Title" },
  { key: "amount",  label: "Amount",   render: (r: Invoice) => `${r.currency} ${r.amount}` },
  { key: "status",  label: "Status",   render: (r: Invoice) => (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[r.status] ?? ""}`}>
      {r.status}
    </span>
  )},
  { key: "dueDate", label: "Due Date", render: (r: Invoice) => new Date(r.dueDate).toLocaleDateString() },
];

export default function ClientInvoicesPage() {
  const { id: companyId, clientId } = useParams<{ id: string; clientId: string }>();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    invoiceService.getByClient(clientId)
      .then(setInvoices)
      .catch(() => setError("Failed to load invoices."))
      .finally(() => setLoading(false));
  }, [clientId]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/${companyId}/clients`}>
            <ArrowLeftIcon className="size-4 mr-1" />
            Clients
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground text-sm font-mono text-xs">
          Client: {clientId}
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        emptyMessage="No invoices found for this client."
      />
    </div>
  );
}
