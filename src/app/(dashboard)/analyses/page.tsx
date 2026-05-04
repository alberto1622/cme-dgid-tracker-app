"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  ChevronLeft,
  ChevronRight,
  Database,
  Eye,
  FileSearch,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { api, buildQuery } from "@/lib/api";

const TYPE_BADGES: Record<string, string> = {
  SCI: "bg-green-100 text-green-800",
  Promoteur: "bg-yellow-100 text-yellow-800",
  Agence: "bg-orange-100 text-orange-800",
  Constructeur: "bg-blue-100 text-blue-800",
  Lotisseur: "bg-purple-100 text-purple-800",
  Autre: "bg-gray-100 text-gray-800",
};

type EntityRow = {
  id: number;
  ninea: string | null;
  type: string;
  denomination: string;
};

type Page = { data: EntityRow[]; total: number };

const LIMIT = 20;

function useAnalysisPage(url: string) {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page>({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<Page>(url + buildQuery({ limit: LIMIT, offset: page * LIMIT }))
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setData({ data: [], total: 0 });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url, page]);

  return { ...data, loading, page, setPage };
}

function AnalysisTable({
  data,
  loading,
  page,
  setPage,
  total,
}: {
  data: EntityRow[];
  loading: boolean;
  page: number;
  setPage: (p: number) => void;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Aucune incohérence détectée</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground border-b">
            <tr>
              <th className="py-2 px-3">NINEA</th>
              <th className="py-2 px-3">Dénomination</th>
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entity) => (
              <tr key={entity.id} className="border-b hover:bg-muted/40">
                <td className="py-2 px-3 font-mono text-xs">{entity.ninea || "-"}</td>
                <td className="py-2 px-3 font-medium max-w-xs truncate">{entity.denomination}</td>
                <td className="py-2 px-3">
                  <Badge className={TYPE_BADGES[entity.type] || TYPE_BADGES.Autre}>{entity.type}</Badge>
                </td>
                <td className="py-2 px-3">
                  <Link href={`/entites/${entity.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} sur {totalPages} ({total.toLocaleString()} résultats)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalysisPage() {
  const cmeNotAnsd = useAnalysisPage("/api/analysis/cme-not-ansd");
  const ansdNotCme = useAnalysisPage("/api/analysis/ansd-not-cme");
  const scraperNotCme = useAnalysisPage("/api/analysis/scraper-not-cme");

  const [stats, setStats] = useState<{ total: number } | null>(null);
  useEffect(() => {
    api.get<{ total: number }>("/api/dashboard/statistics").then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analyse Croisée Multi-Sources</h1>
        <p className="text-muted-foreground">
          Détection des incohérences entre CME, ANSD, SIGTAS, SVLMOD et sources web
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          color="border-l-red-500"
          title="CME sans ANSD"
          description="SCI dans CME absentes de l'ANSD"
          value={cmeNotAnsd.total}
          valueColor="text-red-600"
        />
        <SummaryCard
          icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />}
          color="border-l-yellow-500"
          title="ANSD sans CME"
          description="SCI dans ANSD absentes du CME"
          value={ansdNotCme.total}
          valueColor="text-yellow-600"
        />
        <SummaryCard
          icon={<FileSearch className="h-5 w-5 text-orange-500" />}
          color="border-l-orange-500"
          title="Web sans CME"
          description="Promoteurs/Agences web non enregistrés"
          value={scraperNotCme.total}
          valueColor="text-orange-600"
        />
        <SummaryCard
          icon={<Database className="h-5 w-5 text-green-500" />}
          color="border-l-green-500"
          title="Total Consolidé"
          description="Entités dans la base de référence"
          value={stats?.total ?? 0}
          valueColor="text-green-600"
        />
      </div>

      <Tabs defaultValue="cme-not-ansd" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-2xl">
          <TabsTrigger value="cme-not-ansd">CME sans ANSD ({cmeNotAnsd.total.toLocaleString()})</TabsTrigger>
          <TabsTrigger value="ansd-not-cme">ANSD sans CME ({ansdNotCme.total.toLocaleString()})</TabsTrigger>
          <TabsTrigger value="scraper-not-cme">Web sans CME ({scraperNotCme.total.toLocaleString()})</TabsTrigger>
        </TabsList>

        <TabsContent value="cme-not-ansd">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                SCI présentes dans CME mais absentes de l'ANSD
              </CardTitle>
              <CardDescription>
                Ces entités sont enregistrées au CME mais n'apparaissent pas dans la base de l'ANSD.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalysisTable {...cmeNotAnsd} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ansd-not-cme">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                SCI présentes dans ANSD mais absentes du CME
              </CardTitle>
              <CardDescription>
                Pourrait nécessiter un transfert vers le Centre des Moyennes Entreprises.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalysisTable {...ansdNotCme} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scraper-not-cme">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-orange-500" />
                Promoteurs et Agences du Web non enregistrés au CME
              </CardTitle>
              <CardDescription>Contribuables potentiels non déclarés.</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalysisTable {...scraperNotCme} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({
  icon,
  color,
  title,
  description,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  description: string;
  value: number;
  valueColor: string;
}) {
  return (
    <Card className={`border-l-4 ${color}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${valueColor}`}>{value.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}
