"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Building2, AlertTriangle, FileSearch, Map, TrendingUp, Database, Users, Home, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, LabelList } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
];

type Stats = {
  total: number;
  sci: number;
  promoteurs: number;
  agences: number;
  cmeOnly: number;
  ansdOnly: number;
  scraperNotCME: number;
  unresolvedAlerts: number;
};

type TypeDistribution = { type: string; count: number };
type CentreFiscalDistribution = { centreFiscal: string | null; count: number };
type DataSource = {
  id: number;
  name: string;
  status: "completed" | "error" | "pending" | "importing";
  recordCount: number | null;
  lastImport: string | null;
};

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function StatCard({ title, value, icon: Icon, description, color, href }: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  color: string;
  href?: string;
}) {
  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [typeDistribution, setTypeDistribution] = useState<TypeDistribution[]>([]);
  const [centreFiscalDistribution, setCentreFiscalDistribution] = useState<CentreFiscalDistribution[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [s, td, cfd, ds] = await Promise.all([
        fetchJson<Stats>("/api/dashboard/statistics"),
        fetchJson<TypeDistribution[]>("/api/dashboard/type-distribution"),
        fetchJson<CentreFiscalDistribution[]>("/api/dashboard/centre-fiscal-distribution"),
        fetchJson<DataSource[]>("/api/dashboard/data-sources"),
      ]);

      if (cancelled) return;
      setStats(s);
      setTypeDistribution(td ?? []);
      setCentreFiscalDistribution(cfd ?? []);
      setDataSources(ds ?? []);
      setStatsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const pieData = typeDistribution.map((item, index) => ({
    name: item.type,
    value: item.count,
    color: COLORS[index % COLORS.length],
  }));

  const pieConfig: ChartConfig = {
    value: { label: "Entités" },
    ...Object.fromEntries(
      pieData.map((d, i) => [d.name, { label: d.name, color: COLORS[i % COLORS.length] }]),
    ),
  };

  const barData = centreFiscalDistribution.slice(0, 10).map((item) => ({
    name: item.centreFiscal?.substring(0, 15) || "N/A",
    count: item.count,
  }));

  const barConfig: ChartConfig = {
    count: { label: "Entités", color: "var(--chart-1)" },
  };

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tableau de Bord</h1>
          <p className="text-muted-foreground">Vue d&apos;ensemble du Centre des Moyennes Entreprises</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Database className="h-3 w-3 mr-1" />
          {stats?.total || 0} entités consolidées
        </Badge>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Entités"
          value={stats?.total || 0}
          icon={Building2}
          color="text-blue-600"
          href="/entities"
        />
        <StatCard
          title="SCI"
          value={stats?.sci || 0}
          icon={Home}
          description="Sociétés Civiles Immobilières"
          color="text-green-600"
        />
        <StatCard
          title="Promoteurs"
          value={stats?.promoteurs || 0}
          icon={TrendingUp}
          description="Promoteurs immobiliers"
          color="text-yellow-600"
        />
        <StatCard
          title="Agences"
          value={stats?.agences || 0}
          icon={Users}
          description="Agences immobilières"
          color="text-orange-600"
        />
      </div>

      {/* Alerts & Analysis Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="CME sans ANSD"
          value={stats?.cmeOnly || 0}
          icon={AlertTriangle}
          description="Entités à vérifier"
          color="text-red-600"
          href="/analyses"
        />
        <StatCard
          title="ANSD sans CME"
          value={stats?.ansdOnly || 0}
          icon={FileSearch}
          description="Transferts potentiels"
          color="text-yellow-600"
          href="/analyses"
        />
        <StatCard
          title="Web sans CME"
          value={stats?.scraperNotCME || 0}
          icon={Map}
          description="Contribuables potentiels"
          color="text-orange-600"
          href="/analyses"
        />
        <StatCard
          title="Alertes en cours"
          value={stats?.unresolvedAlerts || 0}
          icon={AlertTriangle}
          description="À traiter"
          color="text-red-600"
          href="/alerts"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Type</CardTitle>
            <CardDescription>Distribution des entités par catégorie</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ChartContainer config={pieConfig} className="mx-auto aspect-square max-h-[300px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    strokeWidth={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par Centre Fiscal</CardTitle>
            <CardDescription>Top 10 des centres fiscaux</CardDescription>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ChartContainer config={barConfig} className="max-h-[300px] w-full">
                <BarChart data={barData} layout="vertical" margin={{ left: 12, right: 24 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="count" position="right" className="fill-foreground" fontSize={12} />
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Sources Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sources de Données
          </CardTitle>
          <CardDescription>État des importations de données</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {dataSources.length > 0 ? (
              dataSources.map((source) => (
                <div key={source.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{source.name}</span>
                    <Badge variant={source.status === "completed" ? "default" : source.status === "error" ? "destructive" : "secondary"}>
                      {source.status === "completed" ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
                      {source.status}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">{source.recordCount || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    {source.lastImport ? new Date(source.lastImport).toLocaleDateString("fr-FR") : "Non importé"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground col-span-5 text-center py-4">
                Aucune source de données configurée
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/entities">
              <Button>
                <Building2 className="h-4 w-4 mr-2" />
                Voir les entités
              </Button>
            </Link>
            <Link href="/analysis">
              <Button variant="outline">
                <FileSearch className="h-4 w-4 mr-2" />
                Analyse croisée
              </Button>
            </Link>
            <Link href="/map">
              <Button variant="outline">
                <Map className="h-4 w-4 mr-2" />
                Carte cadastrale
              </Button>
            </Link>
            <Link href="/alerts">
              <Button variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Gérer les alertes
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
