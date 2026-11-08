import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { DASHBOARD_FEATURE_PATHS } from "@/lib/dashboard-routes";

async function LegacyRedirect({ params }: PageProps<"/[...segments]">) {
  const { segments } = await params;
  const path = segments.join("/");
  if (!DASHBOARD_FEATURE_PATHS.has(path)) notFound();
  return redirect(`/dashboard/${path}`);
}

export default function LegacyFeaturePage(props: PageProps<"/[...segments]">) {
  return <Suspense fallback={<div className="min-h-screen bg-[#e9edd9]" aria-label="Mengalihkan halaman" />}><LegacyRedirect {...props} /></Suspense>;
}
