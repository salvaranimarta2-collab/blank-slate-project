import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { Project, EntityKind } from "@/lib/fieldmap-data";
import { orgById, orgKind } from "@/lib/fieldmap-data";

const PIN_COLORS: Record<EntityKind, string> = {
  RLO: "hsl(152 65% 36%)",
  NGO: "hsl(212 85% 48%)",
};

type PinIconOptions = {
  partner?: boolean;
  selected?: boolean;
};

const pinIconCache = new Map<string, L.DivIcon>();

function getPinIcon(kind: EntityKind, options: PinIconOptions = {}) {
  const { partner = false, selected = false } = options;
  const key = `${kind}-${partner ? "partner" : "main"}-${selected ? "selected" : "idle"}`;
  const cached = pinIconCache.get(key);
  if (cached) return cached;

  const color = PIN_COLORS[kind];
  const showPartnerRing = partner && kind !== "NGO";
  const icon = L.divIcon({
    className: `fieldmap-pin fieldmap-pin-${kind}${partner ? " is-partner" : ""}${selected ? " is-selected" : ""}`,
    html: `
      <span style="position:relative;display:block;height:30px;width:30px;">
        ${selected ? '<span style="position:absolute;inset:1px;border-radius:9999px;border:2px solid rgba(15,23,42,0.88);box-shadow:0 0 0 1px rgba(255,255,255,0.96);"></span>' : ""}
        ${showPartnerRing ? `<span style="position:absolute;inset:5px;border-radius:9999px;border:2px solid ${color};"></span>` : ""}
        <span style="position:absolute;top:8px;left:8px;height:14px;width:14px;border-radius:9999px;background:${color};box-shadow:0 0 0 2px #fff,0 1px 3px rgba(0,0,0,0.3);"></span>
      </span>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  pinIconCache.set(key, icon);
  return icon;
}

function clusterIcon(cluster: { getAllChildMarkers: () => L.Marker[] }) {
  const markers = cluster.getAllChildMarkers();
  let rlo = 0;
  let ngo = 0;
  for (const m of markers) {
    const cn =
      (m.options.icon as L.DivIcon | undefined)?.options?.className ?? "";
    if (cn.includes("pin-NGO")) ngo++;
    else rlo++;
  }
  const count = markers.length;
  const green = PIN_COLORS.RLO;
  const blue = PIN_COLORS.NGO;
  let bg: string;
  if (rlo > 0 && ngo > 0) {
    bg = `conic-gradient(${green} 0 50%, ${blue} 50% 100%)`;
  } else if (ngo > 0) {
    bg = blue;
  } else {
    bg = green;
  }
  return L.divIcon({
    html: `<div style="position:relative;height:36px;width:36px;border-radius:9999px;background:${bg};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;"><span style="background:#fff;border-radius:9999px;height:22px;width:22px;display:flex;align-items:center;justify-content:center;font:600 11px system-ui;color:#111;">${count}</span></div>`,
    className: "fieldmap-cluster",
    iconSize: [36, 36],
  });
}

function MapPanes() {
  const map = useMap();
  useEffect(() => {
    if (!map.getPane("labels")) {
      const pane = map.createPane("labels");
      pane.style.zIndex = "650";
      pane.style.pointerEvents = "none";
    }
  }, [map]);
  return null;
}

function FlyTo({
  focused,
}: {
  focused: { project: Project; perspectiveOrgId?: string | null } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (focused) {
      const p = focused.project;
      let lat = p.lat;
      let lng = p.lng;
      if (
        focused.perspectiveOrgId &&
        focused.perspectiveOrgId !== p.orgId &&
        (p.partnerOrgIds ?? []).includes(focused.perspectiveOrgId)
      ) {
        const idx = (p.partnerOrgIds ?? []).indexOf(focused.perspectiveOrgId);
        const [dlat, dlng] = offsetFor(p.id + focused.perspectiveOrgId, idx);
        lat += dlat;
        lng += dlng;
      }
      map.flyTo([lat, lng], Math.max(map.getZoom(), 7), { duration: 0.8 });
    }
  }, [focused, map]);
  return null;
}

// Small deterministic offset so overlapping partner pins are both visible
// at high zoom (they still cluster when zoomed out).
function offsetFor(seed: string, index: number): [number, number] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) >>> 0;
  const angle = ((h % 360) + index * 137) * (Math.PI / 180);
  const r = 0.012; // ~1.3km
  return [Math.sin(angle) * r, Math.cos(angle) * r];
}

export function FieldMapInner({
  projects,
  onSelect,
  focused,
}: {
  projects: Project[];
  onSelect: (p: Project, perspectiveOrgId?: string) => void;
  focused: { project: Project; perspectiveOrgId?: string | null } | null;
}) {
  const center = useMemo<[number, number]>(() => [10, 25], []);

  return (
    <MapContainer
      center={center}
      zoom={3}
      minZoom={2}
      worldCopyJump
      className="h-full w-full"
      style={{ background: "hsl(205 60% 88%)" }}
      scrollWheelZoom
    >
      <MapPanes />
      <TileLayer
        attribution='&copy; OpenStreetMap &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
      />
      <TileLayer
        pane="labels"
        url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
      />
      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={clusterIcon}
        showCoverageOnHover={false}
        maxClusterRadius={50}
      >
        {projects.flatMap((p) => {
          const org = orgById(p.orgId);
          const kind = orgKind(org);
          const mainSelected =
            focused?.project.id === p.id && !focused.perspectiveOrgId;
          const partnerOrgs = (p.partnerOrgIds ?? [])
            .map((id) => orgById(id))
            .filter((o): o is NonNullable<typeof o> => !!o);
          const partnerLabel = partnerOrgs.length
            ? ` · collaborating with ${partnerOrgs.map((o) => o.name).join(", ")}`
            : "";

          const main = (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              keyboard={false}
              icon={getPinIcon(kind, { selected: mainSelected })}
              zIndexOffset={mainSelected ? 1000 : 0}
              eventHandlers={{ click: () => onSelect(p) }}
            >
              <Popup>
                <div style={{ fontSize: 12 }}>
                  <strong>{p.title}</strong>
                  <div style={{ color: "#666", fontSize: 11 }}>
                    {org?.name} · {kind}
                    {partnerLabel}
                  </div>
                </div>
              </Popup>
            </Marker>
          );

          const partnerPins = partnerOrgs.map((po, i) => {
            const pKind = orgKind(po);
            const [dlat, dlng] = offsetFor(p.id + po.id, i);
            const partnerSelected =
              focused?.project.id === p.id && focused.perspectiveOrgId === po.id;
            return (
              <Marker
                key={`${p.id}-partner-${po.id}`}
                position={[p.lat + dlat, p.lng + dlng]}
                keyboard={false}
                icon={getPinIcon(pKind, {
                  partner: true,
                  selected: partnerSelected,
                })}
                zIndexOffset={partnerSelected ? 1000 : 0}
                eventHandlers={{ click: () => onSelect(p, po.id) }}
              >
                <Popup>
                  <div style={{ fontSize: 12 }}>
                    <strong>{po.name}</strong>
                    <div style={{ color: "#666", fontSize: 11 }}>
                      {pKind} · collaborating with {org?.name} on "{p.title}"
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          });

          return [main, ...partnerPins];
        })}
      </MarkerClusterGroup>
      {projects.flatMap((p) => {
        const partnerOrgs = (p.partnerOrgIds ?? [])
          .map((id) => orgById(id))
          .filter((o): o is NonNullable<typeof o> => !!o);
        return partnerOrgs.map((po, i) => {
          const [dlat, dlng] = offsetFor(p.id + po.id, i);
          return (
            <Polyline
              key={`link-${p.id}-${po.id}`}
              positions={[
                [p.lat, p.lng],
                [p.lat + dlat, p.lng + dlng],
              ]}
              pathOptions={{
                color: "hsl(212 85% 48%)",
                weight: 2,
                opacity: 0.7,
                dashArray: "4 4",
              }}
            />
          );
        });
      })}
      <FlyTo focused={focused} />
    </MapContainer>
  );
}
