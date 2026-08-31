"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { companyService, Company } from "@/services/company-service";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { logout } = useAuth();

  useEffect(() => {
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

    fetchCompanies();
  }, []);

  return (
    <div className="p-8 md:p-12 mx-auto flex flex-col gap-8 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organisations</h1>
          <p className="text-muted-foreground mt-2">Manage your companies and services.</p>
        </div>
        <Button variant="outline" onClick={logout}>Logout</Button>
      </div>

      {error && <div className="text-destructive font-medium">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-lg">
          <h3 className="text-lg font-medium">No organisations found</h3>
          <p className="text-muted-foreground mt-1">You do not have any organisations yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Link key={company.id} href={`dashboard/${company.id}`} className="block transition-transform hover:scale-[1.02]">
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle>{company.name}</CardTitle>
                  <CardDescription className="font-mono text-xs mt-2 truncate">ID: {company.id}</CardDescription>
                </CardHeader>
              </Card>   
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}