"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useParams } from 'next/navigation';

interface Provider {
  id: string;
  type: string;
  credentials?: any;
  createdAt?: string;
}

export default function PaymentConnector() {
  const params = useParams()

  const companyId = params.id as string;
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form States
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [providerType, setProviderType] = useState<string|null>("");
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, [companyId]);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/provider/company/${companyId}`);
      if (Array.isArray(response.data)) {
        setProviders(response.data);
      } else if (response.data?.data) {
        setProviders(response.data.data);
      } else {
        setProviders([]);
      }
    } catch (error) {
      console.error("Failed to fetch providers", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubmit = async () => {
    if (!providerType || !keyId || !keySecret) return;
    setIsSubmitting(true);
    try {
      await apiClient.post("/provider", {
        companyId,
        type: providerType,
        credentials: {
          keyId,
          keySecret,
        },
      });
      setIsAddOpen(false);
      resetForm();
      fetchProviders();
    } catch (error) {
      console.error("Failed to add provider", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedProvider || !keyId || !keySecret) return;
    setIsSubmitting(true);
    try {
      await apiClient.patch(`/provider/${selectedProvider.id}`, {
        credentials: {
          keyId,
          keySecret,
        },
      });
      setIsEditOpen(false);
      resetForm();
      fetchProviders();
    } catch (error) {
      console.error("Failed to edit provider", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedProvider) return;
    setIsSubmitting(true);
    try {
      await apiClient.delete(`/provider/${selectedProvider.id}`);
      setIsDeleteOpen(false);
      resetForm();
      fetchProviders();
    } catch (error) {
      console.error("Failed to delete provider", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedProvider(null);
    setProviderType("");
    setKeyId("");
    setKeySecret("");
  };

  const openEdit = (provider: Provider) => {
    setSelectedProvider(provider);
    setProviderType(provider.type);
    setKeyId(provider.credentials?.keyId || "");
    setKeySecret(provider.credentials?.keySecret || "");
    setIsEditOpen(true);
  };

  const openDelete = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsDeleteOpen(true);
  };

  return (
    <div className="p-6 w-[90dvh] mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Payment Providers</CardTitle>
            <CardDescription>
              Manage your connected payment gateways for this company.
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No providers found. Add one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Key ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium capitalize">
                      {provider.type}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {provider.credentials?.keyId || "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(provider)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDelete(provider)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Provider Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => {
        setIsAddOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Provider</DialogTitle>
            <DialogDescription>
              Connect a new payment gateway to your company.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Provider Type</Label>
              <Select value={providerType} onValueChange={setProviderType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Key ID / Client ID</Label>
              <Input
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
                placeholder="Enter Key ID"
              />
            </div>
            <div className="grid gap-2">
              <Label>Key Secret / Client Secret</Label>
              <Input
                type="password"
                value={keySecret}
                onChange={(e) => setKeySecret(e.target.value)}
                placeholder="Enter Key Secret"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddSubmit} disabled={isSubmitting || !providerType || !keyId || !keySecret}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Provider Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment Provider</DialogTitle>
            <DialogDescription>
              Update credentials for {selectedProvider?.type}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Key ID / Client ID</Label>
              <Input
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
                placeholder="Enter Key ID"
              />
            </div>
            <div className="grid gap-2">
              <Label>Key Secret / Client Secret</Label>
              <Input
                type="password"
                value={keySecret}
                onChange={(e) => setKeySecret(e.target.value)}
                placeholder="Enter Key Secret"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting || !keyId || !keySecret}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Provider Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={(open) => {
        setIsDeleteOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Provider</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect {selectedProvider?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
