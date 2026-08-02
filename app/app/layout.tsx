'use client'

import React from 'react';
import { UserProvider } from '@/contexts/UserContext';
import { OrganisationProvider } from '@/contexts/OrganisationContext';

export default function AppBoundaryLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <OrganisationProvider>
        {children}
      </OrganisationProvider>
    </UserProvider>
  );
}
