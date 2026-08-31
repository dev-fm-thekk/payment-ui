"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { serviceService, Service } from "@/services/service-service";
import { clientService, Client } from "@/services/client-service";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  // Fetch services on mount
  useEffect(() => {
    serviceService.getByCompany(companyId)
      .then((data) => {
        setServices(data);
        if (data.length > 0) setSelectedServiceId(data[0].id);
      })
      .catch(() => setError("Failed to load services."))
      .finally(() => setServicesLoading(false));
  }, [companyId]);

  // Fetch clients whenever service changes
  useEffect(() => {
    if (!selectedServiceId) return;
    setClientsLoading(true);
    setClients([]);
    setError("");

    clientService.getByService(selectedServiceId)
      .then(setClients)
      .catch(() => setError("Failed to load clients."))
      .finally(() => setClientsLoading(false));
  }, [selectedServiceId]);

  const selectedService = services.find((s) => s.id === selectedServiceId);

  const columns = [
    { key: "id",    label: "ID",    render: (r: Client) => <span className="font-mono text-xs">{r.id}</span> },
    { key: "name",  label: "Name" },
    { key: "email", label: "Email", render: (r: Client) => <span className="text-muted-foreground">{r.email}</span> },
    {
      key: "actions",
      label: "",
      render: (r: Client) => (
        <Button variant="ghost" size="sm" asChild>
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
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <p className="text-muted-foreground text-sm">
          Select a service to view its clients.
        </p>
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
                {selectedService ? `${selectedService.name} (${selectedService.currency})` : "Select a service…"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  <span>{service.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground uppercase">{service.currency}</span>
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
