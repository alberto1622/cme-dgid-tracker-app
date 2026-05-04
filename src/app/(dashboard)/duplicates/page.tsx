"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, GitMerge, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/lib/api";

type Entity = {
  id: number;
  denomination: string;
  ninea: string | null;
  type: string | null;
  adresse: string | null;
  presentCME: boolean | null;
  presentANSD: boolean | null;
  presentSIGTAS: boolean | null;
  presentSVLMOD: boolean | null;
  presentScraper: boolean | null;
};

export default function DuplicatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState<"denomination" | "ninea">("denomination");
  const [results, setResults] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Veuillez saisir un terme de recherche");
      return;
    }
    setLoading(true);
    try {
      const data = await api.post<Entity[]>("/api/doublons/search", { query: searchQuery.trim(), searchBy });
      setResults(data);
      if (data.length === 0) toast.info("Aucune entité trouvée avec ces critères");
    } catch {
      toast.error("Erreur lors de la recherche");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev,
    );
  };

  const sourcesCount = (e: Entity) =>
    [e.presentCME, e.presentANSD, e.presentSIGTAS, e.presentSVLMOD, e.presentScraper].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestion des Doublons</h1>
        <p className="text-muted-foreground">Recherchez les entités similaires pour les analyser</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rechercher des doublons</CardTitle>
          <CardDescription>Par dénomination ou NINEA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={searchBy} onValueChange={(v) => setSearchBy(v as "denomination" | "ninea")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="denomination">Dénomination</SelectItem>
                <SelectItem value="ninea">NINEA</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={searchBy === "denomination" ? "Ex: SOCIETE IMMOBILIERE" : "Ex: 4947290"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>
          {loading && <p className="text-sm text-muted-foreground mt-4">Recherche en cours...</p>}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats ({results.length})</CardTitle>
            <CardDescription>Sélectionnez deux entités pour les comparer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {results.map((entity) => {
              const isSelected = selected.includes(entity.id);
              const sources = sourcesCount(entity);
              const dot = sources >= 3 ? "bg-green-500" : sources >= 2 ? "bg-yellow-500" : "bg-red-500";
              return (
                <div
                  key={entity.id}
                  onClick={() => toggleSelect(entity.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? "bg-primary/10 border-primary" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{entity.denomination}</h3>
                        <Badge variant="outline">{entity.type || "Non spécifié"}</Badge>
                        <div className={`w-2 h-2 rounded-full ${dot}`} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        NINEA: {entity.ninea || "N/A"} • {entity.adresse || "Adresse non renseignée"}
                      </p>
                      <div className="flex gap-1 mt-2">
                        {entity.presentCME && <Badge variant="secondary" className="text-xs">CME</Badge>}
                        {entity.presentANSD && <Badge variant="secondary" className="text-xs">ANSD</Badge>}
                        {entity.presentSIGTAS && <Badge variant="secondary" className="text-xs">SIGTAS</Badge>}
                        {entity.presentSVLMOD && <Badge variant="secondary" className="text-xs">SVLMOD</Badge>}
                        {entity.presentScraper && <Badge variant="secondary" className="text-xs">Web</Badge>}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {selected.length === 2 && (
        <Alert>
          <GitMerge className="h-4 w-4" />
          <AlertDescription>
            La comparaison et fusion automatique ne sont pas encore disponibles. Cette fonctionnalité sera ajoutée prochainement.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
