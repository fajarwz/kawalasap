import * as L from 'leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { aqiCategory, TONE_COLOUR } from '../lib/aqi.ts';
import type { CityReading } from '../lib/cities.ts';
import {
  cellMergeFactor,
  cellRadius,
  CONFIDENCE_LABEL_KEY,
  frpColour,
  mergeCells,
  pointRadius,
  type Hotspot,
  type HotspotCell,
  type SourceMeta,
} from '../lib/fires.ts';
import { formatDateTimeWib, formatInt, formatOne } from '../lib/format.ts';
import { useLang, useT } from '../lib/i18n.ts';
import { REGIONS, regionLabel, regionOf } from '../lib/regions.ts';
import { Basemap, LayerMode, WindLevel, type PinPoint } from '../lib/viewState.ts';
import { headingTo, type WindPoint } from '../lib/wind.ts';

const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * One keyless tile source. The dark basemap is the same OpenStreetMap tiles with
 * a CSS filter on the tile layer, not a paid basemap product, so nothing here
 * needs an account or an API key. Only the tiles are filtered, so the fire dots
 * and city markers keep their real colours.
 */
const TILES: Record<Basemap, { url: string; attribution: string; filter: string }> = {
  dark: {
    url: OSM_URL,
    attribution: OSM_ATTRIBUTION,
    filter: 'invert(1) hue-rotate(180deg) brightness(0.9) contrast(1.05) saturate(0.8)',
  },
  light: {
    url: OSM_URL,
    attribution: OSM_ATTRIBUTION,
    filter: '',
  },
};

const HOME: L.LatLngExpression = [-2.2, 118.5];
const HOME_ZOOM = 5;

export interface MapViewProps {
  hotspots: Hotspot[];
  cells: HotspotCell[];
  cities: CityReading[];
  wind: WindPoint[];
  sources: SourceMeta[];
  layer: LayerMode;
  showWind: boolean;
  windLevel: WindLevel;
  basemap: Basemap;
  selectedRegion: string;
  /** The place the reader pinned, drawn as a ring with its name. */
  pin: PinPoint | null;
  /** A click on the map: the panel reads the model at that point. */
  onPickPoint: (point: PinPoint) => void;
  /** A click on a city marker opens that city's summary in the air panel. */
  onSelectCity?: (cityId: string) => void;
}

/**
 * A wind arrow. It carries no native `title`: the arrow only claims a direction,
 * the legend says that in visible text, and its speed is read where it is actually
 * reported, beside the map.
 */
