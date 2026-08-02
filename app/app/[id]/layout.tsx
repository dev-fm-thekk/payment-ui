'use client'

import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { useOrganisation } from '@/contexts/OrganisationContext';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { organisations, getOrganisationById } = useOrganisation();
  const params = useParams();
  const router = useRouter();
  const orgId = params?.id as string;
  const currentOrg = getOrganisationById(orgId);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex flex-col gap-2 p-2">
	  	<Link href="/">
			<Button variant="outline">Go Home</Button>
		</Link>
	  	<DropdownMenu>
  			<DropdownMenuTrigger render={<Button variant="outline" />} className="text-center">
				{currentOrg?.name ?? "Select Organisation"}
  			</DropdownMenuTrigger>
  			<DropdownMenuContent>
				
				<DropdownMenuGroup>
    				   <DropdownMenuLabel>Organisations</DropdownMenuLabel>
    					{organisations.map((org) => (
      						<DropdownMenuItem
        						key={org.id}
        						onClick={() => router.push(`/app/${org.id}`)}
							className="text-center"
      						>
        						{org.name}
      						</DropdownMenuItem>
    					))}
				</DropdownMenuGroup>
  			</DropdownMenuContent>
		</DropdownMenu>
	  </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Link href={`/app/${orgId}/services`}>Services</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Link href={`/app/${orgId}/provider`}>Provider</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Link href={`/app/${orgId}/transactions`}>Transactions</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton >
                <Link href={`/app/${orgId}/clients`}>Clients</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Link href={`/app/${orgId}/invoice`}>Invoice</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-4 border-t border-neutral-200">
            {user ? (
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{user.name || 'User'}</span>
                <span className="text-xs text-neutral-500">{user.email}</span>
              </div>
            ) : (
              <span className="text-sm text-neutral-500">Not logged in</span>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 w-full h-full overflow-auto">
	   <SidebarTrigger /> 	
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
