"use client";

import { useRouter, usePathname } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/app/components/layout/AppShell";
import { WargaPage } from "@/app/(roles)/warga/WargaPage";
import { PetugasPage } from "@/app/(roles)/petugas/PetugasPage";
import { AdminPage } from "@/app/(roles)/admin/AdminPage";
import { KopdesPage } from "@/app/(roles)/kopdes/KopdesPage";
import { NetworkPage } from "@/app/(roles)/jaringan/NetworkPage";
import { useActiveRole, type ActiveRole } from "@/lib/store";
import { useSyncExternalStore } from "react";
import { useHydrated } from "@/lib/use-hydrated";
import {
  Home, FileCheck, Truck, ShoppingBag, BookOpen, ClipboardCheck, Package,
  Wallet, MessageCircle, Store, Building2, Factory, Handshake, ChartNoAxesCombined,
  Scale, type LucideIcon,
} from "lucide-react";

interface NavItem { label: string; href: string; icon: LucideIcon; badge?: number }
const NAV_ITEMS: Record<ActiveRole, NavItem[]> = {
  warga: [
    { label: "Beranda", href: "/", icon: Home }, { label: "Riwayat", href: "/riwayat", icon: FileCheck },
    { label: "Setor", href: "/setor", icon: Truck }, { label: "Tukar Barang", href: "/tukar", icon: ShoppingBag },
    { label: "Panduan", href: "/panduan", icon: BookOpen },
  ],
  petugas: [
    { label: "Dasbor", href: "/petugas", icon: Home }, { label: "Verifikasi", href: "/petugas/verifikasi", icon: ClipboardCheck },
    { label: "Rute Keliling", href: "/petugas/rute-keliling", icon: Truck }, { label: "Stok & Pilah", href: "/petugas/stok", icon: Package },
    { label: "Catat Setoran", href: "/petugas/catat", icon: Scale },
  ],
  admin: [
    { label: "Dasbor", href: "/", icon: Home }, { label: "Persetujuan", href: "/persetujuan", icon: ClipboardCheck },
    { label: "Saldo Warga", href: "/saldo", icon: Wallet }, { label: "Pengaduan", href: "/pengaduan", icon: MessageCircle },
    { label: "Penukaran", href: "/penukaran", icon: ShoppingBag },
  ],
  kopdes: [
    { label: "Dasbor", href: "/", icon: Home }, { label: "Permintaan", href: "/permintaan", icon: ShoppingBag },
    { label: "Katalog", href: "/katalog", icon: Store }, { label: "Riwayat", href: "/riwayat", icon: FileCheck },
  ],
  kecamatan: [{ label: "Dashboard Kecamatan", href: "/", icon: Building2 }],
  bumd: [{ label: "Dashboard BUMD", href: "/", icon: Factory }],
  mitra: [{ label: "Marketplace & Pengolahan", href: "/", icon: Handshake }],
  kabupaten: [{ label: "Dashboard Kabupaten", href: "/", icon: ChartNoAxesCombined }],
};

function getSession(): ActiveRole | null {
  const value = localStorage.getItem("sajati_demo_session") as ActiveRole | null;
  return value && Object.hasOwn(NAV_ITEMS, value) ? value : null;
}
function subscribeSession(callback: () => void) {
  window.addEventListener("sajati_session_change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("sajati_session_change", callback);
    window.removeEventListener("storage", callback);
  };
}

export function DashboardExperience() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#e9edd9]" aria-label="Memuat halaman" />}>
      <DashboardRoute />
    </Suspense>
  );
}

function DashboardRoute() {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const { role, setRole } = useActiveRole();
  const sessionRole = useSyncExternalStore(subscribeSession, getSession, () => null);
  const navItems = NAV_ITEMS[role];
  const activeNav = pathname === "/" ? navItems[0].href : pathname;

  if (!hydrated) return <div className="min-h-screen bg-[#e9edd9]" aria-label="Memuat SAJATI" />;
  if (!sessionRole) return <div className="min-h-screen bg-[#e9edd9] p-8 text-center text-[#31583d]">Silakan masuk melalui halaman login untuk membuka fitur ini.</div>;

  function changeRole(nextRole: ActiveRole) {
    setRole(nextRole);
    localStorage.setItem("sajati_demo_session", nextRole);
    window.dispatchEvent(new Event("sajati_session_change"));
    router.push(NAV_ITEMS[nextRole][0].href);
  }

  function changePage(href: string) { router.push(href); }

  return (
    <AppShell
      activeRole={role}
      onLogout={() => {
        localStorage.removeItem("sajati_demo_session");
        window.dispatchEvent(new Event("sajati_session_change"));
        router.push("/");
      }}
      onRoleChange={changeRole}
      navItems={navItems}
      activeNav={activeNav}
    >
      {role === "warga" && <WargaPage activeNav={activeNav} onNavChange={changePage} />}
      {role === "petugas" && <PetugasPage activeNav={activeNav} onNavChange={changePage} />}
      {role === "admin" && <AdminPage activeNav={activeNav} onNavChange={changePage} />}
      {role === "kopdes" && <KopdesPage activeNav={activeNav} onNavChange={changePage} />}
      {(role === "kecamatan" || role === "bumd" || role === "mitra" || role === "kabupaten") && <NetworkPage role={role} />}
    </AppShell>
  );
}
