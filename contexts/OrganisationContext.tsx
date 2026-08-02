'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchOrganisations } from '@/services/company';
import { useUser } from '@/contexts/UserContext';

export interface Organisation {
  id: string;
  name: string;
  [key: string]: any;
}

interface OrganisationContextType {
  organisations: Organisation[];
  loading: boolean;
  error: string | null;
  refreshOrganisations: () => Promise<void>;
  getOrganisationById: (id: string) => Organisation | undefined;
}

const OrganisationContext = createContext<OrganisationContextType | undefined>(undefined);

export function OrganisationProvider({ children }: { children: ReactNode }) {
  const { user } = useUser(); // guarantees we are authenticated
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrgs = async () => {
    setLoading(true);
    try {
      const res = await fetchOrganisations();
      if (res?.status === 'failed') {
        setError(res.error || 'Failed to load organisations');
      } else {
        const data = res?.payload || res?.data || res;
        setOrganisations(Array.isArray(data) ? data : []);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch organisations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadOrgs();
    }
  }, [user]);

  const getOrganisationById = (id: string) => {
    return organisations.find(org => org.id.toString() === id.toString());
  };

  return (
    <OrganisationContext.Provider 
      value={{ 
        organisations, 
        loading, 
        error, 
        refreshOrganisations: loadOrgs,
        getOrganisationById 
      }}
    >
      {/* Show loading state while fetching organisations initially */}
      {loading && organisations.length === 0 ? (
        <div className="flex h-screen w-screen items-center justify-center">
          <p className="animate-pulse text-lg text-neutral-500">Loading organisations...</p>
        </div>
      ) : (
        children
      )}
    </OrganisationContext.Provider>
  );
}

export function useOrganisation() {
  const context = useContext(OrganisationContext);
  if (context === undefined) {
    throw new Error('useOrganisation must be used within an OrganisationProvider');
  }
  return context;
}
