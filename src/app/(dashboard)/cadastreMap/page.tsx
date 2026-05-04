"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Map } from "lucide-react";

export default function CadastreMapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plan Cadastral</h1>
        <p className="text-muted-foreground">Visualisation des parcelles rattachées aux entités</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Bientôt disponible
          </CardTitle>
          <CardDescription>La carte cadastrale nécessite l'installation de Leaflet</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Installer <code className="font-mono">leaflet react-leaflet</code> et créer une route{" "}
              <code className="font-mono">/api/map/parcelles</code> retournant les centroïdes/géométries des parcelles
              dans la zone visible. La carte doit être chargée en <code className="font-mono">dynamic(import, ssr: false)</code>.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
