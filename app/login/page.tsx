import { Suspense } from "react";
﻿import LoginForm from "./LoginForm";
import type { ActiveRole } from "@/lib/store";

const VALID_ROLES: ActiveRole[] = ["warga", "petugas", "admin", "kopdes", "kecamatan", "bumd", "mitra", "kabupaten"];

async function LoginContent({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const requestedRole = typeof params.role === "string" && VALID_ROLES.includes(params.role as ActiveRole)
    ? params.role as ActiveRole
    : "warga";

  return <LoginForm initialRole={requestedRole} />;
}

export default function LoginPage(props: PageProps<"/login">) {
 return <Suspense fallback={<main className="min-h-screen bg-[#e9edd9]" aria-label="Memuat halaman masuk" />}><LoginContent {...props} /></Suspense>;
}
