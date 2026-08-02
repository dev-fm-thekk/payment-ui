"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addService } from "@/services/company-service";
import { useOrganisation } from "@/contexts/OrganisationContext";

export default function CreateServiceDialog({ companyId}: {companyId: string}) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function handleSubmit() {
    setError("");

    if (!name.trim()) {
      setError("Service name is required.");
      return;
    }

    if (!currency.trim()) {
      setError("Currency is required.");
      return;
    }

    try {
      setLoading(true);

      let service = {
        companyId,
        name,
        currency
      }
      await addService(service);

      setName("");
      setCurrency("");

      setOpen(false);
    } catch (err: any) {
      setError(err?.message || "Failed to create service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="bg-black px-4 py-2 text-white rounded-md text-center">
        Add Service
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new Service</DialogTitle>

          <DialogDescription>
            This will create a new service under your company.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>

            <Input
              id="name"
              placeholder="Stripe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>

            <Input
              id="currency"
              placeholder="INR"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}