function windIcon(fromDegrees: number) {
  return L.divIcon({
    className: '',
    html: `<div style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;transform:rotate(${headingTo(
      fromDegrees,
    )}deg)"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 L16.5 12.8 L12 10.4 L7.5 12.8 Z" fill="#38bdf8" opacity="0.95"/></svg></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

export function MapView(props: MapViewProps) {
  const { onPickPoint, onSelectCity } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const canvasRef = useRef<L.Canvas | null>(null);
  const regionRef = useRef<L.LayerGroup | null>(null);
  const cellRef = useRef<L.LayerGroup | null>(null);
  const pointRef = useRef<L.LayerGroup | null>(null);
  const cityRef = useRef<L.LayerGroup | null>(null);
  const windRef = useRef<L.LayerGroup | null>(null);
  const pinRef = useRef<L.LayerGroup | null>(null);
  const [zoom, setZoom] = useState<number>(HOME_ZOOM);
  const t = useT();
  const lang = useLang();

  // Coarser boxes as the map zooms out: 0.5° at country level, 1° for the whole
  // archipelago, then back to the server's 0.1° grid once you are zoomed in.
  const mergeFactor = cellMergeFactor(zoom);
  const plottedCells = useMemo(
    () => mergeCells(props.cells, mergeFactor),
    [props.cells, mergeFactor],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;
    const canvas = L.canvas({ padding: 0.35 });
    const map = L.map(container, {
      preferCanvas: true,
      minZoom: 4,
      maxZoom: 11,
      worldCopyJump: false,
    });
    map.setView(HOME, HOME_ZOOM);
    canvasRef.current = canvas;
    regionRef.current = L.layerGroup().addTo(map);
    cellRef.current = L.layerGroup().addTo(map);
    pointRef.current = L.layerGroup().addTo(map);
    cityRef.current = L.layerGroup().addTo(map);
    windRef.current = L.layerGroup().addTo(map);
    pinRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      canvasRef.current = null;
      regionRef.current = null;
      cellRef.current = null;
      pointRef.current = null;
      cityRef.current = null;
      windRef.current = null;
      pinRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const tiles = TILES[props.basemap];
    const layer = L.tileLayer(tiles.url, {
      attribution: tiles.attribution,
      subdomains: 'abc',
      maxZoom: 19,
    });
    layer.addTo(map);
    const container = layer.getContainer();
    if (container) container.style.filter = tiles.filter;
    return () => {
      layer.remove();
    };
  }, [props.basemap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const region = REGIONS.find((item) => item.id === props.selectedRegion);
    if (region) {
      const [minLat, maxLat, minLon, maxLon] = region.bbox;
      map.flyToBounds(
        [
          [minLat, minLon],
          [maxLat, maxLon],
        ],
        { padding: [26, 26], duration: 0.7, maxZoom: 8 },
      );
    } else {
      map.flyTo(HOME, HOME_ZOOM, { duration: 0.7 });
    }
  }, [props.selectedRegion]);

  useEffect(() => {
    const group = regionRef.current;
    if (!group) return;
    group.clearLayers();
    for (const region of REGIONS) {
      const [minLat, maxLat, minLon, maxLon] = region.bbox;
      const selected = region.id === props.selectedRegion;
      L.rectangle(
        [
          [minLat, minLon],
          [maxLat, maxLon],
        ],
        {
          interactive: false,
          color: selected ? '#f97316' : 'rgba(148, 163, 184, 0.4)',
          weight: selected ? 1.6 : 1,
          dashArray: selected ? undefined : '5 5',
          fill: selected,
          fillColor: '#f97316',
          fillOpacity: selected ? 0.06 : 0,
        },
      ).addTo(group);
      if (selected) {
        L.marker(region.centre, {
          interactive: false,
          keyboard: false,
          icon: L.divIcon({
            className: '',
            html: `<div style="font:600 11px/1 'Geist Variable',system-ui,sans-serif;color:#fdba74;text-shadow:0 1px 4px #000;white-space:nowrap;transform:translate(-50%,-50%)">${region.name}</div>`,
            iconSize: [0, 0],
          }),
        }).addTo(group);
      }
    }
  }, [props.selectedRegion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onZoomEnd = () => setZoom(map.getZoom());
    map.on('zoomend', onZoomEnd);
    return () => {
      map.off('zoomend', onZoomEnd);
    };
  }, []);

  useEffect(() => {
    const group = cellRef.current;
    if (!group) return;
    group.clearLayers();
    if (props.layer !== LayerMode.Density) return;
    for (const cell of plottedCells) {
      const neighbour = cell.region === 'neighbour';
      L.circleMarker([cell.lat, cell.lon], {
        renderer: canvasRef.current ?? undefined,
        radius: cellRadius(cell.count, mergeFactor),
        weight: 0,
        fillColor: neighbour ? '#94a3b8' : frpColour(cell.maxFrp),
        fillOpacity: neighbour ? 0.32 : 0.62,
        bubblingMouseEvents: false,
      })
        .bindPopup(
          `<b>${t('map.cell', { count: formatInt(cell.count, lang) })}</b><br>` +
            `${t('map.cellBox', {
              size: (mergeFactor * 0.1).toFixed(1),
              lat: cell.lat.toFixed(1),
              lon: cell.lon.toFixed(1),
            })}<br>` +
            `${t('map.cellFrp', { frp: formatOne(cell.maxFrp, 1, lang) })}<br>` +
            `${regionLabel(cell.region)}`,
        )
        .addTo(group);
    }
  }, [plottedCells, mergeFactor, props.layer, t, lang]);

  useEffect(() => {
    const group = pointRef.current;
    if (!group) return;
    group.clearLayers();
    if (props.layer !== LayerMode.Detections) return;
    for (const spot of props.hotspots) {
      const source = props.sources[spot.sourceIndex];
      L.circleMarker([spot.lat, spot.lon], {
        renderer: canvasRef.current ?? undefined,
        radius: pointRadius(spot.frp, zoom),
        weight: 0,
        fillColor: spot.region === 'neighbour' ? '#94a3b8' : frpColour(spot.frp),
        fillOpacity: spot.confidence === 'low' ? 0.5 : 0.92,
        bubblingMouseEvents: false,
      })
        .bindPopup(
          `<b>${t('map.pointFrp', { frp: formatOne(spot.frp, 1, lang) })}</b><br>` +
            `${t('map.pointPass', {
              confidence: t(CONFIDENCE_LABEL_KEY[spot.confidence]),
              time: t(spot.night ? 'common.night' : 'common.day'),
            })}<br>` +
            `${source ? source.label : t('common.sourceUnknown')}<br>` +
            `${formatDateTimeWib(spot.acquiredAt, lang)}<br>` +
            `${regionLabel(spot.region)}`,
        )
        .addTo(group);
    }
  }, [props.hotspots, props.layer, props.sources, zoom, t, lang]);

  useEffect(() => {
    const group = cityRef.current;
    if (!group) return;
    group.clearLayers();
    for (const reading of props.cities) {
      const category = aqiCategory(reading.usAqi, t);
      const colour = category ? TONE_COLOUR[category.tone] : '#64748b';
      const radius = reading.usAqi === null ? 3.5 : 4 + Math.min(6, reading.usAqi / 40);
      const marker = L.circleMarker([reading.city.lat, reading.city.lon], {
        renderer: canvasRef.current ?? undefined,
        radius,
        weight: 1.2,
        color: '#0b0f14',
        fillColor: colour,
        fillOpacity: 0.95,
        // A click on a city marker opens its popup and selects the city; it does
        // not also drop a pin on the same spot.
        bubblingMouseEvents: false,
      })
        .bindPopup(
          `<b>${reading.city.name}</b><br>` +
            `${t('map.cityPm', {
              pm25:
                reading.pm25 === null
                  ? t('common.noValue')
                  : `${formatOne(reading.pm25, 0, lang)} µg/m³`,
              aqi: reading.usAqi === null ? t('common.na') : formatInt(reading.usAqi, lang),
            })}<br>` +
            `${category ? category.label : t('common.noCategory')}<br>` +
            `${t('map.cityModel', {
              time: reading.time ? formatDateTimeWib(reading.time, lang) : t('common.unknownTime'),
            })}`,
        )
        .addTo(group);
      marker.on('click', () => onSelectCity?.(reading.city.id));
      if ((reading.usAqi ?? 0) >= 101) {
        marker.bindTooltip(
          `${reading.city.name} ${Math.round(reading.usAqi ?? 0)}`,
          { permanent: true, direction: 'right', offset: [6, 0], opacity: 0.95 },
        );
      }
    }
  }, [props.cities, onSelectCity, t, lang]);

  useEffect(() => {
    const group = windRef.current;
    if (!group) return;
    group.clearLayers();
    if (!props.showWind) return;
    for (const point of props.wind) {
      const speed = props.windLevel === WindLevel.Ten ? point.speed10 : point.speed850;
      const direction = props.windLevel === WindLevel.Ten ? point.dir10 : point.dir850;
      if (speed === null || direction === null) continue;
      L.marker([point.lat, point.lon], {
        icon: windIcon(direction),
        interactive: false,
        keyboard: false,
      }).addTo(group);
    }
  }, [props.wind, props.showWind, props.windLevel]);

  // The pinned place: one ring on top of everything, with its name beside it.
  useEffect(() => {
    const map = mapRef.current;
    const group = pinRef.current;
    if (!map || !group) return;
    group.clearLayers();
    const point = props.pin;
    if (!point) return;
    L.circleMarker([point.lat, point.lon], {
      renderer: canvasRef.current ?? undefined,
      radius: 9,
      weight: 2,
      color: '#f8fafc',
      fillColor: '#f97316',
      fillOpacity: 1,
    })
      .bindTooltip(point.name, {
        permanent: true,
        direction: 'right',
        offset: [10, 0],
        opacity: 0.95,
      })
      .addTo(group);
    map.flyTo([point.lat, point.lon], Math.max(map.getZoom(), 8), { duration: 0.6 });
  }, [props.pin]);

  /**
   * A click on the map reads the model at that point. Detections and city
   * markers stop the event, so clicking one opens its popup instead of also
   * dropping a pin.
   */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onPick = (event: L.LeafletMouseEvent) => {
      const lat = Number(event.latlng.lat.toFixed(4));
      const lon = Number(event.latlng.lng.toFixed(4));
      onPickPoint({
        lat,
        lon,
        name: `${formatOne(lat, 2, lang)} / ${formatOne(lon, 2, lang)}`,
        area: regionLabel(regionOf(lat, lon)),
      });
    };
    map.on('click', onPick);
    return () => {
      map.off('click', onPick);
    };
  }, [onPickPoint, lang]);

  return <div className="h-full w-full" ref={containerRef} />;
}