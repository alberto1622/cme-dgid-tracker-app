"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Calendar, Eye, FileText } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

type Report = {
  id: number;
  entityId: number | null;
  type: string;
  titre: string;
  createdAt: string;
};

const TYPE_LABEL: Record<string, string> = {
  fiche_entite: "Fiche Entité",
  analyse_fiscale: "Analyse Fiscale",
  inventaire_biens: "Inventaire Biens",
  rapport_global: "Rapport Global",
};

const TYPE_COLOR: Record<string, string> = {
  fiche_entite: "bg-blue-100 text-blue-800",
  analyse_fiscale: "bg-green-100 text-green-800",
  inventaire_biens: "bg-yellow-100 text-yellow-800",
  rapport_global: "bg-purple-100 text-purple-800",
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Report[]>("/api/reports")
      .then(setReports)
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rapports</h1>
        <p className="text-muted-foreground">Historique des rapports générés</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rapports Générés
          </CardTitle>
          <CardDescription>
            Pour générer un rapport, accédez à la fiche d'une entité.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{r.titre}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <Badge className={TYPE_COLOR[r.type] || "bg-gray-100 text-gray-800"}>
                          {TYPE_LABEL[r.type] || r.type}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                  </div>
                  {r.entityId && (
                    <Link href={`/entites/${r.entityId}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir entité
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun rapport généré</p>
              <Link href="/entites">
                <Button className="mt-4">
                  <Building2 className="h-4 w-4 mr-2" />
                  Voir les entités
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
