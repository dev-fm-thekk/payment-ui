"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { serviceService, Service } from "@/services/service-service";
import { clientService, Client } from "@/services/client-service";
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
import { Skeleton } from "@/components/ui/skeleton";
import { FileTextIcon } from "lucide-react";

export default function ClientsPage() {
  const { id: companyId } = useParams<{ id: string }>();

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [error, setError] = useState("");

  // Dialog state
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientServiceId, setClientServiceId] = useState<string | null>("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch services on mount
  useEffect(() => {
    serviceService.getByCompany(companyId)
      .then((data) => {
        setServices(data);
        if (data.length > 0) {
          setSelectedServiceId(data[0].id);
          setClientServiceId(data[0].id);
        }
      })
      .catch(() => setError("Failed to load services."))
      .finally(() => setServicesLoading(false));
  }, [companyId]);

  const fetchClients = (serviceId: string) => {
    setClientsLoading(true);
    setClients([]);
    setError("");
    clientService.getByService(serviceId)
      .then(setClients)
      .catch(() => setError("Failed to load clients."))
      .finally(() => setClientsLoading(false));
  };

  // Fetch clients whenever service changes
  useEffect(() => {
    if (!selectedServiceId) return;
    fetchClients(selectedServiceId);
  }, [selectedServiceId]);

  const selectedService = services.find((s) => s.id === selectedServiceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim() || !clientServiceId) return;
    setSubmitting(true);
    setFormError("");
    try {
      await clientService.create(clientName.trim(), clientEmail.trim(), clientServiceId);
      setOpen(false);
      setClientName("");
      setClientEmail("");
      if (selectedServiceId) fetchClients(selectedServiceId);
    } catch {
      setFormError("Failed to create client. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      // Sync the form's service to whichever service is currently being viewed
      setClientServiceId(selectedServiceId ?? (services[0]?.id ?? ""));
    } else {
      setClientName("");
      setClientEmail("");
      setFormError("");
      // Reset form service to the currently viewed service
      if (selectedServiceId) setClientServiceId(selectedServiceId);
    }
  };

  const columns = [
    { key: "id",    label: "ID",    render: (r: Client) => <span className="font-mono text-xs">{r.id}</span> },
    { key: "name",  label: "Name" },
    { key: "email", label: "Email", render: (r: Client) => <span className="text-muted-foreground">{r.email}</span> },
    {
      key: "actions",
      label: "",
      render: (r: Client) => (
        <Button variant="ghost" size="sm">
          <Link href={`/dashboard/${companyId}/invoices/${r.id}`}>
            <FileTextIcon className="size-4 mr-1" />
            View Invoices
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground text-sm">Select a service to view its clients.</p>
        </div>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger>
            <Button disabled={services.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Client</DialogTitle>
              <DialogDescription>Add a new client to a service.</DialogDescription>
            </DialogHeader>
            <form id="create-client-form" onSubmit={handleSubmit}>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-name">Name</Label>
                  <Input
                    id="client-name"
                    placeholder="Jane Doe"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    disabled={submitting}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    placeholder="jane@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Service</Label>
                  <Select
                    value={clientServiceId}
                    onValueChange={setClientServiceId}
                    disabled={submitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service…">
                        {services.find((s) => s.id === clientServiceId)?.name ?? "Select a service…"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
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
                form="create-client-form"
                disabled={submitting || !clientName.trim() || !clientEmail.trim() || !clientServiceId}
              >
                {submitting ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Service dropdown */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Service</label>
        {servicesLoading ? (
          <Skeleton className="h-8 w-64" />
        ) : services.length === 0 ? (
          <p className="text-sm text-muted-foreground">No services found for this organisation.</p>
        ) : (
          <Select
            value={selectedServiceId}
            onValueChange={(value) => setSelectedServiceId(value as string)}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a service…">
                {selectedService ? `${selectedService.name}` : "Select a service…"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  <span>{service.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {selectedServiceId && (
        <DataTable
          columns={columns}
          data={clients}
          loading={clientsLoading}
          emptyMessage="No clients found for this service."
        />
      )}
    </div>
  );
}
