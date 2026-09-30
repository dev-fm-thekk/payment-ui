"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { invoiceService, Invoice } from "@/services/invoice-service";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, PlusIcon, BellIcon } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  draft:   "bg-muted text-muted-foreground",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  paid:    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  expired: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

export default function ClientInvoicesPage() {
  const { id: companyId, clientId } = useParams<{ id: string; clientId: string }>();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, [clientId]);

  const loadInvoices = () => {
    setLoading(true);
    invoiceService.getByClient(clientId)
      .then(setInvoices)
      .catch(() => setError("Failed to load invoices."))
      .finally(() => setLoading(false));
  };

  const handleNotify = async (id: string) => {
    setNotifyingId(id);
    try {
      await invoiceService.notify(id);
      alert("Invoice notification sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send notification.");
    } finally {
      setNotifyingId(null);
    }
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
    { key: "actions", label: "Actions",  render: (r: Invoice) => (
      <Button variant="outline" size="sm" disabled={notifyingId === r.id} onClick={() => handleNotify(r.id)}>
        {notifyingId === r.id ? (
          <span className="animate-spin size-4 mr-1 border-2 border-current border-t-transparent rounded-full" />
        ) : (
          <BellIcon className="size-4 mr-1" />
        )}
        {notifyingId === r.id ? "Notifying..." : "Notify"}
      </Button>
    )}
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="link" size="lg">
          <Link href={`/dashboard/${companyId}/clients`} className="flex justify-between items-center">
            <ArrowLeftIcon className="size-5 mr-1" />
            <p>Clients</p>
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground text-sm font-mono">
            Client: {clientId}
          </p>
        </div>
        
        <Button>
          <Link href={`/dashboard/${companyId}/invoices/${clientId}/new`} className="flex items-center">
            <PlusIcon className="size-4 mr-2" />
            Create Invoice
          </Link>
        </Button>
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
