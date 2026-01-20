import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GymCard, GymData } from "@/components/gym/GymCard";
import { gymsApi } from "@/api/gyms";

const popularSearches = ["24시간 헬스장", "요가", "크로스핏", "PT 추천", "여성전용"];
const recentSearches = ["강남 헬스장", "필라테스"];

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<GymData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const searchGyms = async () => {
      setIsLoading(true);
      try {
        const data = await gymsApi.search(query, 0, 20);
        if (data?.content) {
          setSearchResults(data.content as unknown as GymData[]);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchGyms, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="검색" showLocation={false} />

      <main className="pt-20 px-4 space-y-6">
        {/* Search Input */}
        <div className="flex gap-2 animate-fade-in">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="체육관, 운동 종목 검색"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(e.target.value.length > 0);
              }}
              className="pl-10 gym-input h-12"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setShowResults(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button variant="outline" size="icon" className="h-12 w-12">
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {!showResults ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="animate-slide-up">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">최근 검색</h3>
                  <button className="text-sm text-muted-foreground">전체삭제</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <Badge
                      key={search}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 transition-colors"
                      onClick={() => handleSearch(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h3 className="font-semibold mb-3">인기 검색어</h3>
              <div className="space-y-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={search}
                    onClick={() => handleSearch(search)}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <span className="w-6 h-6 rounded-full gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span>{search}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recommended Categories */}
            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <h3 className="font-semibold mb-3">추천 카테고리</h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { emoji: "💪", label: "헬스" },
                  { emoji: "🧘", label: "요가" },
                  { emoji: "🤸", label: "필라테스" },
                  { emoji: "🥊", label: "복싱" },
                  { emoji: "🏊", label: "수영" },
                  { emoji: "🔥", label: "크로스핏" },
                  { emoji: "🥋", label: "무술" },
                  { emoji: "🏃", label: "러닝" },
                ].map((category) => (
                  <button
                    key={category.label}
                    onClick={() => handleSearch(category.label)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <span className="text-2xl">{category.emoji}</span>
                    <span className="text-xs font-medium">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Search Results */
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              "{query}" 검색 결과 <span className="font-semibold text-foreground">{searchResults.length}개</span>
            </p>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((gym, index) => (
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
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">검색 결과가 없습니다</p>
                <Button variant="outline" onClick={() => setShowResults(false)}>
                  다른 검색어로 찾기
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Search;
