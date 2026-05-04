"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  Database,
  FileText,
  History,
  Home,
  Loader2,
  Mail,
  MapPin,
  Phone,
  XCircle,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";

const TYPE_COLORS: Record<string, string> = {
  SCI: "bg-green-500",
  Promoteur: "bg-yellow-500",
  Agence: "bg-orange-500",
  Constructeur: "bg-blue-500",
  Lotisseur: "bg-purple-500",
  Autre: "bg-gray-500",
};

type Property = {
  id: number;
  reference: string | null;
  typeBien: string | null;
  designation: string | null;
  adresse: string | null;
  superficie: string | null;
  etat: string | null;
};

type ReportRow = { id: number; type: string; titre: string; createdAt: string };
type AuditLog = { id: number; action: string; createdAt: string };

type EntityFull = {
  id: number;
  ninea: string | null;
  type: string;
  denomination: string;
  enseigne: string | null;
  sigle: string | null;
  registreCommerce: string | null;
  formeJuridique: string | null;
  capital: string | null;
  telephone: string | null;
  telephoneMobile: string | null;
  email: string | null;
  adresse: string | null;
  localite: string | null;
  region: string | null;
  departement: string | null;
  activite: string | null;
  secteurActivite: string | null;
  centreFiscal: string | null;
  regimeFiscal: string | null;
  dateEnregistrement: string | null;
  zone: string | null;
  latitude: string | null;
  longitude: string | null;
  nombreBiens: number | null;
  valeurTotaleBiens: string | null;
  status: string | null;
  presentCME: boolean | null;
  presentANSD: boolean | null;
  presentSIGTAS: boolean | null;
  presentSVLMOD: boolean | null;
  presentScraper: boolean | null;
  properties: Property[];
  reports: ReportRow[];
  auditLogs: AuditLog[];
};

