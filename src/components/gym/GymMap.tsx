import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loadKakaoMaps, isKakaoKeyConfigured } from "@/lib/kakaoMap";
import type { Coordinates } from "@/hooks/useGeolocation";

export interface GymMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
}

interface GymMapProps {
  markers?: GymMarker[];
  center: Coordinates;
  onMarkerClick?: (id: string) => void;
  onRecenter?: () => void;
  className?: string;
}

export const GymMap = ({ markers = [], center, onMarkerClick, onRecenter, className }: GymMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const meMarkerRef = useRef<kakao.maps.CustomOverlay | null>(null);
  // Kept in a ref so re-rendering markers doesn't need to re-create the map.
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Create the map once the SDK is available.
  useEffect(() => {
    if (!isKakaoKeyConfigured()) {
      setError("카카오맵 API 키가 설정되지 않았습니다. .env 파일의 VITE_KAKAO_MAP_KEY를 확인해주세요.");
      return;
    }

    let cancelled = false;

    loadKakaoMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current) return;
        mapRef.current = new maps.Map(containerRef.current, {
          center: new maps.LatLng(center.lat, center.lng),
          level: 5, // ~250m scale
        });

        meMarkerRef.current = new maps.CustomOverlay({
          position: new maps.LatLng(center.lat, center.lng),
          content:
            '<span class="block w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md"></span>',
          map: mapRef.current,
          zIndex: 10,
        });

        setIsReady(true);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
    // The map is created once; recentering is handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Follow the current location.
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const position = new window.kakao.maps.LatLng(center.lat, center.lng);
    mapRef.current.setCenter(position);
    meMarkerRef.current?.setPosition(position);
  }, [isReady, center.lat, center.lng]);

  // Redraw gym markers whenever the list changes.
  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    const maps = window.kakao.maps;
    const map = mapRef.current;

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];

    const positioned = markers.filter((marker) => marker.lat != null && marker.lng != null);

    positioned.forEach((marker) => {
      const element = document.createElement("button");
      element.type = "button";
      element.className =
        "flex flex-col items-center -translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg";
      element.innerHTML = `
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold shadow-md bg-primary text-primary-foreground whitespace-nowrap">
          ${escapeHtml(marker.name)} ⭐ ${marker.rating.toFixed(1)}
        </span>
        <span class="w-3 h-3 rotate-45 -mt-1 bg-primary"></span>
      `;
      element.addEventListener("click", () => onMarkerClickRef.current?.(marker.id));

      const overlay = new maps.CustomOverlay({
        position: new maps.LatLng(marker.lat, marker.lng),
        content: element,
        yAnchor: 1,
        clickable: true,
      });
      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });
    // Zoom stays fixed at the initial ~250m level (see `level: 5` above) instead of
    // auto-fitting bounds around every marker — that used to zoom out to fit gyms
    // far from the current location instead of showing what's actually nearby.
  }, [isReady, markers]);

  if (error) {
    return (
      <div
        className={cn(
          "relative w-full h-full bg-secondary/30 rounded-xl overflow-hidden flex items-center justify-center p-6",
          className
        )}
      >
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-accent" />
          </div>
          <p className="font-medium mb-1">지도를 표시할 수 없습니다</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full rounded-xl overflow-hidden", className)}>
      <div ref={containerRef} className="absolute inset-0" />

      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/30">
          <div className="text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">지도를 불러오는 중...</p>
          </div>
        </div>
      )}

      {isReady && (
        <>
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-card/90 backdrop-blur-sm px-3 py-1.5 shadow-md">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium">체육관 {markers.length}곳</span>
          </div>

          <Button
            variant="secondary"
            size="icon"
            onClick={onRecenter}
            aria-label="현재 위치로 이동"
            className="absolute bottom-4 right-4 z-10 rounded-full shadow-lg bg-card hover:bg-card"
          >
            <Navigation className="w-5 h-5 text-primary" />
          </Button>
        </>
      )}
    </div>
  );
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      default: return "&#39;";
    }
  });
}
