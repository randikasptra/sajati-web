"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole, Mail, ShieldCheck, Sprout } from "lucide-react";
import type { ActiveRole } from "@/lib/store";

const ACCOUNTS: { role: ActiveRole; label: string; email: string; hint: string }[] = [
  { role: "warga", label: "Warga", email: "siti.aminah@sajati.demo", hint: "Setor dan tukar manfaat" },
  { role: "petugas", label: "Petugas Desa", email: "petugas.sukamanah@sajati.demo", hint: "Timbang dan verifikasi" },
  { role: "admin", label: "Admin Desa", email: "admin.sukamanah@sajati.demo", hint: "Persetujuan dan pencatatan" },
  { role: "kopdes", label: "Kopdes", email: "kopdes.sukamanah@sajati.demo", hint: "Katalog dan penukaran" },
  { role: "kecamatan", label: "Kecamatan", email: "operator.singaparna@sajati.demo", hint: "Konsolidasi material" },
  { role: "bumd", label: "BUMD Kabupaten", email: "bumd.tasikmalaya@sajati.demo", hint: "Dana dan jalur material" },
  { role: "mitra", label: "Mitra Pengolah", email: "mitra.pengolah@sajati.demo", hint: "Pengolahan material" },
  { role: "kabupaten", label: "Pemerintah Kabupaten", email: "dashboard.kabupaten@sajati.demo", hint: "Pantau kinerja wilayah" },
];

