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

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-3 px-2 py-3"><Image src="/img/SAJATI_Logo.png" alt="Logo SAJATI" width={40} height={40} className="rounded-xl bg-white" /><div><strong className="block">SAJATI</strong><span className="text-xs text-muted-foreground">{currentRole.label}</span></div></div>
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
          <details className="px-3 pb-3 text-xs text-muted-foreground"><summary className="cursor-pointer">Pengaturan presentasi</summary>              <DropdownMenu>
                <DropdownMenuTrigger className="my-2 flex w-full items-center justify-between rounded border px-3 py-2">Ganti peran<ChevronDown className="size-4" /></DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                  align="start"
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Pengaturan presentasi ? ganti peran
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
              </DropdownMenu><button className="rounded border px-3 py-2" onClick={()=>{if(window.confirm("Kembalikan seluruh data presentasi ke kondisi awal?")) resetPrototype();}}>Kembalikan data awal</button></details>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#35674b] bg-[#0c4a34] px-4 text-white shadow-sm">
          <SidebarTrigger className="-ml-1 hidden md:inline-flex" />
          <Separator orientation="vertical" className="mr-2 hidden !h-4 md:block" />
          <div className="flex items-center gap-2">
            <Image
              src="/img/SAJATI_Logo.png"
              alt="Logo SAJATI"
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-full bg-white object-contain p-0.5"
            />
            <h1 className="text-sm font-semibold">{currentRole.label}</h1>
          </div>
          <button type="button" onClick={onLogout} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-white/25 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10" aria-label="Keluar ke halaman login">
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
