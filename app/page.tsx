import Link from "next/link";
import Image from "next/image";
import { type ActiveRole } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ClipboardCheck,
  Store,
  Scale,
  ArrowRight,

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

export default function LandingPage() {
  const flow = [
    ["01", "Pilah", "Warga memilah sampah dari rumah"],
    ["02", "Setor", "Petugas menimbang dan memverifikasi"],
    ["03", "Manfaat", "Saldo disetujui dan ditukar di Kopdes"],
    ["04", "Pulihkan", "Material dilacak sampai mitra pengolah"],
  ];
  return (
    <div className="min-h-screen overflow-hidden bg-[#e9edd9] text-[#143d2e]">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:py-4 md:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Image src="/img/SAJATI_Logo.png" alt="Logo SAJATI" width={52} height={52} className="size-10 shrink-0 rounded-full object-cover object-[center_18%] shadow-sm sm:size-12" />
          <div><p className="text-xs font-black tracking-[0.2em] sm:text-sm">SAJATI</p><p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#52715e] sm:text-[10px] sm:tracking-[0.16em]">Tasikmalaya · 2026</p></div>
        </div>
        <Link href="/login" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#145337] px-4 text-sm font-extrabold text-white shadow-md transition-colors hover:bg-[#0c422c] sm:h-9">Masuk <ArrowRight className="size-4" /></Link>
      </header>
      <main className="mx-auto max-w-6xl space-y-5 px-4 pb-6 sm:space-y-8 sm:pb-10 md:px-8">
        <section className="relative isolate overflow-hidden rounded-3xl bg-[#0c4a34] text-white shadow-[0_24px_60px_rgba(13,63,43,0.24)] sm:rounded-[2rem]">
          <div aria-hidden="true" className="absolute -right-20 -top-32 -z-10 size-[28rem] rounded-full border-[42px] border-[#4f8f50]/25" />
          <div className="grid items-center gap-6 px-5 py-6 sm:gap-8 sm:p-10 md:grid-cols-[1.1fr_0.9fr] md:p-12">
            <div className="min-w-0 space-y-4 sm:space-y-6">
              <Badge className="border border-[#8bab65] bg-[#a8c85f] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#173e2a]">Sauyunan Ngajaga Alam</Badge>
              <div className="space-y-3 sm:space-y-4"><h1 className="max-w-2xl text-[clamp(1.75rem,8vw,2.25rem)] font-black leading-[1.06] tracking-tight sm:text-5xl sm:leading-[1.02] lg:text-6xl">Dari sampah terpilah, <span className="text-[#c5df73]">lahir manfaat nyata.</span></h1><p className="max-w-xl text-[13px] leading-[1.65] text-[#e0ebd9] sm:text-base sm:leading-6">Jejaring desa, kecamatan, kabupaten, warga, dan mitra untuk mengubah sampah menjadi nilai yang bisa dilacak.</p></div>
              <div className="grid grid-cols-4 gap-1.5 text-[9px] font-bold uppercase tracking-wide sm:flex sm:flex-wrap sm:gap-2 sm:text-[11px] sm:tracking-wider">{["Pilah", "Setor", "Pulihkan", "Manfaat"].map((item, idx) => <span key={item} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-1 py-2 sm:px-3">{item}{idx < 3 && <ArrowRight className="hidden size-3 text-[#c5df73] sm:block" />}</span>)}</div>
              <Link href="/login" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c5df73] px-6 text-sm font-black text-[#173e2a] shadow-lg transition-colors hover:bg-[#d5eb91] sm:w-fit">Masuk ke SAJATI <ArrowRight className="size-4" /></Link>
              <p className="text-[10px] font-medium leading-4 text-[#c4d7c4] sm:text-xs">Pengelolaan berjenjang Desa → Kecamatan → Kabupaten · Menuju Tasikmalaya Nol Residu</p>
            </div>
            <div className="relative mx-auto hidden w-full max-w-[340px] rotate-1 rounded-[1.75rem] border-[6px] border-[#d0dfaa] bg-[#faf9f1] p-2 shadow-[12px_14px_0_rgba(0,0,0,0.12)] md:block"><Image src="/img/SAJATI_Logo.png" alt="SAJATI — Sistem Jejaring Sampah Bernilai dan Terintegrasi" width={800} height={800} priority className="h-auto w-full rounded-[1.2rem]" /><span className="absolute -bottom-4 -left-5 rounded-full bg-[#efb74c] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#4d3515] shadow-md">Satu jejaring · banyak manfaat</span></div>
          </div>
        </section>
        <section aria-label="Alur SAJATI" className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">{flow.map(([num, title, desc], i) => <div key={num} className={`rounded-2xl border-2 p-3 sm:p-4 ${i % 2 ? "border-[#eccf87] bg-[#fbf3df]" : "border-[#b6ce91] bg-[#f4f6e9]"}`}><span className="flex size-7 items-center justify-center rounded-lg bg-[#164f36] text-xs font-black text-[#d4e88a] sm:size-9 sm:rounded-xl sm:text-sm">{num}</span><h2 className="mt-2 text-base font-black sm:mt-3 sm:text-lg">{title}</h2><p className="mt-1 text-xs leading-5 text-[#536b5a]">{desc}</p></div>)}</section>
        <section className="rounded-2xl border-2 border-[#cbd4b3] bg-[#f8f6e9] p-3 sm:p-7">
          <div className="mb-4 px-1 sm:px-0"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#658050] sm:text-[10px] sm:tracking-[0.2em]">Satu jejaring · delapan peran</p><h2 className="mt-1 text-xl font-black leading-tight sm:text-2xl">Alur untuk seluruh ekosistem</h2></div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">
            {ROLES.map((r, idx) => {
              const Icon = r.icon;
              return (
                <Link key={r.key} href={`/login?role=${r.key}`} className={`group grid min-w-0 grid-cols-[2rem_minmax(0,1fr)_1rem] items-center gap-x-3 rounded-xl border-2 p-3 text-left shadow-[0_4px_0_rgba(21,60,43,0.08)] transition-all hover:-translate-y-1 sm:block sm:rounded-2xl sm:p-4 ${r.accentClass}`}>
                  <span className={`row-span-2 flex size-8 items-center justify-center rounded-lg text-white sm:size-10 sm:rounded-xl ${["bg-[#27744b]", "bg-[#3d7791]", "bg-[#c28624]", "bg-[#7558a1]"][idx % 4]}`}><Icon className="size-4 sm:size-5" /></span>
                  <span className="col-start-2 block text-sm font-black sm:mt-3 sm:text-base">{r.label}</span>
                  <p className="col-start-2 row-start-2 mt-0.5 text-[11px] leading-4 text-[#536b5a] sm:mt-1 sm:text-xs sm:leading-5">{r.description}</p>
                  <span className="col-start-3 row-span-2 row-start-1 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#365d3b] sm:mt-3"><span className="hidden sm:inline">Masuk</span><ArrowRight className="size-4 sm:size-3" /></span>
                </Link>
              );
            })}
          </div>
        </section>
        <footer className="border-t py-4 text-xs text-[#607364]">SAJATI - Kabupaten Tasikmalaya</footer>
      </main>
    </div>
  );
}