function InfoRow({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: React.ComponentType<{ className?: string }> }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2 border-b last:border-0">
      {Icon && <Icon className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />}
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

function SourceBadge({ present, label }: { present?: boolean | null; label: string }) {
  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg ${present ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
      {present ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
      <span className={present ? "text-green-800" : "text-red-800"}>{label}</span>
    </div>
  );
}

export default function EntityDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const entityId = parseInt(params.id || "0", 10);

  const [entity, setEntity] = useState<EntityFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    try {
      const data = await api.get<EntityFull>(`/api/entities/${entityId}/full`);
      setEntity(data);
    } catch {
      setEntity(null);
    } finally {
      setLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleGenerateReport = async (type: "fiche_entite" | "inventaire_biens") => {
    setGenerating(true);
    try {
      const res = await api.post<{ titre: string }>("/api/reports/generate", { entityId, type });
      toast.success(`Rapport "${res.titre}" généré`);
      await load();
    } catch {
      toast.error("Erreur lors de la génération du rapport");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Entité non trouvée</h2>
        <Button className="mt-4" onClick={() => router.push("/entites")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/entites">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className={`w-3 h-3 rounded-full ${TYPE_COLORS[entity.type] || TYPE_COLORS.Autre}`} />
              <h1 className="text-2xl font-bold">{entity.denomination}</h1>
              <Badge>{entity.type}</Badge>
              <Badge variant={entity.status === "actif" ? "default" : entity.status === "inactif" ? "destructive" : "secondary"}>
                {entity.status === "actif" ? "Actif" : entity.status === "inactif" ? "Inactif" : "Non vérifié"}
              </Badge>
            </div>
            {entity.ninea && (
              <p className="text-muted-foreground mt-1">
                NINEA : <span className="font-mono">{entity.ninea}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => handleGenerateReport("fiche_entite")} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            Générer Fiche
          </Button>
          <Button variant="outline" onClick={() => handleGenerateReport("inventaire_biens")} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Home className="h-4 w-4 mr-2" />}
            Inventaire Biens
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="properties">Biens ({entity.properties.length})</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="reports">Rapports ({entity.reports.length})</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Identification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow label="Dénomination" value={entity.denomination} />
                <InfoRow label="Enseigne" value={entity.enseigne} />
                <InfoRow label="Sigle" value={entity.sigle} />
                <InfoRow label="NINEA" value={entity.ninea} />
                <InfoRow label="Registre de Commerce" value={entity.registreCommerce} />
                <InfoRow label="Forme Juridique" value={entity.formeJuridique} />
                <InfoRow label="Capital" value={entity.capital} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow label="Téléphone" value={entity.telephone} icon={Phone} />
                <InfoRow label="Mobile" value={entity.telephoneMobile} icon={Phone} />
                <InfoRow label="Email" value={entity.email} icon={Mail} />
                <InfoRow label="Adresse" value={entity.adresse} icon={MapPin} />
                <InfoRow label="Localité" value={entity.localite} />
                <InfoRow label="Région" value={entity.region} />
                <InfoRow label="Département" value={entity.departement} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Activité & Fiscalité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow label="Activité" value={entity.activite} />
                <InfoRow label="Secteur d'activité" value={entity.secteurActivite} />
                <InfoRow label="Centre Fiscal" value={entity.centreFiscal} />
                <InfoRow label="Régime Fiscal" value={entity.regimeFiscal} />
                <InfoRow
                  label="Date d'enregistrement"
                  value={entity.dateEnregistrement ? new Date(entity.dateEnregistrement).toLocaleDateString("fr-FR") : null}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localisation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow label="Zone" value={entity.zone} />
                <InfoRow label="Latitude" value={entity.latitude} />
                <InfoRow label="Longitude" value={entity.longitude} />
                <InfoRow label="Nombre de biens" value={entity.nombreBiens?.toString()} />
                <InfoRow label="Valeur totale biens" value={entity.valeurTotaleBiens} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Biens immobiliers
              </CardTitle>
              <CardDescription>Liste des biens gérés par cette entité</CardDescription>
            </CardHeader>
            <CardContent>
              {entity.properties.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground border-b">
                      <tr>
                        <th className="py-2 px-3">Référence</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Désignation</th>
                        <th className="py-2 px-3">Adresse</th>
                        <th className="py-2 px-3">Superficie</th>
                        <th className="py-2 px-3">État</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entity.properties.map((p) => (
                        <tr key={p.id} className="border-b">
                          <td className="py-2 px-3 font-mono text-xs">{p.reference || "-"}</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline">{p.typeBien || "N/A"}</Badge>
                          </td>
                          <td className="py-2 px-3 max-w-xs truncate">{p.designation || "-"}</td>
                          <td className="py-2 px-3 max-w-xs truncate text-muted-foreground">{p.adresse || "-"}</td>
                          <td className="py-2 px-3">{p.superficie || "-"}</td>
                          <td className="py-2 px-3">
                            <Badge variant={p.etat === "occupe" ? "default" : "secondary"}>{p.etat || "N/A"}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun bien immobilier enregistré</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Présence dans les sources de données
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SourceBadge present={entity.presentCME} label="CME (Centre des Moyennes Entreprises)" />
                <SourceBadge present={entity.presentANSD} label="ANSD (Agence Nationale de la Statistique)" />
                <SourceBadge present={entity.presentSIGTAS} label="SIGTAS (Système de Gestion des Taxes)" />
                <SourceBadge present={entity.presentSVLMOD} label="SVLMOD" />
                <SourceBadge present={entity.presentScraper} label="Scraper Web Immobilier" />
              </div>

              {!entity.presentCME && (entity.presentANSD || entity.presentScraper) && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 font-medium">⚠️ Cette entité n'est pas enregistrée au CME</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    Présente dans d'autres sources mais pas au CME — contribuable potentiel non déclaré.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Rapports générés
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entity.reports.length > 0 ? (
                <div className="space-y-3">
                  {entity.reports.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{r.titre}</p>
                        <p className="text-sm text-muted-foreground">{new Date(r.createdAt).toLocaleString("fr-FR")}</p>
                      </div>
                      <Badge variant="outline">{r.type}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun rapport généré</p>
                  <Button className="mt-4" onClick={() => handleGenerateReport("fiche_entite")} disabled={generating}>
                    Générer un rapport
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historique des modifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entity.auditLogs.length > 0 ? (
                <div className="space-y-4">
                  {entity.auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-3 border rounded-lg">
                      <div
                        className={`w-2 h-2 mt-2 rounded-full ${
                          log.action === "create"
                            ? "bg-green-500"
                            : log.action === "update"
                              ? "bg-blue-500"
                              : log.action === "delete"
                                ? "bg-red-500"
                                : "bg-purple-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-medium">
                          {log.action === "create"
                            ? "Création"
                            : log.action === "update"
                              ? "Modification"
                              : log.action === "delete"
                                ? "Suppression"
                                : "Validation"}
                        </p>
                        <p className="text-sm text-muted-foreground">{new Date(log.createdAt).toLocaleString("fr-FR")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Aucun historique disponible</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
