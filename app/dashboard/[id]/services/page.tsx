"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { serviceService, Service } from "@/services/service-service";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const columns = [
  { key: "id",       label: "ID",       render: (r: Service) => <span className="font-mono text-xs">{r.id}</span> },
  { key: "name",     label: "Name" },
  { key: "currency", label: "Currency", render: (r: Service) => <span className="font-medium uppercase">{r.currency}</span> },
];

export default function ServicesPage() {
  const { id: companyId } = useParams<{ id: string }>();
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dialog state
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchServices = () => {
    setLoading(true);
    serviceService.getByCompany(companyId)
      .then(setData)
      .catch(() => setError("Failed to load services."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currency.trim()) return;
    setSubmitting(true);
    setFormError("");
    try {
      await serviceService.create(companyId, name.trim(), currency.trim().toUpperCase());
      setOpen(false);
      setName("");
      setCurrency("");
      fetchServices();
    } catch {
      setFormError("Failed to create service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) { setName(""); setCurrency(""); setFormError(""); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground text-sm">All services for this organisation.</p>
        </div>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Service</DialogTitle>
              <DialogDescription>Add a new service to this organisation.</DialogDescription>
            </DialogHeader>
            <form id="create-service-form" onSubmit={handleSubmit}>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="svc-name">Service name</Label>
                  <Input
                    id="svc-name"
                    placeholder="My Payment Service"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={submitting}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="svc-currency">Currency</Label>
                  <Input
                    id="svc-currency"
                    placeholder="INR"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    disabled={submitting}
                    maxLength={5}
                  />
                </div>
                {formError && <p className="text-sm text-destructive">{formError}</p>}
              </div>
            </form>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
              <Button
                type="submit"
                form="create-service-form"
                disabled={submitting || !name.trim() || !currency.trim()}
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
        emptyMessage="No services found for this organisation."
      />
    </div>
  );
}
