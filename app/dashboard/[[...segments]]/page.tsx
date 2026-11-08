import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DashboardExperience } from "@/app/DashboardExperience";
import { DASHBOARD_FEATURE_PATHS } from "@/lib/dashboard-routes";

async function DashboardContent({ params }: PageProps<"/dashboard/[[...segments]]">) {
  const { segments } = await params;
  if (segments?.length && !DASHBOARD_FEATURE_PATHS.has(segments.join("/"))) notFound();
  return <DashboardExperience />;
}

export default function DashboardPage(props: PageProps<"/dashboard/[[...segments]]">) {
  return <Suspense fallback={<div className="min-h-screen bg-[#e9edd9]" aria-label="Memuat dashboard" />}><DashboardContent {...props} /></Suspense>;
}
