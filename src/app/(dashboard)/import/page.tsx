"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Upload } from "lucide-react";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Import de Données</h1>
        <p className="text-muted-foreground">Importez des fichiers Excel ou CSV pour enrichir la base</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bientôt disponible
          </CardTitle>
          <CardDescription>L'import de fichiers nécessite une configuration supplémentaire</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Cette page sera fonctionnelle après installation du paquet <code className="font-mono">xlsx</code> et
              implémentation du parser de fichiers (entités et parcelles). Les colonnes attendues, le mapping
              et la validation Zod seront branchés sur les routes <code className="font-mono">/api/import/*</code>.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
