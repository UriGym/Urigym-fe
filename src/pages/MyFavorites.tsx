import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GymCard } from "@/components/gym/GymCard";
import { gymsApi } from "@/api/gyms";
import type { GymResponse } from "@/api/types";

const MyFavorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<GymResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    setIsLoading(true);
    gymsApi
      .getMyFavorites()
      .then((data) => setFavorites(data?.content ?? []))
      .catch(() => setFavorites([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(load, [load]);

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="fixed top-16 left-0 right-0 z-40 glass border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate("/mypage")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">찜한 체육관</h1>
        </div>
      </header>

      <main className="pt-32 px-4 max-w-lg mx-auto space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="gym-card p-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">찜한 체육관이 없습니다.</p>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              체육관 둘러보기
            </Button>
          </div>
        ) : (
          favorites.map((gym) => (
            <GymCard key={gym.id} gym={gym} onClick={() => navigate(`/gym/${gym.id}`)} />
          ))
        )}
      </main>
    </div>
  );
};

export default MyFavorites;
