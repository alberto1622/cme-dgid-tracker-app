"use client";

import "leaflet/dist/leaflet.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Circle,
  MapContainer,
  Polygon,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Layers, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, buildQuery } from "@/lib/api";

const DAKAR_CENTER: [number, number] = [14.6937, -17.4441];

const TYPE_COLORS: Record<string, string> = {
  SCI: "#22c55e",
  Promoteur: "#eab308",
  Agence: "#f97316",
  Constructeur: "#3b82f6",
  Lotisseur: "#a855f7",
  Autre: "#6b7280",
  "Non rattaché": "#9ca3af",
};

type ParcelleData = {
  id: number;
  nicad: string | null;
  centroidLat: string | null;
  centroidLng: string | null;
  commune: string | null;
  quartier: string | null;
  surface: string | null;
  proprietaire: string | null;
  matchScore: number | null;
  geometry: unknown;
  entityId: number | null;
  entityType: string | null;
  entityDenomination: string | null;
  entityNinea: string | null;
};

function parseGeometry(geometry: unknown): [number, number][] | null {
  if (!geometry) return null;
  try {
    const geom = typeof geometry === "string" ? JSON.parse(geometry) : (geometry as { type?: string; coordinates?: unknown });
    const raw = (geom as { coordinates?: unknown }).coordinates;
    if (!Array.isArray(raw)) return null;

    let coordsArray: unknown[] = raw as unknown[];
    if ((geom as { type?: string }).type === "Polygon" && Array.isArray(coordsArray[0]) && Array.isArray((coordsArray[0] as unknown[])[0])) {
      coordsArray = coordsArray[0] as unknown[];
    }

    const coords = (coordsArray as Array<[number, number]>).map((c) => [Number(c[1]), Number(c[0])] as [number, number])
      .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180);

    return coords.length >= 3 ? coords : null;
  } catch {
    return null;
  }
}

function ParcellesLoader({ onLoad }: { onLoad: (data: ParcelleData[]) => void }) {
  const map = useMap();

  const fetchInBounds = useCallback(async () => {
    const b = map.getBounds();
    const url =
      "/api/map/parcelles" +
      buildQuery({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
        limit: 3000,
      });
    try {
      const data = await api.get<ParcelleData[]>(url);
      onLoad(data);
    } catch {
      onLoad([]);
    }
  }, [map, onLoad]);

  useEffect(() => {
    fetchInBounds();
  }, [fetchInBounds]);

  useMapEvents({
    moveend: fetchInBounds,
    zoomend: fetchInBounds,
  });

  return null;
}

function ParcelleShape({ parcelle }: { parcelle: ParcelleData }) {
  const type = parcelle.entityType || "Non rattaché";
  const color = TYPE_COLORS[type] || TYPE_COLORS.Autre;
  const coords = useMemo(() => parseGeometry(parcelle.geometry), [parcelle.geometry]);

  const popup = (
    <Popup>
      <div className="min-w-[220px]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <Badge variant="outline">{type}</Badge>
          {parcelle.matchScore != null && (
            <Badge variant={parcelle.matchScore >= 90 ? "default" : "secondary"}>
              {parcelle.matchScore}%
            </Badge>
          )}
        </div>
        <h3 className="font-semibold text-base mb-2">
          {parcelle.entityDenomination || parcelle.proprietaire || "Propriétaire inconnu"}
        </h3>
        {parcelle.nicad && (
          <p className="text-xs">
            <span className="font-medium">NICAD :</span> <span className="font-mono">{parcelle.nicad}</span>
          </p>
        )}
        {parcelle.entityNinea && (
          <p className="text-xs">
            <span className="font-medium">NINEA :</span> <span className="font-mono">{parcelle.entityNinea}</span>
          </p>
        )}
        {parcelle.commune && (
          <p className="text-xs">
            <span className="font-medium">Commune :</span> {parcelle.commune}
          </p>
        )}
        {parcelle.surface && (
          <p className="text-xs">
            <span className="font-medium">Surface :</span> {parseFloat(parcelle.surface).toLocaleString()} m²
          </p>
        )}
        {parcelle.entityId && (
          <Link href={`/entites/${parcelle.entityId}`}>
            <Button size="sm" className="w-full mt-2">
              Voir l'entité
            </Button>
          </Link>
        )}
      </div>
    </Popup>
  );

  if (coords && coords.length >= 3) {
    return (
      <Polygon positions={coords} pathOptions={{ color, fillColor: color, fillOpacity: 0.4, weight: 1.5 }}>
        {popup}
      </Polygon>
    );
  }

  const lat = parseFloat(parcelle.centroidLat || "0");
  const lng = parseFloat(parcelle.centroidLng || "0");
  if (lat && lng) {
    return (
      <Circle center={[lat, lng]} radius={8} pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 1 }}>
        {popup}
      </Circle>
    );
  }
  return null;
}

function MapLegend({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border p-3 z-[1000] w-48">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Légende
        </h4>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-1">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded border" style={{ backgroundColor: `${color}66`, borderColor: color }} />
            <span>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CadastreMap() {
  const [parcelles, setParcelles] = useState<ParcelleData[] | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  return (
    <div className="relative h-[calc(100vh-12rem)] rounded-lg overflow-hidden border">
      {parcelles === null && (
        <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-white/60">
          <Skeleton className="h-8 w-48" />
        </div>
      )}

      <MapContainer center={DAKAR_CENTER} zoom={12} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ParcellesLoader onLoad={setParcelles} />
        {parcelles?.map((p) => (
          <ParcelleShape key={p.id} parcelle={p} />
        ))}
      </MapContainer>

      {showLegend ? (
        <MapLegend onClose={() => setShowLegend(false)} />
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 z-[1000]"
          onClick={() => setShowLegend(true)}
        >
          <Layers className="h-4 w-4 mr-2" />
          Légende
        </Button>
      )}

      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border px-3 py-2 z-[1000]">
        <p className="text-xs text-muted-foreground">Parcelles affichées</p>
        <p className="text-lg font-bold">{(parcelles?.length ?? 0).toLocaleString()}</p>
      </div>
    </div>
  );
}
