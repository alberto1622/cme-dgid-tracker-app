"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

type Entity = {
  id: number;
  ninea: string | null;
  type: string;
  denomination: string;
  enseigne: string | null;
  sigle: string | null;
  adresse: string | null;
  localite: string | null;
  region: string | null;
  departement: string | null;
  telephone: string | null;
  telephoneMobile: string | null;
  email: string | null;
  formeJuridique: string | null;
  activite: string | null;
  secteurActivite: string | null;
  centreFiscal: string | null;
  regimeFiscal: string | null;
  capital: string | null;
  registreCommerce: string | null;
  status: string | null;
  zone: string | null;
  presentCME: boolean | null;
  presentANSD: boolean | null;
  presentSIGTAS: boolean | null;
  presentSVLMOD: boolean | null;
  presentScraper: boolean | null;
};

export default function EntityDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<Entity>(`/api/entities/${id}`)
      .then(setEntity)
      .catch((e) => setError(e.message ?? "Erreur"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{error ?? "Entité introuvable"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sources = [
    { label: "CME", on: entity.presentCME },
    { label: "ANSD", on: entity.presentANSD },
    { label: "SIGTAS", on: entity.presentSIGTAS },
    { label: "SVLMOD", on: entity.presentSVLMOD },
    { label: "Web", on: entity.presentScraper },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div className="flex gap-2">
          {sources.map((s) => (
            <Badge key={s.label} variant={s.on ? "default" : "outline"}>
              {s.label}
            </Badge>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{entity.denomination}</CardTitle>
              {entity.enseigne && <p className="text-muted-foreground mt-1">{entity.enseigne}</p>}
            </div>
            <Badge>{entity.type}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <Field label="NINEA" value={entity.ninea} mono />
            <Field label="Sigle" value={entity.sigle} />
            <Field label="Forme juridique" value={entity.formeJuridique} />
            <Field label="Registre du commerce" value={entity.registreCommerce} />
            <Field label="Capital" value={entity.capital} />
            <Field label="Statut" value={entity.status} />
            <Field label="Adresse" value={entity.adresse} />
            <Field label="Localité" value={entity.localite} />
            <Field label="Région" value={entity.region} />
            <Field label="Département" value={entity.departement} />
            <Field label="Zone" value={entity.zone} />
            <Field label="Téléphone" value={entity.telephone} />
            <Field label="Mobile" value={entity.telephoneMobile} />
            <Field label="Email" value={entity.email} />
            <Field label="Activité" value={entity.activite} />
            <Field label="Secteur" value={entity.secteurActivite} />
            <Field label="Centre fiscal" value={entity.centreFiscal} />
            <Field label="Régime fiscal" value={entity.regimeFiscal} />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs uppercase tracking-wide">{label}</dt>
      <dd className={`mt-0.5 ${mono ? "font-mono" : "font-medium"}`}>{value || "—"}</dd>
    </div>
  );
}
