"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const CadastreMap = dynamic(() => import("@/components/map/CadastreMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-[calc(100vh-12rem)] w-full rounded-lg" />,
});

export default function CadastreMapPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Plan Cadastral</h1>
        <p className="text-muted-foreground">
          Visualisation des parcelles rattachées aux entités — chargement par zone visible
        </p>
      </div>
      <CadastreMap />
    </div>
  );
}
