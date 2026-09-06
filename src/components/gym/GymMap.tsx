import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, AlertTriangle, Loader2, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loadKakaoMaps, isKakaoKeyConfigured } from "@/lib/kakaoMap";
import type { Coordinates } from "@/hooks/useGeolocation";

export interface GymMarker {
  id: string;
  name: string;
  category?: string;
  address?: string;
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
  // True once the user drags the map — stops the "follow my location" effect from
  // yanking their view back every time a new GPS fix comes in.
  const userMovedMapRef = useRef(false);

  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [selected, setSelected] = useState<GymMarker | null>(null);

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

        // Mark the map as manually moved on either gesture — our own setCenter() never
        // fires "dragstart", and we never call setLevel() so "zoom_changed" is always a
        // real user action (trackpad/wheel zoom recenters toward the cursor, which pans
        // the map without a drag).
        const markUserMoved = () => {
          userMovedMapRef.current = true;
        };
        maps.event.addListener(mapRef.current, "dragstart", markUserMoved);
        maps.event.addListener(mapRef.current, "zoom_changed", markUserMoved);

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

  // Follow the current location — but only pan the viewport while the user hasn't
  // moved it themselves (drag or zoom). The blue dot always tracks the real position either way.
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const position = new window.kakao.maps.LatLng(center.lat, center.lng);
    if (!userMovedMapRef.current) {
      mapRef.current.setCenter(position);
    }
    meMarkerRef.current?.setPosition(position);
  }, [isReady, center.lat, center.lng]);

  // Redraw gym markers whenever the list changes.
  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    const maps = window.kakao.maps;
    const map = mapRef.current;

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];
    setSelected(null);

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
      element.addEventListener("click", () => setSelected(marker));

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

  const handleRecenter = () => {
    userMovedMapRef.current = false;
    if (mapRef.current) {
      mapRef.current.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
    }
    onRecenter?.();
  };

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
            onClick={handleRecenter}
            aria-label="현재 위치로 이동"
            className={cn(
              "absolute left-4 z-10 rounded-full shadow-lg bg-card hover:bg-card transition-all",
              selected ? "bottom-28" : "bottom-4"
            )}
          >
            <Navigation className="w-5 h-5 text-primary" />
          </Button>

          {selected && (
            <div className="absolute bottom-3 left-3 right-3 z-10 rounded-xl bg-card shadow-lg p-4 animate-slide-up">
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="닫기"
                className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="pr-6">
                {selected.category && (
                  <p className="text-xs text-muted-foreground mb-0.5">{selected.category}</p>
                )}
                <p className="font-semibold leading-tight">{selected.name}</p>
                <div className="flex items-center gap-1 mt-1 text-sm">
                  <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                  <span className="font-medium">{selected.rating.toFixed(1)}</span>
                </div>
                {selected.address && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">{selected.address}</p>
                )}
              </div>
              <Button
                size="sm"
                className="w-full mt-3"
                onClick={() => onMarkerClick?.(selected.id)}
              >
                상세보기
              </Button>
            </div>
          )}
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
