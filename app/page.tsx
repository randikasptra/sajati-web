"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { DashboardExperience } from "@/app/DashboardExperience";
import { useHydrated } from "@/lib/use-hydrated";
import { resetPrototype, type ActiveRole } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  ClipboardCheck,
  Store,
  Scale,
  ArrowRight,
  RotateCcw,
  Building2,
  Factory,
  Handshake,
  ChartNoAxesCombined,
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

export default function HomePage() {
  const hydrated = useHydrated();
  const sessionRole = useSyncExternalStore(subscribeSession, getSession, () => null);

  if (!hydrated) return <div className="min-h-screen bg-[#e9edd9]" aria-label="Memuat SAJATI" />;
  if (!sessionRole) return <LandingPage />;
  return <DashboardExperience />;
}

function getSession(): ActiveRole | null {
  const value = localStorage.getItem("sajati_demo_session") as ActiveRole | null;
  return value && ROLES.some((item) => item.key === value) ? value : null;
}

function subscribeSession(callback: () => void) {
  window.addEventListener("sajati_session_change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("sajati_session_change", callback);
    window.removeEventListener("storage", callback);
  };
}

function LandingPage() {
  const flow = [
    ["01", "Pilah", "Warga memilah sampah dari rumah"],
    ["02", "Setor", "Petugas menimbang dan memverifikasi"],
    ["03", "Manfaat", "Saldo disetujui dan ditukar di Kopdes"],
    ["04", "Pulihkan", "Material dilacak sampai mitra pengolah"],
  ];
  return (
    <div className="min-h-screen overflow-hidden bg-[#e9edd9] text-[#143d2e]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <Image src="/img/SAJATI_Logo.png" alt="Logo SAJATI" width={52} height={52} className="size-12 rounded-full object-cover object-[center_18%] shadow-sm" />
          <div><p className="text-sm font-black tracking-[0.2em]">SAJATI</p><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#52715e]">Tasikmalaya ? 2026</p></div>
        </div>
        <Link href="/login" className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#145337] px-4 text-sm font-extrabold text-white shadow-md transition-colors hover:bg-[#0c422c]">Masuk <ArrowRight className="size-4" /></Link>
      </header>
      <main className="mx-auto max-w-6xl space-y-8 px-4 pb-10 md:px-8">
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#0c4a34] text-white shadow-[0_24px_60px_rgba(13,63,43,0.24)]">
          <div aria-hidden="true" className="absolute -right-20 -top-32 -z-10 size-[28rem] rounded-full border-[42px] border-[#4f8f50]/25" />
          <div className="grid items-center gap-8 p-6 sm:p-10 md:grid-cols-[1.1fr_0.9fr] md:p-12">
            <div className="space-y-6">
              <Badge className="border border-[#8bab65] bg-[#a8c85f] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#173e2a]">Sauyunan Ngajaga Alam</Badge>
              <div className="space-y-4"><h1 className="max-w-2xl text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">Dari sampah terpilah, <span className="text-[#c5df73]">lahir manfaat nyata.</span></h1><p className="max-w-xl text-sm leading-6 text-[#e0ebd9] sm:text-base">Jejaring desa, kecamatan, kabupaten, warga, dan mitra untuk mengubah sampah menjadi nilai yang bisa dilacak.</p></div>
              <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">{["Pilah", "Setor", "Pulihkan", "Manfaat"].map((item, idx) => <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2">{item}{idx < 3 && <ArrowRight className="size-3 text-[#c5df73]" />}</span>)}</div>
              <Link href="/login" className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-xl bg-[#c5df73] px-6 text-sm font-black text-[#173e2a] shadow-lg transition-colors hover:bg-[#d5eb91]">Masuk ke SAJATI <ArrowRight className="size-4" /></Link>
              <p className="text-xs font-medium text-[#c4d7c4]">Pengelolaan berjenjang Desa ? Kecamatan ? Kabupaten ? Menuju Tasikmalaya Nol Residu</p>
            </div>
            <div className="relative mx-auto w-full max-w-[340px] rotate-1 rounded-[1.75rem] border-[6px] border-[#d0dfaa] bg-[#faf9f1] p-2 shadow-[12px_14px_0_rgba(0,0,0,0.12)]"><Image src="/img/SAJATI_Logo.png" alt="SAJATI ? Sistem Jejaring Sampah Bernilai dan Terintegrasi" width={800} height={800} priority className="h-auto w-full rounded-[1.2rem]" /><span className="absolute -bottom-4 -left-5 rounded-full bg-[#efb74c] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#4d3515] shadow-md">Satu jejaring ? banyak manfaat</span></div>
          </div>
        </section>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{flow.map(([num, title, desc], i) => <div key={num} className={`rounded-2xl border-2 p-4 ${i % 2 ? "border-[#eccf87] bg-[#fbf3df]" : "border-[#b6ce91] bg-[#f4f6e9]"}`}><span className="flex size-9 items-center justify-center rounded-xl bg-[#164f36] text-sm font-black text-[#d4e88a]">{num}</span><h2 className="mt-3 text-lg font-black">{title}</h2><p className="mt-1 text-xs leading-5 text-[#536b5a]">{desc}</p></div>)}</section>
        <section className="rounded-2xl border-2 border-[#cbd4b3] bg-[#f8f6e9] p-5 sm:p-7"><div className="mb-4"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#658050]">Satu jejaring ? delapan peran</p><h2 className="mt-1 text-2xl font-black">Alur untuk seluruh ekosistem</h2></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{ROLES.map((r, idx) => { const Icon = r.icon; return <Link key={r.key} href={`/login?role=${r.key}`} className={`group rounded-2xl border-2 p-4 text-left shadow-[0_4px_0_rgba(21,60,43,0.08)] transition-all hover:-translate-y-1 ${r.accentClass}`}><span className={`flex size-10 items-center justify-center rounded-xl text-white ${["bg-[#27744b]", "bg-[#3d7791]", "bg-[#c28624]", "bg-[#7558a1]"][idx % 4]}`}><Icon className="size-5" /></span><span className="mt-3 block font-black">{r.label}</span><p className="mt-1 text-xs leading-5 text-[#536b5a]">{r.description}</p><span className="mt-3 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#365d3b]">Masuk <ArrowRight className="size-3" /></span></Link>; })}</div></section>
        <footer className="flex flex-col items-center justify-between gap-3 border-t-2 border-[#cbd4b3] py-4 sm:flex-row"><p className="text-xs font-semibold text-[#607364]">SAJATI ? Kabupaten Tasikmalaya ? Prototype pengalaman pengguna</p><Button variant="outline" size="sm" onClick={resetPrototype} className="border-[#bdcba8] bg-[#f8f6e9] font-bold text-[#31583d] hover:bg-white"><RotateCcw className="size-3.5" />Reset data demo</Button></footer>
      </main>
    </div>
  );
}
