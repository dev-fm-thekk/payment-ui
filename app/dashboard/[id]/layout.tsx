"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2Icon,
  ChevronDownIcon,
  CreditCardIcon,
  UsersIcon,
  LinkIcon,
  PlugIcon,
  LayoutDashboardIcon,
  ArrowLeftIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { companyService, Company } from "@/services/company-service";

const navItems = [
  { label: "Overview",      href: "",               icon: LayoutDashboardIcon },
  { label: "Services",      href: "/services",      icon: CreditCardIcon },
  { label: "Clients",       href: "/clients",       icon: UsersIcon },
  { label: "Payment Links", href: "/payment-links", icon: LinkIcon },
  { label: "Webhooks",      href: "/webhooks",      icon: PlugIcon },
  { label: "Connect",       href: "/connect",       icon: Building2Icon },
];

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);

  useEffect(() => {
    companyService.getCompanies().then((data) => {
      setCompanies(data);
      setActiveCompany(data.find((c) => c.id === id) ?? data[0] ?? null);
    });
  }, [id]);

  const handleCompanyChange = (company: Company) => {
    setActiveCompany(company);
    router.push(`/dashboard/${company.id}`);
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">

        {/* ── Header: org switcher dropdown ── */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none"
                >
                  <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Building2Icon className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {activeCompany?.name ?? "Select organisation"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground font-mono">
                      {activeCompany?.id ? `${activeCompany.id.slice(0, 8)}…` : "—"}
                    </span>
                  </div>
                  <ChevronDownIcon className="ml-auto size-4 shrink-0 opacity-60" />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  sideOffset={4}
                >
                  {companies.length === 0 && (
                    <DropdownMenuItem disabled>No organisations</DropdownMenuItem>
                  )}
                  {companies.map((company) => (
                    <DropdownMenuItem
                      key={company.id}
                      onClick={() => handleCompanyChange(company)}
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border mr-2 shrink-0">
                        <Building2Icon className="size-3.5" />
                      </div>
                      <span className="truncate">{company.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* ── Nav items ── */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const href = `/dashboard/${id}${item.href}`;
                  const isActive =
                    item.href === ""
                      ? pathname === `/dashboard/${id}`
                      : pathname.startsWith(href);
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        render={<Link href={href} />}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* ── Footer: back to all orgs ── */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="All Organisations" render={<Link href="/dashboard" />}>
                <ArrowLeftIcon />
                <span>All Organisations</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        {/* Top bar with sidebar toggle */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 flex-col p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
