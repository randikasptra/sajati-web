import LoginForm from "./LoginForm";
import type { ActiveRole } from "@/lib/store";

const VALID_ROLES: ActiveRole[] = ["warga", "petugas", "admin", "kopdes", "kecamatan", "bumd", "mitra", "kabupaten"];

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const requestedRole = typeof params.role === "string" && VALID_ROLES.includes(params.role as ActiveRole)
    ? params.role as ActiveRole
    : "warga";

  return <LoginForm initialRole={requestedRole} />;
}
