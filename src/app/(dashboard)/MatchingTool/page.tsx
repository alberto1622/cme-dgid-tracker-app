"use client";

import { useEffect, useState } from "react";
import { Info, TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/lib/api";

type Stats = { total: number; linked: number; unlinked: number };

export default function MatchingToolPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Stats>("/api/matching/stats")
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Matching Parcelles-Entités</h1>
        <p className="text-muted-foreground">État du rapprochement entre parcelles cadastrales et entités</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total parcelles" value={stats.total} />
          <StatCard label="Rattachées" value={stats.linked} valueClass="text-green-600" pct={stats.linked / Math.max(1, stats.total)} />
          <StatCard label="Non rattachées" value={stats.unlinked} valueClass="text-orange-600" pct={stats.unlinked / Math.max(1, stats.total)} />
        </div>
      ) : (
        <Alert>
          <AlertDescription>Impossible de charger les statistiques.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Algorithme de matching
          </CardTitle>
          <CardDescription>Génération automatique de suggestions parcelles ↔ entités</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Le moteur de suggestions (basé sur NICAD, dénomination, adresse et géolocalisation) sera implémenté
              ultérieurement. Les statistiques ci-dessus reflètent l'état actuel du rapprochement en base.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, valueClass, pct }: { label: string; value: number; valueClass?: string; pct?: number }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClass ?? ""}`}>{value.toLocaleString("fr-FR")}</div>
        {pct !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">{(pct * 100).toFixed(1)}% du total</p>
        )}
      </CardContent>
    </Card>
  );
}
