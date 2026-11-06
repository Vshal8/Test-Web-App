import { Suspense } from "react";
import { CompaniesScreen } from "@/components/companies/companies-screen";
import { CompaniesRouteFallback } from "@/components/route-fallback";

export default function CompaniesPage() {
  return (
    <Suspense fallback={<CompaniesRouteFallback />}>
      <CompaniesScreen />
    </Suspense>
  );
}
