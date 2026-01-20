import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { GymCard, GymData } from "@/components/gym/GymCard";
import { GymMap } from "@/components/gym/GymMap";
import { CategoryFilter } from "@/components/gym/CategoryFilter";
import { Button } from "@/components/ui/button";
import { MapIcon, List, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { gymsApi } from "@/api/gyms";

const Index = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [gyms, setGyms] = useState<GymData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGyms = async () => {
      setIsLoading(true);
      try {
        const data = await gymsApi.getAll(0, 20);
        if (data?.content) {
          setGyms(data.content as unknown as GymData[]);
        }
      } catch (error) {
        console.error("Failed to fetch gyms:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGyms();
  }, []);

  const filteredGyms = selectedCategory === "all"
    ? gyms
    : gyms.filter(gym =>
        gym.category.toLowerCase().includes(selectedCategory) ||
        selectedCategory === "fitness" && gym.category === "헬스장"
      );

  const gymMarkers = filteredGyms.map((gym) => ({
    id: gym.id,
    name: gym.name,
    lat: 37.5 + Math.random() * 0.05,
    lng: 127.0 + Math.random() * 0.05,
    rating: gym.rating,
  }));

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

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
                <p className="text-white font-medium">내 주변 인기 체육관 TOP 5</p>
              </div>
              <Button variant="secondary" size="sm" className="bg-white/20 border-0 text-white hover:bg-white/30">
                보기
              </Button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-4 py-3">
          <CategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* View Toggle */}
        <div className="px-4 pb-3 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            내 주변 <span className="font-semibold text-foreground">{filteredGyms.length}개</span> 체육관
          </p>
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={cn(
                "h-8 px-3 rounded-md",
                viewMode === "list" && "bg-card shadow-sm"
              )}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("map")}
              className={cn(
                "h-8 px-3 rounded-md",
                viewMode === "map" && "bg-card shadow-sm"
              )}
            >
              <MapIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : viewMode === "map" ? (
          <div className="px-4">
            <GymMap
              markers={gymMarkers}
              className="h-[60vh] rounded-xl"
              onMarkerClick={(id) => navigate(`/gym/${id}`)}
            />
          </div>
        ) : filteredGyms.length > 0 ? (
          <div className="px-4 space-y-4">
            {filteredGyms.map((gym, index) => (
              <div
                key={gym.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <GymCard
                  gym={gym}
                  onClick={() => navigate(`/gym/${gym.id}`)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p>등록된 체육관이 없습니다.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
