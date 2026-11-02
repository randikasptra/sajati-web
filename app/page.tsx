"use client";

import { useState } from "react";
import Image from "next/image";
import { AppShell } from "@/app/components/layout/AppShell";
import { WargaPage } from "@/app/(roles)/warga/WargaPage";
import { PetugasPage } from "@/app/(roles)/petugas/PetugasPage";
import { AdminPage } from "@/app/(roles)/admin/AdminPage";
import { KopdesPage } from "@/app/(roles)/kopdes/KopdesPage";
import { NetworkPage } from "@/app/(roles)/jaringan/NetworkPage";
import { useActiveRole, resetPrototype, type ActiveRole } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  ClipboardCheck,
  Store,
  Scale,
  ArrowRight,
  RotateCcw,
  Home,
  FileCheck,
  Wallet,
  ShoppingBag,
  Package,
  Building2,
  Factory,
  Handshake,
  ChartNoAxesCombined,
  Truck,
  BookOpen,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

interface RoleInfo {
  key: ActiveRole;
  label: string;
  description: string;
  icon: LucideIcon;
  accentClass: string;
}

const ROLES: RoleInfo[] = [
  {
    key: "warga",
    label: "Warga",
    description: "Setor sampah, pantau saldo manfaat, tukar kebutuhan pokok",
    icon: Users,
    accentClass: "bg-emerald-50 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-100",
  },
  {
    key: "petugas",
    label: "Petugas Desa",
    description: "Terima setoran, timbang, verifikasi atau tolak",
    icon: Scale,
    accentClass: "bg-sky-50 border-sky-300 hover:border-sky-500 hover:bg-sky-100",
  },
  {
    key: "admin",
    label: "Admin Desa",
    description: "Setujui saldo, kelola pencatatan, pantau penukaran",
    icon: ClipboardCheck,
    accentClass: "bg-amber-50 border-amber-300 hover:border-amber-500 hover:bg-amber-100",
  },
  {
    key: "kopdes",
    label: "Kopdes",
    description: "Kelola katalog, proses penukaran, serahkan barang",
    icon: Store,
    accentClass: "bg-violet-50 border-violet-300 hover:border-violet-500 hover:bg-violet-100",
  },
  {
    key: "kecamatan",
    label: "Kecamatan",
    description: "Konsolidasi stok antar desa dan penyaluran ke BUMD",
    icon: Building2,
    accentClass: "bg-cyan-50 border-cyan-300 hover:border-cyan-500 hover:bg-cyan-100",
  },
  {
    key: "bumd",
    label: "BUMD Kabupaten",
    description: "Kelola dana insentif dan salurkan material ke mitra",
    icon: Factory,
    accentClass: "bg-orange-50 border-orange-300 hover:border-orange-500 hover:bg-orange-100",
  },
  {
    key: "mitra",
    label: "Mitra Pengolah",
    description: "Pesan material dan catat hasil olah serta residu",
    icon: Handshake,
    accentClass: "bg-lime-50 border-lime-300 hover:border-lime-500 hover:bg-lime-100",
  },
  {
    key: "kabupaten",
    label: "Pemerintah Kabupaten",
    description: "Pantau neraca massa dan kinerja lintas wilayah",
    icon: ChartNoAxesCombined,
    accentClass: "bg-indigo-50 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-100",
  },
];

const NAV_ITEMS: Record<ActiveRole, { label: string; href: string; icon: LucideIcon; badge?: number }[]> = {
  warga: [
    { label: "Beranda", href: "/", icon: Home },
    { label: "Riwayat", href: "/riwayat", icon: FileCheck },
    { label: "Setor", href: "/setor", icon: Truck },
    { label: "Tukar Barang", href: "/tukar", icon: ShoppingBag },
    { label: "Panduan", href: "/panduan", icon: BookOpen },
  ],
  petugas: [
    { label: "Dasbor", href: "/", icon: Home },
    { label: "Verifikasi", href: "/verifikasi", icon: ClipboardCheck },
    { label: "Penjemputan", href: "/penjemputan", icon: Truck },
    { label: "Stok Desa", href: "/stok", icon: Package },
    { label: "Catat Setoran", href: "/catat", icon: Scale },
  ],
  admin: [
    { label: "Dasbor", href: "/", icon: Home },
    { label: "Persetujuan", href: "/persetujuan", icon: ClipboardCheck },
    { label: "Saldo Warga", href: "/saldo", icon: Wallet },
    { label: "Pengaduan", href: "/pengaduan", icon: MessageCircle },
    { label: "Penukaran", href: "/penukaran", icon: ShoppingBag },
  ],
  kopdes: [
    { label: "Dasbor", href: "/", icon: Home },
    { label: "Permintaan", href: "/permintaan", icon: ShoppingBag },
    { label: "Katalog", href: "/katalog", icon: Store },
    { label: "Riwayat", href: "/riwayat", icon: FileCheck },
  ],
  kecamatan: [{ label: "Dashboard Kecamatan", href: "/", icon: Building2 }],
  bumd: [{ label: "Dashboard BUMD", href: "/", icon: Factory }],
  mitra: [{ label: "Marketplace & Pengolahan", href: "/", icon: Handshake }],
  kabupaten: [{ label: "Dashboard Kabupaten", href: "/", icon: ChartNoAxesCombined }],
};