export default function LoginForm({ initialRole }: { initialRole: ActiveRole }) {
  const router = useRouter();
  const [error,setError]=useState("");
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState(ACCOUNTS.find((account) => account.role === initialRole)!.email);
  const [password, setPassword] = useState("sajati123");
  const account = ACCOUNTS.find((item) => item.role === role)!;

  function selectRole(nextRole: ActiveRole) {
    setRole(nextRole);
    setEmail(ACCOUNTS.find((item) => item.role === nextRole)!.email);
  }

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim().toLowerCase() !== account.email || password !== "sajati123") { setError("Email atau kata sandi tidak sesuai dengan akun yang dipilih."); return; }
    localStorage.setItem("sajati_identity", JSON.stringify({role,wargaId:role === "warga" ? "w1" : null,wilayah:role === "kecamatan" ? "kec-singaparna" : ["bumd","kabupaten"].includes(role) ? "kab-tasikmalaya" : "desa-sukamanah"}));
    localStorage.setItem("sajati_demo_session", role);
    localStorage.setItem("sajati_active_role", JSON.stringify(role));
    window.dispatchEvent(new Event("sajati_session_change"));
    router.replace("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#153c2d] text-[#183c2c] md:grid md:grid-cols-[1fr_1fr]">
      <section className="relative isolate hidden min-h-screen flex-col justify-between overflow-hidden bg-[#153c2d] p-10 text-[#f7f4df] md:flex md:p-14">
        <div aria-hidden="true" className="absolute -right-24 top-16 -z-10 size-80 rounded-full border-[34px] border-[#a8c85f]/15" />
        <Link href="/" className="flex w-fit items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5df73]">
          <Image src="/img/SAJATI_Logo.png" alt="Logo SAJATI" width={56} height={56} className="size-14 rounded-full bg-white object-cover object-[center_18%]" />
          <span><strong className="block text-sm tracking-[0.2em]">SAJATI</strong><small className="text-[10px] uppercase tracking-[0.15em] text-[#c3d4b8]">Tasikmalaya · 2026</small></span>
        </Link>
        <div className="relative max-w-xl py-8 md:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#a8c85f]/40 bg-[#a8c85f]/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#c5df73]"><Sprout className="size-3.5" />Akses ekosistem SAJATI</span>
          <h1 className="mt-6 text-4xl font-black leading-[1.04] sm:text-5xl">Satu akun untuk ikut <span className="text-[#c5df73]">menggerakkan perubahan.</span></h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-[#d7e2d3]">Masuk sebagai warga, petugas, pengelola, atau mitra. Setiap peran melanjutkan alur pengelolaan sampah dari sumber hingga pulih.</p>
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#c5df73]" /><p className="text-xs leading-5 text-[#d7e2d3]">Kelola setoran, pantau manfaat, dan ikuti perjalanan material dalam satu layanan.</p></div>
        </div>
        <Link href="/" className="inline-flex w-fit items-center gap-2 text-xs font-bold text-[#d5e0cf] hover:text-white"><ArrowLeft className="size-4" />Kembali ke landing page</Link>
      </section>

      <section className="flex min-h-screen flex-col items-center justify-center bg-[#e9edd9] px-4 py-4 sm:px-8 md:px-12">
        <div className="mb-3 flex w-full max-w-md items-center justify-between md:hidden">
          <Link href="/" aria-label="Kembali ke landing page" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#478052]">
            <Image src="/img/SAJATI_Logo.png" alt="" width={40} height={40} className="size-10 rounded-full bg-white object-cover object-[center_18%] shadow-sm" />
            <span><strong className="block text-xs tracking-[0.18em] text-[#174c35]">SAJATI</strong><small className="text-[9px] uppercase tracking-wider text-[#657465]">Tasikmalaya · 2026</small></span>
          </Link>
          <Link href="/" className="text-[11px] font-bold text-[#315b40] hover:underline">Kembali</Link>
        </div>
        <div className="w-full max-w-md rounded-[1.5rem] border-2 border-[#d2d8c2] bg-[#fbfaf2] p-4 shadow-[0_10px_0_rgba(12,46,31,0.12)] sm:rounded-[1.75rem] sm:p-8 md:p-8">
          <div className="mb-4 sm:mb-7"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#658050]">Selamat datang kembali</p><h2 className="mt-1.5 text-2xl font-black tracking-tight sm:mt-2 sm:text-3xl">Masuk akun</h2><p className="mt-1.5 text-xs text-[#657465] sm:mt-2 sm:text-sm">Masuk untuk mengakses layanan sesuai peranmu.</p></div>
          {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
          <form onSubmit={login} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2"><label htmlFor="role" className="text-xs font-bold text-[#415a48]">Peran akun</label><select id="role" value={role} onChange={(event) => selectRole(event.target.value as ActiveRole)} className="h-11 w-full rounded-xl border-2 border-[#d2d8c2] bg-white px-3 text-sm font-semibold outline-none focus:border-[#478052] sm:h-12">{ACCOUNTS.map((item) => <option key={item.role} value={item.role}>{item.label}</option>)}</select><p className="text-[10px] text-[#70806e] sm:text-[11px]">{account.hint}</p></div>
            <div className="space-y-1.5 sm:space-y-2"><label htmlFor="email" className="text-xs font-bold text-[#415a48]">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71846d]" /><input id="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-xl border-2 border-[#d2d8c2] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#478052] sm:h-12" /></div></div>
            <div className="space-y-1.5 sm:space-y-2"><label htmlFor="password" className="text-xs font-bold text-[#415a48]">Kata sandi</label><div className="relative"><LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71846d]" /><input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-xl border-2 border-[#d2d8c2] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#478052] sm:h-12" /></div></div>
            <details className="rounded-xl border p-3 text-xs"><summary className="cursor-pointer font-semibold">Akun untuk mencoba</summary><p className="mt-2 break-all">{account.email}</p><p>Kata sandi: <code>sajati123</code></p></details>
            <button type="submit" className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#145337] px-4 text-sm font-extrabold text-white shadow-md transition-colors hover:bg-[#0c422c] sm:h-12">Masuk sebagai {account.label}<ArrowRight className="size-4" /></button>
          </form>
          <p className="mt-5 text-center text-[10px] leading-4 text-[#788476]">Versi demonstrasi - data tersimpan pada perangkat ini.</p>
        </div>
      </section>
    </main>
  );
}
