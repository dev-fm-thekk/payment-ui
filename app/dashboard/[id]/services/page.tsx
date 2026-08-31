"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { serviceService, Service } from "@/services/service-service";
import { DataTable } from "@/components/data-table";

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

  useEffect(() => {
    serviceService.getByCompany(companyId)
      .then(setData)
      .catch(() => setError("Failed to load services."))
      .finally(() => setLoading(false));
  }, [companyId]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Services</h1>
        <p className="text-muted-foreground text-sm">All services for this organisation.</p>
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
