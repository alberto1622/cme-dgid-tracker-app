"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { AlertTriangle, Bell, CheckCircle, Clock, Eye, Loader2, Mail } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { api, buildQuery } from "@/lib/api";

type AlertItem = {
  id: number;
  type: string;
  severity: "high" | "medium" | "low";
  description: string;
  resolved: boolean;
  entityId: number | null;
  createdAt: string;
};

const ALERT_TYPES: Record<string, { label: string; color: string }> = {
  missing_cme: { label: "Absent du CME", color: "bg-red-100 text-red-800" },
  missing_ansd: { label: "Absent de l'ANSD", color: "bg-yellow-100 text-yellow-800" },
  missing_registration: { label: "Non enregistré", color: "bg-orange-100 text-orange-800" },
  data_mismatch: { label: "Données incohérentes", color: "bg-purple-100 text-purple-800" },
  duplicate: { label: "Doublon potentiel", color: "bg-blue-100 text-blue-800" },
};

const SEVERITY_STYLES: Record<string, string> = {
  high: "border-l-4 border-l-red-500 bg-red-50",
  medium: "border-l-4 border-l-yellow-500 bg-yellow-50",
  low: "border-l-4 border-l-blue-500 bg-blue-50",
};

function AlertCard({
  alert,
  onResolve,
  canResolve,
}: {
  alert: AlertItem;
  onResolve: (id: number) => void;
  canResolve: boolean;
}) {
  const typeInfo = ALERT_TYPES[alert.type] || { label: alert.type, color: "bg-gray-100 text-gray-800" };
  const severityStyle = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.medium;

  return (
    <div className={`rounded-lg p-4 ${severityStyle}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
            <Badge variant="outline" className="text-xs">
              {alert.severity === "high" ? "Haute" : alert.severity === "medium" ? "Moyenne" : "Basse"}
            </Badge>
          </div>
          <p className="text-sm font-medium">{alert.description}</p>
          <p className="text-xs text-muted-foreground mt-2">
            <Clock className="inline h-3 w-3 mr-1" />
            {new Date(alert.createdAt).toLocaleString("fr-FR")}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {alert.entityId && (
            <Link href={`/entites/${alert.entityId}`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Voir
              </Button>
            </Link>
          )}
          {canResolve && !alert.resolved && (
            <Button variant="default" size="sm" onClick={() => onResolve(alert.id)}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Résoudre
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [pending, setPending] = useState<AlertItem[]>([]);
  const [resolved, setResolved] = useState<AlertItem[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [resolvedLoading, setResolvedLoading] = useState(true);
  const [notifyLoading, setNotifyLoading] = useState(false);

  const loadPending = useCallback(async () => {
    setPendingLoading(true);
    try {
      const data = await api.get<AlertItem[]>("/api/alerts" + buildQuery({ resolved: false, limit: 50 }));
      setPending(data);
    } catch (e) {
      toast.error("Erreur de chargement des alertes en attente");
    } finally {
      setPendingLoading(false);
    }
  }, []);

  const loadResolved = useCallback(async () => {
    setResolvedLoading(true);
    try {
      const data = await api.get<AlertItem[]>("/api/alerts" + buildQuery({ resolved: true, limit: 50 }));
      setResolved(data);
    } catch (e) {
      toast.error("Erreur de chargement des alertes résolues");
    } finally {
      setResolvedLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
    loadResolved();
  }, [loadPending, loadResolved]);

  const handleResolve = async (id: number) => {
    try {
      await api.post(`/api/alerts/${id}/resolve`);
      toast.success("Alerte marquée comme résolue");
      await Promise.all([loadPending(), loadResolved()]);
    } catch (e) {
      toast.error("Erreur lors de la résolution");
    }
  };

  const handleCheckAndNotify = async () => {
    setNotifyLoading(true);
    try {
      const res = await api.post<{ notified: boolean; totalInconsistencies: number }>(
        "/api/alerts/check-and-notify",
      );
      if (res.notified) toast.success(`${res.totalInconsistencies} incohérences détectées`);
      else toast.info("Aucune incohérence à notifier");
    } catch (e) {
      toast.error("Erreur lors de la vérification");
    } finally {
      setNotifyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alertes</h1>
          <p className="text-muted-foreground">Gestion des incohérences et anomalies détectées</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold">{pending.length}</span>
            <span className="text-muted-foreground">en attente</span>
          </div>
          {isAdmin && (
            <Button onClick={handleCheckAndNotify} disabled={notifyLoading}>
              {notifyLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
              Vérifier
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          color="bg-red-100"
          value={pending.filter((a) => a.severity === "high").length}
          label="Alertes critiques"
        />
        <SummaryCard
          icon={<AlertTriangle className="h-6 w-6 text-yellow-600" />}
          color="bg-yellow-100"
          value={pending.filter((a) => a.severity === "medium").length}
          label="Alertes moyennes"
        />
        <SummaryCard
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          color="bg-green-100"
          value={resolved.length}
          label="Alertes résolues"
        />
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            <AlertTriangle className="h-4 w-4 mr-2" />
            En attente ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            <CheckCircle className="h-4 w-4 mr-2" />
            Résolues ({resolved.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertes en attente de traitement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingLoading ? (
                [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)
              ) : pending.length > 0 ? (
                pending.map((a) => <AlertCard key={a.id} alert={a} onResolve={handleResolve} canResolve={isAdmin} />)
              ) : (
                <EmptyState
                  icon={<CheckCircle className="h-12 w-12 text-green-500" />}
                  title="Aucune alerte en attente"
                  description="Toutes les incohérences ont été traitées"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertes résolues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resolvedLoading ? (
                [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)
              ) : resolved.length > 0 ? (
                resolved.map((a) => <AlertCard key={a.id} alert={a} onResolve={handleResolve} canResolve={false} />)
              ) : (
                <EmptyState
                  icon={<Bell className="h-12 w-12 text-muted-foreground" />}
                  title="Aucune alerte résolue"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({ icon, color, value, label }: { icon: React.ReactNode; color: string; value: number; label: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${color}`}>{icon}</div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto mb-4 flex justify-center">{icon}</div>
      <p className="text-muted-foreground">{title}</p>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
  );
}
