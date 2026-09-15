"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { companyService, Company } from "@/services/company-service";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useAuth } from "@/contexts/auth-context";

export default function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create-org dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const { logout } = useAuth();

  const fetchCompanies = async () => {
    try {
      const data = await companyService.getCompanies();
      setCompanies(data);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
      setError("Failed to load organisations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;

    setCreating(true);
    setCreateError("");

    try {
      await companyService.createCompany(orgName.trim());
      setDialogOpen(false);
      setOrgName("");
      // Refresh the list
      setLoading(true);
      await fetchCompanies();
    } catch (err) {
      console.error("Failed to create organisation:", err);
      setCreateError("Failed to create organisation. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setOrgName("");
      setCreateError("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation bar */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-muted-foreground tracking-widest uppercase">
            Payment Gateway
          </span>
          <Button variant="ghost" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Page heading row */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organisations</h1>
            <p className="text-muted-foreground mt-1">
              Select an organisation to manage its services and settings.
            </p>
          </div>

          {/* Create Organisation dialog */}
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Organisation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Organisation</DialogTitle>
                <DialogDescription>
                  Give your new organisation a name to get started.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateOrg} id="create-org-form">
                <div className="py-4 space-y-2">
                  <Label htmlFor="org-name">Organisation name</Label>
                  <Input
                    id="org-name"
                    placeholder="Acme Corp"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    disabled={creating}
                    autoFocus
                  />
                  {createError && (
                    <p className="text-sm text-destructive">{createError}</p>
                  )}
                </div>
              </form>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="create-org-form"
                  disabled={creating || !orgName.trim()}
                >
                  {creating ? "Creating…" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Global error */}
        {error && (
          <div className="rounded-md bg-destructive/10 text-destructive text-sm px-4 py-3">
            {error}
          </div>
        )}

        {/* Company grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-1/2 mb-3" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold">No organisations yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Create your first organisation to get started.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Organisation
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`dashboard/${company.id}`}
                className="group block"
              >
                <Card className="h-full transition-all duration-150 group-hover:border-primary/60 group-hover:shadow-sm">
                  <CardHeader className="gap-1">
                    <CardTitle className="text-lg leading-snug">
                      {company.name}
                    </CardTitle>
                    <CardDescription className="font-mono text-xs truncate">
                      {company.id}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}