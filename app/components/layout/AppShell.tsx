"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  ClipboardCheck,
  Store,
  Scale,
  Building2,
  Factory,
  Handshake,
  ChartNoAxesCombined,
  ChevronDown,
  RotateCcw,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import type { ActiveRole } from "@/lib/store";
import { resetPrototype } from "@/lib/store";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface RoleConfig {
  key: ActiveRole;
  label: string;
  description: string;
  icon: LucideIcon;
}

const roles: RoleConfig[] = [
  { key: "warga", label: "Warga", description: "Pengalaman warga", icon: Users },
  { key: "petugas", label: "Petugas Desa", description: "Verifikasi setoran", icon: Scale },
  { key: "admin", label: "Admin Desa", description: "Persetujuan & pencatatan", icon: ClipboardCheck },
  { key: "kopdes", label: "Kopdes", description: "Penukaran barang", icon: Store },
  { key: "kecamatan", label: "Kecamatan", description: "Konsolidasi stok dan koordinasi desa", icon: Building2 },
  { key: "bumd", label: "BUMD Kabupaten", description: "Dana insentif dan jalur material", icon: Factory },
  { key: "mitra", label: "Mitra Pengolah", description: "Marketplace dan hasil pengolahan", icon: Handshake },
  { key: "kabupaten", label: "Pemerintah Kabupaten", description: "Pemantauan kinerja dan residu", icon: ChartNoAxesCombined },
];

export function AppShell({
  activeRole,
  onLogout,
  onRoleChange,
  navItems,
  activeNav,
  children,
}: {
  activeRole: ActiveRole;
  onLogout: () => void;
  onRoleChange: (role: ActiveRole) => void;
  navItems: NavItem[];
  activeNav: string;
  children: ReactNode;
}) {
  const currentRole = roles.find((r) => r.key === activeRole)!;
  const CurrentIcon = currentRole.icon;

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="cursor-pointer w-full" />}>
                    <div className="flex aspect-square size-9 items-center justify-center overflow-hidden rounded-xl border-2 border-[#d0dfaa] bg-white shadow-sm">
                      <Image src="/img/SAJATI_Logo.png" alt="" width={64} height={64} className="size-full object-cover" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-bold">SAJATI</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {currentRole.label}
                      </span>
                    </div>
                    <ChevronDown className="ml-auto size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                  align="start"
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Pilih Peran Demo
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {roles.map((role) => {
                      const Icon = role.icon;
                      return (
                        <DropdownMenuItem
                          key={role.key}
                          onClick={() => onRoleChange(role.key)}
                          className="cursor-pointer gap-2"
                        >
                          <Icon className="size-4" />
                          <div className="flex-1">
                            <span className="font-medium">{role.label}</span>
                            {activeRole === role.key && (
                              <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
                                Aktif
                              </Badge>
                            )}
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        className="cursor-pointer"
                        isActive={activeNav === item.href}
                      >
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-auto text-[10px] px-1.5 py-0 h-5 min-w-5 justify-center"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={resetPrototype}
                className="text-muted-foreground cursor-pointer"
              >
                <RotateCcw className="size-4" />
                <span>Reset Data Demo</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="px-3 pb-2">
            <Badge variant="outline" className="text-[10px] font-normal">
              Data ilustrasi — Prototype
            </Badge>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#35674b] bg-[#0c4a34] px-4 text-white shadow-sm">
          <SidebarTrigger className="-ml-1 hidden md:inline-flex" />
          <Separator orientation="vertical" className="mr-2 !h-4" />
          <div className="flex items-center gap-2">
            <CurrentIcon className="size-4 text-[#c5df73]" />
            <h1 className="text-sm font-semibold">{currentRole.label}</h1>
          </div>
          <Badge variant="outline" className="ml-auto border-white/30 bg-white/10 text-[10px] text-white">
            Prototype
          </Badge>
          <button type="button" onClick={onLogout} className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-white/25 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10" aria-label="Keluar ke halaman login">
            <LogOut className="size-3.5" /><span className="hidden sm:inline">Keluar</span>
          </button>
        </header>
        <div className="flex-1 p-4 pb-24 md:p-6">
          {children}
        </div>
      </SidebarInset>
      <nav
        aria-label={`Navigasi ${currentRole.label}`}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[#d9dece] bg-[#fbfaf2]/95 px-1.5 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur md:hidden"
      >
          <div className="mx-auto flex max-w-lg items-stretch justify-around gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] transition-colors ${isActive ? "bg-[#e0e9c9] font-extrabold text-[#164f36] shadow-sm" : "font-medium text-muted-foreground hover:bg-[#f0f2e3] hover:text-foreground"}`}
                >
                  <Icon className="size-[1.15rem]" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
      </nav>
    </SidebarProvider>
  );
}
