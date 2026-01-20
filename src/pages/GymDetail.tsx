import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Clock, Phone, Share2, Heart, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { gymsApi } from "@/api/gyms";
import type { GymResponse } from "@/api/types";

const GymDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gym, setGym] = useState<GymResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGym = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await gymsApi.getById(id);
        if (data) {
          setGym(data);
        }
      } catch (error) {
        console.error("Failed to fetch gym:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGym();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">체육관을 찾을 수 없습니다.</p>
        <Button onClick={() => navigate(-1)}>돌아가기</Button>
      </div>
    );
  }

  const imageUrl = gym.imageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop';
  const priceDisplay = gym.priceMin ? `월 ${gym.priceMin.toLocaleString()}원` : '가격문의';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative h-64">
        <img
          src={imageUrl}
          alt={gym.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Top Actions */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-background/80 backdrop-blur-sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" size="icon" className="rounded-full bg-background/80 backdrop-blur-sm">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full bg-background/80 backdrop-blur-sm">
              <Heart className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="gym-card p-5 animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{gym.category}</p>
              <h1 className="text-2xl font-bold">{gym.name}</h1>
            </div>
            <div className="flex items-center gap-1 bg-accent/10 rounded-full px-3 py-1.5">
              <Star className="w-5 h-5 fill-accent text-accent" />
              <span className="font-bold text-accent">{gym.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {gym.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{gym.address}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="w-4 h-4 shrink-0" />
              <span className={gym.isOpen ? "text-green-500 font-medium" : ""}>
                {gym.isOpen ? "영업중 · 06:00 - 24:00" : "영업종료 · 내일 06:00 오픈"}
              </span>
            </div>
            {gym.phone && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{gym.phone}</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">월 이용권</p>
                <p className="text-2xl font-bold text-primary">{priceDisplay}</p>
              </div>
              <Button variant="gradient" size="lg" onClick={() => navigate("/attendance")}>
                출석 체크하기
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="mt-4">
          <TabsList className="w-full grid grid-cols-4 bg-secondary/50">
            <TabsTrigger value="info">정보</TabsTrigger>
            <TabsTrigger value="schedule">시간표</TabsTrigger>
            <TabsTrigger value="reviews">리뷰</TabsTrigger>
            <TabsTrigger value="notice">공지</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4 space-y-4">
            <div className="gym-card p-4">
              <h3 className="font-semibold mb-3">시설 안내</h3>
              <div className="grid grid-cols-3 gap-3">
                {["주차가능", "샤워실", "락커", "PT룸", "유산소존", "프리웨이트"].map((facility) => (
                  <div key={facility} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
            </div>

            {gym.description && (
              <div className="gym-card p-4">
                <h3 className="font-semibold mb-3">소개</h3>
                <p className="text-sm text-muted-foreground">{gym.description}</p>
              </div>
            )}

            <div className="gym-card p-4">
              <h3 className="font-semibold mb-3">가격 안내</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">1개월</span>
                  <span className="font-semibold">{gym.priceMin ? `${gym.priceMin.toLocaleString()}원` : '-'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">3개월</span>
                  <span className="font-semibold">{gym.priceMin ? `${(gym.priceMin * 2.7).toLocaleString()}원` : '-'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">6개월</span>
                  <span className="font-semibold">{gym.priceMin ? `${(gym.priceMin * 4.8).toLocaleString()}원` : '-'}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="mt-4">
            <div className="gym-card p-4">
              <h3 className="font-semibold mb-3">운영 시간표</h3>
              <div className="space-y-2 text-sm">
                {["월요일", "화요일", "수요일", "목요일", "금요일"].map((day) => (
                  <div key={day} className="flex justify-between items-center py-2 border-b border-border">
                    <span>{day}</span>
                    <span className="text-muted-foreground">06:00 - 24:00</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span>토요일</span>
                  <span className="text-muted-foreground">08:00 - 22:00</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>일요일</span>
                  <span className="text-muted-foreground">10:00 - 20:00</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <div className="gym-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">리뷰 {gym.reviewCount}개</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-accent text-accent" />
                  <span className="font-bold">{gym.rating.toFixed(1)}</span>
                </div>
              </div>
              {gym.reviewCount > 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  리뷰를 불러오는 중...
                </p>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  아직 리뷰가 없습니다.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notice" className="mt-4">
            <div className="gym-card p-4">
              <h3 className="font-semibold mb-3">공지사항</h3>
              <p className="text-sm text-muted-foreground text-center py-4">
                등록된 공지사항이 없습니다.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GymDetail;
