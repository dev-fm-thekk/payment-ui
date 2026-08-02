"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { addProvider, fetchProviders } from "@/services/provider";

type Provider = {
  id: string;
  credentialsEncrypted: {
    apiKey: string;
    apiSecret: string;
  };
  serviceId: string;
  provider: "razorpay" | "stripe";
};

export default function Provider() {
  const params = useParams();
  const serviceId = params.serviceId as string;

  const [provider, setProvider] = useState<Provider | null>(null);

  const [providerType, setProviderType] = useState<"razorpay" | "stripe">(
    "razorpay",
  );

  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProvider() {
      try {
        setLoading(true);

        const data = await fetchProviders(serviceId);
        if (data.status === "failed") {
          setError("Failed to fetch provider.");
          return;
        }
        setProvider(data);
        setProviderType(data.provider);
        setApiKey(data.credentialsEncrypted.apiKey);
        setApiSecret(data.credentialsEncrypted.apiSecret);
      } catch {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadProvider();
  }, [serviceId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      await addProvider({
        provider: providerType,
        serviceId,
        credentialsEncrypted: {
          apiKey,
          apiSecret,
        },
      });

      alert("Provider saved successfully.");
    } catch {
      setError("Failed to save provider.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="w-full h-[90dvh] flex justify-center items-center">
      <div className="w-[40rem] space-y-6 border px-8 py-4 rounded-md">
        <div>
          <h1 className="text-2xl font-bold">Payment Provider</h1>
          <p className="text-muted-foreground">
            Configure the payment provider for this service.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <select
              id="provider"
              value={providerType}
              onChange={(e) =>
                setProviderType(e.target.value as "razorpay" | "stripe")
              }
              className="border rounded-md w-full h-10 px-3"
            >
              <option value="razorpay">Razorpay</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-secret">API Secret</Label>
            <Input
              id="api-secret"
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : provider ? "Update Provider" : "Add Provider"}
          </Button>
        </form>
      </div>
    </div>
  );
}
