"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Building2, ChevronLeft, ChevronRight, Eye, Filter, Search } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const LIMIT = 20;
const ALL = "all";

type Entity = {
  id: number;
  ninea: string | null;
  type: string;
  denomination: string;
  adresse: string | null;
  presentCME: boolean | null;
  presentANSD: boolean | null;
  presentScraper: boolean | null;
};

type ListResult = { data: Entity[]; total: number };

export default function EntitiesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>(ALL);
  const [presentCME, setPresentCME] = useState<string>(ALL);
  const [presentANSD, setPresentANSD] = useState<string>(ALL);
  const [page, setPage] = useState(0);

  const [result, setResult] = useState<ListResult>({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const url =
      "/api/entities" +
      buildQuery({
        search: search || undefined,
        type: type === ALL ? undefined : type,
        presentCME: presentCME === ALL ? undefined : presentCME,
        presentANSD: presentANSD === ALL ? undefined : presentANSD,
        limit: LIMIT,
        offset: page * LIMIT,
      });

    api
      .get<ListResult>(url)
      .then((r) => {
        if (!cancelled) setResult(r);
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ data: [], total: 0 });
          toast.error("Erreur de chargement des entités");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, type, presentCME, presentANSD, page]);

  const totalPages = Math.max(1, Math.ceil(result.total / LIMIT));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setType(ALL);
    setPresentCME(ALL);
    setPresentANSD(ALL);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Entités</h1>
        <p className="text-muted-foreground">{result.total.toLocaleString()} entités trouvées</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtres et Recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="NINEA, dénomination, adresse..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={type} onValueChange={(v) => { setPage(0); setType(v); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Type d'entité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Tous les types</SelectItem>
                  <SelectItem value="SCI">SCI</SelectItem>
                  <SelectItem value="Promoteur">Promoteur</SelectItem>
                  <SelectItem value="Agence">Agence</SelectItem>
                  <SelectItem value="Constructeur">Constructeur</SelectItem>
                  <SelectItem value="Lotisseur">Lotisseur</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              <Select value={presentCME} onValueChange={(v) => { setPage(0); setPresentCME(v); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Présent CME" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>CME — Tous</SelectItem>
                  <SelectItem value="true">Dans CME</SelectItem>
                  <SelectItem value="false">Hors CME</SelectItem>
                </SelectContent>
              </Select>
              <Select value={presentANSD} onValueChange={(v) => { setPage(0); setPresentANSD(v); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Présent ANSD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>ANSD — Tous</SelectItem>
                  <SelectItem value="true">Dans ANSD</SelectItem>
                  <SelectItem value="false">Hors ANSD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Rechercher</Button>
              <Button type="button" variant="outline" onClick={resetFilters}>
                Réinitialiser
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : result.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b">
                  <tr>
                    <th className="py-2 px-3">NINEA</th>
                    <th className="py-2 px-3">Dénomination</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Adresse</th>
                    <th className="py-2 px-3">Sources</th>
                    <th className="py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((entity) => (
                    <tr key={entity.id} className="border-b hover:bg-muted/40">
                      <td className="py-2 px-3 font-mono text-xs">{entity.ninea || "-"}</td>
                      <td className="py-2 px-3 font-medium max-w-xs truncate">{entity.denomination}</td>
                      <td className="py-2 px-3">
                        <Badge className={TYPE_BADGES[entity.type] || TYPE_BADGES.Autre}>
                          {entity.type}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 max-w-xs truncate text-muted-foreground">
                        {entity.adresse || "-"}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex gap-1">
                          {entity.presentCME && <Badge variant="outline" className="text-xs">CME</Badge>}
                          {entity.presentANSD && <Badge variant="outline" className="text-xs">ANSD</Badge>}
                          {entity.presentScraper && <Badge variant="outline" className="text-xs">Web</Badge>}
                        </div>
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
          ) : (
            <div className="p-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune entité trouvée</p>
              <p className="text-sm text-muted-foreground mt-1">
                Modifiez vos critères ou importez des données
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page + 1} sur {totalPages}</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
