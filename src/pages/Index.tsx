import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { GymCard } from "@/components/gym/GymCard";
import { GymMap } from "@/components/gym/GymMap";
import { CategoryFilter } from "@/components/gym/CategoryFilter";
import { Button } from "@/components/ui/button";
import { MapIcon, List, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { gymsApi } from "@/api/gyms";
import { distanceKm, formatDistance, useGeolocation } from "@/hooks/useGeolocation";
import type { GymResponse } from "@/api/types";

const Index = () => {
  const navigate = useNavigate();
  const { center, error: locationError, refresh } = useGeolocation();

  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [gyms, setGyms] = useState<GymResponse[]>([]);
  const [rankedGyms, setRankedGyms] = useState<GymResponse[]>([]);
  const [showRankedOnly, setShowRankedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGyms = async () => {
      setIsLoading(true);
      try {
        const [page, ranked] = await Promise.all([
          gymsApi.getAll(0, 50),
          gymsApi.getRanked(5),
        ]);
        setGyms(page?.content ?? []);
        setRankedGyms(ranked ?? []);
      } catch (error) {
        console.error("Failed to fetch gyms:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGyms();
  }, []);

  // Nearest first, with the distance from the current location attached.
  const gymsWithDistance = useMemo(() => {
    const source = showRankedOnly ? rankedGyms : gyms;
    return source
      .map((gym) => ({
        gym,
        distance:
          gym.lat != null && gym.lng != null
            ? distanceKm(center, { lat: gym.lat, lng: gym.lng })
            : null,
      }))
      .sort((a, b) => {
        if (showRankedOnly) return 0; // preserve ranking order
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });
  }, [gyms, rankedGyms, showRankedOnly, center]);

  const filteredGyms = useMemo(
    () =>
      selectedCategory === "all"
        ? gymsWithDistance
        : gymsWithDistance.filter(({ gym }) => gym.category === selectedCategory),
    [gymsWithDistance, selectedCategory]
  );

  const markers = filteredGyms
    .filter(({ gym }) => gym.lat != null && gym.lng != null)
    .map(({ gym }) => ({
      id: gym.id,
      name: gym.name,
      lat: gym.lat as number,
      lng: gym.lng as number,
      rating: gym.rating,
    }));

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header locationLabel={locationError ? undefined : "현재 위치"} />

      <main className="pt-16">
        {/* AI Recommendation Banner */}
        <div className="px-4 py-3">
          <div className="gradient-primary rounded-xl p-4 shadow-gym">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white/80 text-xs">AI 추천</p>
                <p className="text-white font-medium">
                  리뷰·가격·신고 분석 TOP {rankedGyms.length || 5}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowRankedOnly((value) => !value)}
                className="bg-white/20 border-0 text-white hover:bg-white/30"
              >
                {showRankedOnly ? "전체보기" : "보기"}
              </Button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-4 py-3">
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* View Toggle */}
        <div className="px-4 pb-3 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {showRankedOnly ? "AI 추천" : "내 주변"}{" "}
            <span className="font-semibold text-foreground">{filteredGyms.length}개</span> 체육관
          </p>
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              aria-label="목록 보기"
              className={cn("h-8 px-3 rounded-md", viewMode === "list" && "bg-card shadow-sm")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("map")}
              aria-label="지도 보기"
              className={cn("h-8 px-3 rounded-md", viewMode === "map" && "bg-card shadow-sm")}
            >
              <MapIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {locationError && (
          <p className="px-4 pb-2 text-xs text-muted-foreground">{locationError}</p>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : viewMode === "map" ? (
          <div className="px-4">
            <GymMap
              markers={markers}
              center={center}
              onRecenter={refresh}
              className="h-[60vh]"
              onMarkerClick={(id) => navigate(`/gym/${id}`)}
            />
          </div>
        ) : filteredGyms.length > 0 ? (
          <div className="px-4 space-y-4">
            {filteredGyms.map(({ gym, distance }, index) => (
              <div
                key={gym.id}
                className="animate-slide-up"
                style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
              >
                <GymCard
                  gym={{
                    ...gym,
                    distance: distance != null ? formatDistance(distance) : undefined,
                  }}
                  onClick={() => navigate(`/gym/${gym.id}`)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p>조건에 맞는 체육관이 없습니다.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
