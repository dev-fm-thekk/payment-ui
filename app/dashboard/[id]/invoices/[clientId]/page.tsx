"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { invoiceService, Invoice } from "@/services/invoice-service";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, PlusIcon, BellIcon } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", amount: "", currency: "INR", dueDate: "" });
  const [creating, setCreating] = useState(false);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await invoiceService.create({
        ...formData,
        clientId,
        dueDate: new Date(formData.dueDate).toISOString()
      });
      setIsDialogOpen(false);
      loadInvoices();
    } catch (err) {
      console.error(err);
      alert("Failed to create invoice.");
    } finally {
      setCreating(false);
    }
  };

  const handleNotify = async (id: string) => {
    try {
      await invoiceService.notify(id);
      alert("Invoice notification sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send notification.");
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
      <Button variant="outline" size="sm" onClick={() => handleNotify(r.id)}>
        <BellIcon className="size-4 mr-1" />
        Notify
      </Button>
    )}
  ];

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

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground text-sm font-mono text-xs">
            Client: {clientId}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="size-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Invoice</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" type="number" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input id="currency" required value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="datetime-local" required value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
