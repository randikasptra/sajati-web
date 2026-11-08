"use client";

import { useRouter, usePathname } from "next/navigation";
import { Suspense, useEffect } from "react";
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
  kecamatan: [
    {label:"Dasbor",href:"/kecamatan",icon:Building2},{label:"Stok & Pilah",href:"/kecamatan/stok",icon:Package},
    {label:"Transfer",href:"/kecamatan/transfer",icon:Truck},{label:"Dana",href:"/kecamatan/dana",icon:Wallet},
    {label:"Wilayah",href:"/kecamatan/wilayah",icon:ChartNoAxesCombined}],
  bumd: [{label:"Dasbor",href:"/bumd",icon:Factory},{label:"Stok & Pilah",href:"/bumd/stok",icon:Package},
    {label:"Penerimaan",href:"/bumd/transfer",icon:Truck},{label:"Dana",href:"/bumd/dana",icon:Wallet},
    {label:"Penjualan",href:"/bumd/marketplace",icon:Store}],
  mitra: [{label:"Marketplace & Pengolahan",href:"/mitra",icon:Handshake}],
  kabupaten: [{label:"Dasbor",href:"/kabupaten",icon:Home},{label:"Wilayah",href:"/kabupaten/wilayah",icon:Building2},
    {label:"Laporan",href:"/kabupaten/laporan",icon:ChartNoAxesCombined}],
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
  const { setRole } = useActiveRole();
  const sessionRole = useSyncExternalStore(subscribeSession, getSession, () => null);
  const role = sessionRole ?? "warga";
  const roleItems = NAV_ITEMS[role];
  const navItems = roleItems.map((item, index) => ({ ...item, href: index === 0 ? "/dashboard" : `/dashboard${item.href}` }));
  const featurePath = pathname.replace(/^\/dashboard/, "") || roleItems[0].href;
  const isRoleHome = featurePath === roleItems[0].href;
  const activeNav = isRoleHome ? "/dashboard" : pathname;
  const allowed = roleItems.some(item => item.href === featurePath);

  useEffect(() => {
    if (hydrated && !sessionRole) router.replace("/login");
    else if (hydrated && (!allowed || (isRoleHome && pathname !== "/dashboard"))) router.replace("/dashboard");
  }, [hydrated, sessionRole, allowed, isRoleHome, pathname, router]);

  if (!hydrated) return <div className="min-h-screen bg-[#e9edd9]" aria-label="Memuat SAJATI" />;
  if (!sessionRole || !allowed) return <div className="min-h-screen bg-[#e9edd9] p-8 text-center text-[#31583d]">Mengalihkan halaman...</div>;

  function changeRole(nextRole: ActiveRole) {
    localStorage.setItem("sajati_identity",JSON.stringify({role:nextRole,wargaId:nextRole === "warga" ? "w1" : null}));
    setRole(nextRole);
    localStorage.setItem("sajati_demo_session", nextRole);
    window.dispatchEvent(new Event("sajati_session_change"));
    router.push("/dashboard");
  }

  function changePage(href: string) { router.push(href === roleItems[0].href ? "/dashboard" : `/dashboard${href}`); }

  return (
    <AppShell
      activeRole={role}
      onLogout={() => {
        localStorage.removeItem("sajati_demo_session");
        localStorage.removeItem("sajati_identity");
        window.dispatchEvent(new Event("sajati_session_change"));
        router.replace("/login");
      }}
      onRoleChange={changeRole}
      navItems={navItems}
      activeNav={activeNav}
    >
      {role === "warga" && <WargaPage activeNav={featurePath} onNavChange={changePage} />}
      {role === "petugas" && <PetugasPage activeNav={featurePath} onNavChange={changePage} />}
      {role === "admin" && <AdminPage activeNav={featurePath} onNavChange={changePage} />}
      {role === "kopdes" && <KopdesPage activeNav={featurePath} onNavChange={changePage} />}
      {(role === "kecamatan" || role === "bumd" || role === "mitra" || role === "kabupaten") && <NetworkPage role={role} activeNav={featurePath} />}
    </AppShell>
  );
}
