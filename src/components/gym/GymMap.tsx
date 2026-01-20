import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GymMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
}

interface GymMapProps {
  markers?: GymMarker[];
  onMarkerClick?: (id: string) => void;
  className?: string;
}

export const GymMap = ({ markers = [], onMarkerClick, className }: GymMapProps) => {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  const handleMarkerClick = (id: string) => {
    setSelectedMarker(id);
    onMarkerClick?.(id);
  };

  return (
    <div className={cn("relative w-full h-full bg-secondary/30 rounded-xl overflow-hidden", className)}>
      {/* Map Placeholder - Replace with actual map integration */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm">지도를 불러오는 중...</p>
            <p className="text-xs text-muted-foreground mt-1">Mapbox API 연동 필요</p>
          </div>
        </div>
        
        {/* Sample Markers */}
        {markers.map((marker, index) => (
          <button
            key={marker.id}
            onClick={() => handleMarkerClick(marker.id)}
            className={cn(
              "absolute transform -translate-x-1/2 -translate-y-full transition-all duration-200",
              selectedMarker === marker.id ? "scale-125 z-10" : "hover:scale-110"
            )}
            style={{
              left: `${30 + (index * 15) % 50}%`,
              top: `${35 + (index * 20) % 40}%`,
            }}
          >
            <div className={cn(
              "flex flex-col items-center",
              selectedMarker === marker.id && "animate-bounce-soft"
            )}>
              <div className={cn(
                "px-2 py-1 rounded-full text-xs font-semibold mb-1 shadow-md transition-colors",
                selectedMarker === marker.id 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-primary text-primary-foreground"
              )}>
                ⭐ {marker.rating.toFixed(1)}
              </div>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shadow-lg",
                selectedMarker === marker.id 
                  ? "bg-accent" 
                  : "bg-primary"
              )}>
                <MapPin className="w-5 h-5 text-white" />
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Current Location Button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute bottom-4 right-4 rounded-full shadow-lg bg-card hover:bg-card"
      >
        <Navigation className="w-5 h-5 text-primary" />
      </Button>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button variant="secondary" size="icon" className="rounded-full shadow-md bg-card hover:bg-card">
          <span className="text-lg font-bold">+</span>
        </Button>
        <Button variant="secondary" size="icon" className="rounded-full shadow-md bg-card hover:bg-card">
          <span className="text-lg font-bold">−</span>
        </Button>
      </div>
    </div>
  );
};
