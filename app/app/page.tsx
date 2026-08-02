"use client";

import { useUser } from "@/contexts/UserContext";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function AppHome() {
  const { user } = useUser();
  const { logout } = useAuth();
  const { organisations: orgs, error: orgError } = useOrganisation();

  return (
    <div className="min-h-screen p-8 bg-neutral-50/50">
      <section className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">
          Welcome, {user.name || user.email}!
        </h1>
        <p className="text-neutral-500 mb-8">
          Choose an organisation to continue.
        </p>

        {orgError && (
          <div className="mb-6 p-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
            {orgError}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orgs.length === 0 && !orgError && (
            <div className="col-span-full p-8 text-center border-2 border-dashed border-neutral-200 rounded-xl bg-white">
              <p className="text-neutral-500 mb-4">No organisations found.</p>
              <Button variant="outline">
                <Link href="/onboard">Create Organisation</Link>
              </Button>
            </div>
          )}
          {orgs.map((org) => (
            <Link
              key={org.id}
              href={`/app/${org.id}`}
              className="group flex flex-col justify-between p-6 bg-white border border-neutral-200 rounded-xl shadow-sm transition-all hover:shadow-md hover:border-neutral-300"
            >
              <div>
                <h3 className="mb-2 text-xl font-semibold tracking-tight text-neutral-900 group-hover:text-black">
                  {org.name}
                </h3>
                <p className="text-sm text-neutral-500">Click to open app</p>
              </div>
            </Link>
          ))}
        </div>
        <Button className="w-32 px-4 py-3 h-8" onClick={() => logout()}>
          Logout
        </Button>
      </section>
    </div>
  );
}