export default function HomePage() {
  const { role, setRole } = useActiveRole();
  const [started, setStarted] = useState(false);
  const [activeNav, setActiveNav] = useState("/");

  if (!started) {
    return (
      <LandingPage
        onStart={(r) => {
          setRole(r);
          setStarted(true);
        }}
      />
    );
  }

  return (
    <AppShell
      activeRole={role}
      onRoleChange={(nextRole) => {
        setRole(nextRole);
        setActiveNav("/");
      }}
      navItems={NAV_ITEMS[role]}
      activeNav={activeNav}
      onNavChange={setActiveNav}
    >
      {role === "warga" && <WargaPage activeNav={activeNav} onNavChange={setActiveNav} />}
      {role === "petugas" && <PetugasPage activeNav={activeNav} onNavChange={setActiveNav} />}
      {role === "admin" && <AdminPage activeNav={activeNav} onNavChange={setActiveNav} />}
      {role === "kopdes" && <KopdesPage activeNav={activeNav} onNavChange={setActiveNav} />}
      {(role === "kecamatan" || role === "bumd" || role === "mitra" || role === "kabupaten") && <NetworkPage role={role} />}
    </AppShell>
  );
}

// ---------- Landing Page ----------
function LandingPage({ onStart }: { onStart: (role: ActiveRole) => void }) {
  const FLOW_STEPS = [
    { step: "1", text: "Warga menyetor sampah terpilah", role: "Warga" },
    { step: "2", text: "Petugas menimbang dan memverifikasi", role: "Petugas" },
    { step: "3", text: "Desa menyetujui saldo", role: "Admin" },
    { step: "4", text: "Warga menukar kebutuhan pokok", role: "Warga" },
    { step: "5", text: "Kopdes menyiapkan barang", role: "Kopdes" },
    { step: "6", text: "Material bergerak ke pengolah", role: "Mitra" },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[#e9edd9] text-[#143d2e]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <Image src="/img/SAJATI_Logo.png" alt="Logo SAJATI" width={52} height={52} className="size-12 rounded-full object-cover object-[center_18%] shadow-sm" />
          <div><p className="text-sm font-black tracking-[0.2em]">SAJATI</p><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#52715e]">Tasikmalaya · 2026</p></div>
        </div>
        <Badge className="border border-[#b6c89e] bg-[#f8f6e9] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#315b40]">Prototype interaktif</Badge>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 pb-6 md:space-y-10 md:px-8">
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#0c4a34] text-white shadow-[0_24px_60px_rgba(13,63,43,0.24)]">
          <div aria-hidden="true" className="absolute -right-20 -top-32 -z-10 size-[28rem] rounded-full border-[42px] border-[#4f8f50]/25" />
          <div aria-hidden="true" className="absolute -bottom-40 left-[38%] -z-10 size-[24rem] rounded-full border-[36px] border-[#a9c75f]/15" />
          <div className="grid items-center gap-8 p-6 sm:p-9 md:grid-cols-[1.1fr_0.9fr] md:p-12">
            <div className="space-y-6">
              <Badge className="border border-[#8bab65] bg-[#a8c85f] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#173e2a]">Sauyunan Ngajaga Alam</Badge>
              <div className="space-y-4">
                <h1 className="max-w-2xl text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">Dari sampah terpilah, <span className="text-[#c5df73]">lahir manfaat nyata.</span></h1>
                <p className="max-w-xl text-sm leading-6 text-[#e0ebd9] sm:text-base">Jejaring desa, kecamatan, kabupaten, warga, dan mitra untuk mengubah sampah menjadi nilai yang bisa dilacak.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
                {["Pilah", "Setor", "Pulihkan", "Manfaat"].map((item, idx) => <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2">{item}{idx < 3 && <ArrowRight className="size-3 text-[#c5df73]" />}</span>)}
              </div>
              <p className="text-xs font-medium text-[#c4d7c4]">Pengelolaan berjenjang Desa – Kecamatan – Kabupaten · Menuju Tasikmalaya Nol Residu</p>
            </div>
            <div className="relative mx-auto w-full max-w-[360px] rotate-1 rounded-[1.75rem] border-[6px] border-[#d0dfaa] bg-[#faf9f1] p-2 shadow-[12px_14px_0_rgba(0,0,0,0.12)] sm:max-w-[410px]">
              <Image src="/img/SAJATI_Logo.png" alt="SAJATI — Sistem Jejaring Sampah Bernilai dan Terintegrasi" width={800} height={800} priority className="h-auto w-full rounded-[1.2rem]" />
              <span className="absolute -bottom-4 -left-5 rounded-full bg-[#efb74c] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#4d3515] shadow-md">Satu jejaring · banyak manfaat</span>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col justify-between rounded-[1.5rem] border-2 border-[#d1d9b7] bg-[#f8f6e9] p-5 sm:p-6">
            <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#658050]">Dari sumber sampai pulih</p><h2 className="mt-2 text-2xl font-black leading-tight">Sampah tidak berhenti di tempat setor.</h2></div>
            <p className="mt-4 text-sm leading-6 text-[#536b5a]">Setiap tahap mencatat berat, lokasi, perpindahan, saldo, hasil pengolahan, dan residu.</p>
            <Badge variant="outline" className="mt-5 w-fit border-[#c9d1b0] bg-white/70 text-[10px] font-bold text-[#536b5a]">Data demo · tidak terhubung ke layanan nyata</Badge>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {FLOW_STEPS.map(({ step, text, role: roleName }, idx) => (
              <div key={step} className={`relative flex min-h-24 gap-3 rounded-2xl border-2 p-3 ${idx % 3 === 0 ? "border-[#b6ce91] bg-[#f4f6e9]" : idx % 3 === 1 ? "border-[#eccf87] bg-[#fbf3df]" : "border-[#b8d5c8] bg-[#eaf3ec]"}`}>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#164f36] text-sm font-black text-[#d4e88a]">{step.padStart(2, "0")}</span>
                <div><p className="text-xs font-bold leading-5 text-[#284733]">{text}</p><span className="mt-1 inline-block text-[9px] font-black uppercase tracking-widest text-[#6b8068]">{roleName}</span></div>
                {idx < FLOW_STEPS.length - 1 && <ArrowRight className="absolute -right-2 top-1/2 z-10 hidden size-4 -translate-y-1/2 rounded-full bg-[#e9edd9] text-[#69854c] xl:block" />}
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b-2 border-[#cbd4b3] pb-3">
            <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#658050]">Pilih sudut pandang</p><h2 className="mt-1 text-2xl font-black">Masuk ke alur demo</h2></div>
            <p className="text-xs font-medium text-[#667867]">8 peran · satu data simulasi bersama</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {ROLES.map((r, idx) => {
              const Icon = r.icon;
              return (
                <button key={r.key} onClick={() => onStart(r.key)} className={`group rounded-2xl border-2 p-4 text-left shadow-[0_4px_0_rgba(21,60,43,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_0_rgba(21,60,43,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245f3e] focus-visible:ring-offset-2 ${r.accentClass}`}>
                  <div className="mb-4 flex items-start justify-between"><span className={`flex size-11 items-center justify-center rounded-2xl text-white shadow-sm ${idx % 4 === 0 ? "bg-[#27744b]" : idx % 4 === 1 ? "bg-[#3d7791]" : idx % 4 === 2 ? "bg-[#c28624]" : "bg-[#7558a1]"}`}><Icon className="size-5" /></span><ArrowRight className="mt-1 size-4 text-[#788b72] transition-transform group-hover:translate-x-1" /></div>
                  <span className="text-base font-black text-[#203e2b]">{r.label}</span>
                  <p className="mt-1.5 min-h-10 text-xs leading-5 text-[#536b5a]">{r.description}</p>
                  <span className="mt-4 inline-block border-b border-[#607b53] pb-0.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#365d3b]">Buka peran</span>
                </button>
              );
            })}
          </div>
        </section>

        <footer className="flex flex-col items-center justify-between gap-3 border-t-2 border-[#cbd4b3] py-4 sm:flex-row">
          <p className="text-xs font-semibold text-[#607364]">SAJATI · Kabupaten Tasikmalaya · Prototype pengalaman pengguna</p>
          <Button variant="outline" size="sm" onClick={resetPrototype} className="border-[#bdcba8] bg-[#f8f6e9] font-bold text-[#31583d] hover:bg-white"><RotateCcw className="size-3.5" />Reset data demo</Button>
        </footer>
      </main>
    </div>
  );
}
