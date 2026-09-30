"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftIcon } from "lucide-react";
import { invoiceService } from "@/services/invoice-service";
import { paymentLinkService } from "@/services/payment-link-service";
import { Checkbox } from "@/components/ui/checkbox";

export default function NewInvoicePage() {
  const { id: companyId, clientId } = useParams<{ id: string; clientId: string }>();
  const router = useRouter();

  const [formData, setFormData] = useState({ title: "", description: "", amount: "", currency: "INR", dueDate: "" });
  const [createPaymentLink, setCreatePaymentLink] = useState(false);
  const [paymentLinkData, setPaymentLinkData] = useState({ provider: "stripe", upi_link: false });
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      let paymentLinkId = undefined;
      
      if (createPaymentLink) {
        const link = await paymentLinkService.create({
          companyId,
          provider: paymentLinkData.provider,
          amount: Number(formData.amount),
          currency: formData.currency,
          description: formData.description,
          upi_link: paymentLinkData.upi_link,
        });
        paymentLinkId = link.id;
      }

      await invoiceService.create({
        ...formData,
        clientId,
        paymentLinkId,
        dueDate: new Date(formData.dueDate).toISOString()
      });
      
      router.push(`/dashboard/${companyId}/invoices/${clientId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create invoice.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="link" size="lg">
          <Link href={`/dashboard/${companyId}/invoices/${clientId}`} className="flex justify-between items-center">
            <ArrowLeftIcon className="size-5 mr-1" />
            <p>Back to Invoices</p>
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Create Invoice</h1>
        <p className="text-muted-foreground text-sm font-mono">
          Client: {clientId}
        </p>
      </div>
      
      <form onSubmit={handleCreate} className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Basic Details</h2>
          <div className="grid gap-4">
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
        </div>

        <div className="space-y-4 border-t pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Payment Link</h2>
            <div className="flex items-center space-x-2">
              <Checkbox id="createPaymentLink" checked={createPaymentLink} onCheckedChange={(checked) => setCreatePaymentLink(checked as boolean)} />
              <Label htmlFor="createPaymentLink">Create Payment Link</Label>
            </div>
          </div>

          {createPaymentLink && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="provider">Provider</Label>
                <Input id="provider" value={paymentLinkData.provider} onChange={(e) => setPaymentLinkData({ ...paymentLinkData, provider: e.target.value })} placeholder="stripe, razorpay, etc." />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="upi_link" checked={paymentLinkData.upi_link} onCheckedChange={(checked) => setPaymentLinkData({ ...paymentLinkData, upi_link: checked as boolean })} />
                <Label htmlFor="upi_link">UPI Link (Razorpay only)</Label>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 border-t pt-6">
          <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/${companyId}/invoices/${clientId}`)}>Cancel</Button>
          <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Invoice"}</Button>
        </div>
      </form>
    </div>
  );
}
