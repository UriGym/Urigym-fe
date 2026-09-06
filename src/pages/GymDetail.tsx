import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  Share2,
  Heart,
  Loader2,
  Flag,
  AlertTriangle,
  Calendar,
  MessageCircleQuestion,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { gymsApi } from "@/api/gyms";
import { GymMap } from "@/components/gym/GymMap";
import { paymentsApi } from "@/api/payments";
import { loadTossPayments } from "@/lib/tossPayments";
import { useAuth } from "@/contexts/AuthContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import type {
  AnnouncementResponse,
  EventResponse,
  GymResponse,
  MembershipPlanResponse,
  ReviewResponse,
} from "@/api/types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop";

const GymDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { center: myLocation } = useGeolocation();

  const initialTab = (location.state as { tab?: string } | null)?.tab ?? "info";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [gym, setGym] = useState<GymResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [plans, setPlans] = useState<MembershipPlanResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const [gymData, reviewPage, announcementPage, eventList, planList] = await Promise.all([
          gymsApi.getById(id),
          gymsApi.getReviews(id, 0, 20),
          gymsApi.getAnnouncements(id, 0, 10),
          gymsApi.getEvents(id),
          gymsApi.getMembershipPlans(id),
        ]);
        setGym(gymData ?? null);
        setReviews(reviewPage?.content ?? []);
        setAnnouncements(announcementPage?.content ?? []);
        setEvents(eventList ?? []);
        setPlans(planList ?? []);
      } catch (error) {
        console.error("Failed to fetch gym:", error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    if (!id || !isAuthenticated) {
      setIsFavorited(false);
      return;
    }
    gymsApi
      .getFavoriteStatus(id)
      .then((status) => setIsFavorited(status?.favorited ?? false))
      .catch(() => setIsFavorited(false));
  }, [id, isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("찜하기는 로그인 후 이용할 수 있습니다.");
      navigate("/login");
      return;
    }
    if (!id || isTogglingFavorite) return;

    setIsTogglingFavorite(true);
    try {
      const status = await gymsApi.toggleFavorite(id);
      setIsFavorited(status?.favorited ?? false);
    } catch {
      toast.error("찜하기에 실패했습니다.");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: gym?.name, url: shareUrl });
      } catch {
        // user closed the native share sheet — no error to surface
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("링크가 복사되었습니다.");
    } catch {
      toast.error("공유에 실패했습니다.");
    }
  };

  const handleReport = () => {
    if (!isAuthenticated) {
      toast.error("신고는 로그인 후 이용할 수 있습니다.");
      navigate("/login");
      return;
    }
    navigate(`/support?gymId=${id}`);
  };

  const handlePurchase = async (plan: MembershipPlanResponse) => {
    if (!isAuthenticated) {
      toast.error("구매는 로그인 후 이용할 수 있습니다.");
      navigate("/login");
      return;
    }

    setPurchasingPlanId(plan.id);
    try {
      const order = await paymentsApi.createOrder(plan.id);
      if (!order) throw new Error("주문 생성에 실패했습니다.");

      const tossPayments = await loadTossPayments();
      // Redirects away to Toss's payment page — control returns via /payments/success or /payments/fail.
      await tossPayments.requestPayment("카드", {
        amount: order.amount,
        orderId: order.orderId,
        orderName: order.orderName,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        successUrl: `${window.location.origin}/payments/success`,
        failUrl: `${window.location.origin}/payments/fail`,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "결제 요청에 실패했습니다.");
    } finally {
      setPurchasingPlanId(null);
    }
  };

  const handleInquirePlan = (plan: MembershipPlanResponse) => {
    if (!isAuthenticated) {
      toast.error("문의는 로그인 후 이용할 수 있습니다.");
      navigate("/login");
      return;
    }
    navigate(
      `/support?gymId=${id}&planName=${encodeURIComponent(plan.name)}&planPrice=${plan.price}`
    );
  };

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

  const isSuspended = gym.suspendedUntil && new Date(gym.suspendedUntil) > new Date();
  const priceDisplay = gym.priceMin ? `월 ${gym.priceMin.toLocaleString()}원` : "가격문의";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative h-64">
        <img
          src={gym.imageUrl || FALLBACK_IMAGE}
          alt={gym.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-background/80 backdrop-blur-sm"
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              aria-label="공유"
              className="rounded-full bg-background/80 backdrop-blur-sm"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label="찜하기"
              className="rounded-full bg-background/80 backdrop-blur-sm"
              disabled={isTogglingFavorite}
              onClick={handleToggleFavorite}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 relative z-10">
        {isSuspended && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-destructive">노출이 정지된 체육관입니다</p>
              <p className="text-muted-foreground">
                {new Date(gym.suspendedUntil as string).toLocaleDateString("ko-KR")}까지 검색과 지도에
                표시되지 않습니다.
              </p>
            </div>
          </div>
        )}

        <div className="gym-card p-5 animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground mb-1">{gym.category}</p>
              <h1 className="text-2xl font-bold">{gym.name}</h1>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className="flex items-center gap-1 bg-accent/10 rounded-full px-3 py-1.5 shrink-0 hover:bg-accent/20 transition-colors"
            >
              <Star className="w-5 h-5 fill-accent text-accent" />
              <span className="font-bold text-accent">{gym.rating.toFixed(1)}</span>
            </button>
          </div>

          {gym.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {gym.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{gym.address}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="w-4 h-4 shrink-0" />
              <span className={gym.isOpen ? "text-green-500 font-medium" : ""}>
                {gym.isOpen ? "영업중" : "영업종료"}
              </span>
            </div>
            {gym.phone && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <a href={`tel:${gym.phone}`} className="hover:text-foreground">
                  {gym.phone}
                </a>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">월 이용권</p>
                <p className="text-2xl font-bold text-primary">{priceDisplay}</p>
              </div>
              <Button variant="gradient" size="lg" onClick={() => navigate("/attendance")}>
                출석 체크하기
              </Button>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">가격이 다르거나 문제가 있나요?</p>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReport}
              >
                <Flag className="w-4 h-4 mr-1.5" />
                신고하기
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="w-full grid grid-cols-5 bg-secondary/50">
            <TabsTrigger value="info">정보</TabsTrigger>
            <TabsTrigger value="location">위치</TabsTrigger>
            <TabsTrigger value="events">일정</TabsTrigger>
            <TabsTrigger value="reviews">리뷰</TabsTrigger>
            <TabsTrigger value="notice">공지</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4 space-y-4">
            {gym.description && (
              <div className="gym-card p-4">
                <h3 className="font-semibold mb-3">소개</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {gym.description}
                </p>
              </div>
            )}

            <div className="gym-card p-4">
              <h3 className="font-semibold mb-3">회원권 안내</h3>
              {plans.length > 0 ? (
                <div className="divide-y divide-border">
                  {plans.map((plan) => (
                    <div key={plan.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{plan.name}</p>
                          {plan.description && (
                            <p className="text-xs text-muted-foreground truncate">{plan.description}</p>
                          )}
                        </div>
                        <span className="font-semibold text-primary shrink-0">
                          {plan.price.toLocaleString()}원
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="gradient"
                          className="flex-1"
                          disabled={purchasingPlanId === plan.id}
                          onClick={() => handlePurchase(plan)}
                        >
                          {purchasingPlanId === plan.id ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <CreditCard className="w-4 h-4 mr-1" />
                          )}
                          구매하기
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleInquirePlan(plan)}>
                          <MessageCircleQuestion className="w-4 h-4 mr-1" />
                          문의
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">최소</span>
                    <span className="font-semibold">
                      {gym.priceMin ? `${gym.priceMin.toLocaleString()}원` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">최대</span>
                    <span className="font-semibold">
                      {gym.priceMax ? `${gym.priceMax.toLocaleString()}원` : "-"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    아직 상세 회원권이 등록되지 않았습니다.
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                실제 금액이 다르면 신고해주세요. 확인 후 조치됩니다.
              </p>
            </div>

            <div className="gym-card p-4">
              <h3 className="font-semibold mb-3">현황</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{gym.memberCount}</p>
                  <p className="text-xs text-muted-foreground">관원</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{gym.reviewCount}</p>
                  <p className="text-xs text-muted-foreground">리뷰</p>
                </div>
                <button type="button" onClick={() => setActiveTab("reviews")} className="hover:opacity-70">
                  <p className="text-2xl font-bold text-primary">{gym.rating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">평점</p>
                </button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="location" className="mt-4">
            {gym.lat != null && gym.lng != null ? (
              <GymMap
                className="h-64"
                center={myLocation}
                markers={[{
                  id: gym.id,
                  name: gym.name,
                  category: gym.category,
                  address: gym.address,
                  lat: gym.lat,
                  lng: gym.lng,
                  rating: gym.rating,
                }]}
              />
            ) : (
              <div className="gym-card p-8 text-center text-sm text-muted-foreground">
                등록된 위치 정보가 없습니다.
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="mt-4">
            <div className="gym-card p-4">
              <h3 className="font-semibold mb-3">예정된 일정</h3>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  예정된 일정이 없습니다.
                </p>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg"
                    >
                      <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.eventDate).toLocaleDateString("ko-KR")}
                        </p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  아직 리뷰가 없습니다.
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-4 border-b border-border last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{review.userName}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < review.rating
                                  ? "fill-accent text-accent"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.content && (
                        <p className="text-sm text-muted-foreground mb-1">{review.content}</p>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notice" className="mt-4">
            <div className="gym-card p-4">
              <h3 className="font-semibold mb-3">공지사항</h3>
              {announcements.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  등록된 공지사항이 없습니다.
                </p>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="pb-4 border-b border-border last:border-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium">{announcement.title}</p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(announcement.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      {announcement.content && (
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {announcement.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GymDetail;
