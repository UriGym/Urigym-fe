import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  MessageSquare,
  Calendar,
  Bell,
  TrendingUp,
  UserPlus,
  Clock,
  Star,
  Building2,
  Loader2,
  Plus,
  Trash2,
  Pencil,
  ArrowLeft,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ownerApi } from "@/api/owner";
import { gymsApi } from "@/api/gyms";
import { GYM_CATEGORIES } from "@/components/gym/CategoryFilter";
import type {
  EventResponse,
  GymMemberResponse,
  GymOwnerRequest,
  GymResponse,
  MembershipPlanRequest,
  MembershipPlanResponse,
  OwnerGymStats,
  ReviewResponse,
} from "@/api/types";

const ABSENT_DAYS = 7;

const EMPTY_GYM_FORM: GymOwnerRequest = {
  name: "",
  category: GYM_CATEGORIES[0].id,
  address: "",
  description: "",
  phone: "",
  lat: undefined,
  lng: undefined,
  priceMin: 0,
  priceMax: undefined,
  tags: [],
};

const OwnerDashboard = () => {
  const navigate = useNavigate();

  const [gyms, setGyms] = useState<GymResponse[]>([]);
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);
  const [stats, setStats] = useState<OwnerGymStats | null>(null);
  const [members, setMembers] = useState<GymMemberResponse[]>([]);
  const [absentMembers, setAbsentMembers] = useState<GymMemberResponse[]>([]);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [plans, setPlans] = useState<MembershipPlanResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedGym = useMemo(
    () => gyms.find((gym) => gym.id === selectedGymId) ?? null,
    [gyms, selectedGymId]
  );

  const loadGyms = useCallback(async () => {
    try {
      const myGyms = (await ownerApi.getMyGyms()) ?? [];
      setGyms(myGyms);
      setSelectedGymId((current) => current ?? myGyms[0]?.id ?? null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "체육관을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadGymData = useCallback(async (gymId: string) => {
    try {
      const [gymStats, memberList, absentList, reviewPage, eventList, planList] = await Promise.all([
        ownerApi.getStats(gymId, ABSENT_DAYS),
        ownerApi.getMembers(gymId),
        ownerApi.getAbsentMembers(gymId, ABSENT_DAYS),
        ownerApi.getReviews(gymId, 0, 20),
        gymsApi.getEvents(gymId),
        gymsApi.getMembershipPlans(gymId),
      ]);
      setStats(gymStats ?? null);
      setMembers(memberList ?? []);
      setAbsentMembers(absentList ?? []);
      setReviews(reviewPage?.content ?? []);
      setEvents(eventList ?? []);
      setPlans(planList ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "데이터를 불러오지 못했습니다.");
    }
  }, []);

  useEffect(() => {
    loadGyms();
  }, [loadGyms]);

  useEffect(() => {
    if (selectedGymId) loadGymData(selectedGymId);
  }, [selectedGymId, loadGymData]);

  const refresh = () => {
    loadGyms();
    if (selectedGymId) loadGymData(selectedGymId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="flex items-center justify-between gap-3 px-4 py-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate("/mypage")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Building2 className="w-5 h-5 text-primary shrink-0" />
            <h1 className="text-lg font-bold truncate">관장 대시보드</h1>
          </div>
          {gyms.length > 0 && (
            <Select value={selectedGymId ?? ""} onValueChange={setSelectedGymId}>
              <SelectTrigger className="w-40 shrink-0">
                <SelectValue placeholder="체육관 선택" />
              </SelectTrigger>
              <SelectContent>
                {gyms.map((gym) => (
                  <SelectItem key={gym.id} value={gym.id}>
                    {gym.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </header>

      <main className="pt-20 pb-10 px-4 max-w-4xl mx-auto space-y-6">
        {gyms.length === 0 ? (
          <div className="gym-card p-8 text-center space-y-4">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <p className="font-semibold mb-1">등록된 체육관이 없습니다</p>
              <p className="text-sm text-muted-foreground">
                체육관을 등록하면 관원 관리와 공지 발송을 시작할 수 있습니다.
              </p>
            </div>
            <GymFormDialog onSaved={refresh} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
              <StatCard icon={Users} label="총 관원" value={stats?.memberCount ?? 0} />
              <StatCard
                icon={TrendingUp}
                label="오늘 출석"
                value={stats?.todayAttendance ?? 0}
                iconClass="text-green-500"
              />
              <StatCard
                icon={Star}
                label="평균 평점"
                value={(stats?.rating ?? 0).toFixed(1)}
                iconClass="text-accent"
              />
              <StatCard
                icon={Clock}
                label={`${ABSENT_DAYS}일 미출석`}
                value={stats?.absentMemberCount ?? 0}
                iconClass="text-yellow-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AnnouncementDialog gymId={selectedGymId!} onSaved={refresh} />
              <GroupMessageDialog gymId={selectedGymId!} members={members} />
            </div>

            <Tabs defaultValue="members">
              <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6 bg-secondary/50 h-auto">
                <TabsTrigger value="members">관원</TabsTrigger>
                <TabsTrigger value="plans">회원권</TabsTrigger>
                <TabsTrigger value="absent">미출석</TabsTrigger>
                <TabsTrigger value="reviews">리뷰</TabsTrigger>
                <TabsTrigger value="events">이벤트</TabsTrigger>
                <TabsTrigger value="gym">체육관</TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="mt-4 space-y-4">
                <MemberDialog gymId={selectedGymId!} onSaved={refresh} />
                {members.length === 0 ? (
                  <EmptyBlock message="등록된 관원이 없습니다." />
                ) : (
                  <div className="gym-card divide-y divide-border">
                    {members.map((member) => (
                      <MemberRow
                        key={member.id}
                        member={member}
                        gymId={selectedGymId!}
                        onChanged={refresh}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="plans" className="mt-4 space-y-4">
                <MembershipPlanDialog gymId={selectedGymId!} onSaved={refresh} />
                {plans.length === 0 ? (
                  <EmptyBlock message="등록된 회원권이 없습니다. 관원들이 문의할 수 있도록 1개월/3개월/6개월 같은 회원권을 등록해보세요." />
                ) : (
                  <div className="gym-card divide-y divide-border">
                    {plans.map((plan) => (
                      <MembershipPlanRow
                        key={plan.id}
                        plan={plan}
                        gymId={selectedGymId!}
                        onChanged={refresh}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="absent" className="mt-4 space-y-4">
                <div className="gym-card p-4 border-l-4 border-accent">
                  <h3 className="font-semibold mb-1 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    {ABSENT_DAYS}일 이상 미출석 관원
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {absentMembers.length}명에게 안내 메시지를 보낼 수 있습니다.
                  </p>
                  {absentMembers.length > 0 && (
                    <AbsentReminderDialog
                      gymId={selectedGymId!}
                      members={absentMembers}
                      days={ABSENT_DAYS}
                    />
                  )}
                </div>

                {absentMembers.length === 0 ? (
                  <EmptyBlock message="장기 미출석 관원이 없습니다." />
                ) : (
                  <div className="gym-card divide-y divide-border">
                    {absentMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{member.userName || member.userEmail}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.lastCheckInTime
                              ? `마지막 방문: ${new Date(member.lastCheckInTime).toLocaleDateString("ko-KR")}`
                              : "출석 기록 없음"}
                          </p>
                        </div>
                        <Badge variant="destructive" className="shrink-0">
                          {member.daysSinceLastCheckIn != null
                            ? `${member.daysSinceLastCheckIn}일`
                            : "미출석"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <div className="gym-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">리뷰 {reviews.length}개</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-accent text-accent" />
                      <span className="font-bold">{(stats?.rating ?? 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    리뷰는 열람만 가능하며 수정하거나 삭제할 수 없습니다.
                  </p>
                  {reviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      아직 리뷰가 없습니다.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="pb-4 border-b border-border last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{review.userName}</span>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-accent text-accent" />
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

              <TabsContent value="events" className="mt-4 space-y-4">
                <EventDialog gymId={selectedGymId!} onSaved={refresh} />
                {events.length === 0 ? (
                  <EmptyBlock message="예정된 이벤트가 없습니다." />
                ) : (
                  <div className="gym-card divide-y divide-border">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.eventDate).toLocaleDateString("ko-KR")}
                          </p>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge>{daysUntil(event.eventDate)}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="이벤트 삭제"
                            className="text-destructive hover:text-destructive"
                            onClick={async () => {
                              try {
                                await ownerApi.deleteEvent(selectedGymId!, event.id);
                                toast.success("삭제되었습니다.");
                                refresh();
                              } catch (error) {
                                toast.error(
                                  error instanceof Error ? error.message : "삭제에 실패했습니다."
                                );
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="gym" className="mt-4 space-y-4">
                <div className="flex gap-2">
                  <GymFormDialog onSaved={refresh} />
                  {selectedGym && <GymFormDialog gym={selectedGym} onSaved={refresh} />}
                </div>
                {selectedGym && (
                  <div className="gym-card p-4 space-y-2 text-sm">
                    <Row label="이름" value={selectedGym.name} />
                    <Row label="카테고리" value={selectedGym.category} />
                    <Row label="주소" value={selectedGym.address} />
                    <Row label="전화" value={selectedGym.phone || "-"} />
                    <Row
                      label="월 이용료"
                      value={
                        selectedGym.priceMin
                          ? `${selectedGym.priceMin.toLocaleString()}원${
                              selectedGym.priceMax
                                ? ` ~ ${selectedGym.priceMax.toLocaleString()}원`
                                : ""
                            }`
                          : "미등록"
                      }
                    />
                    <Row label="누적 신고" value={`${selectedGym.reportCount}건`} />
                    {selectedGym.suspendedUntil &&
                      new Date(selectedGym.suspendedUntil) > new Date() && (
                        <p className="pt-2 border-t border-border text-destructive">
                          관리자에 의해{" "}
                          {new Date(selectedGym.suspendedUntil).toLocaleDateString("ko-KR")}까지 노출이
                          정지되었습니다.
                        </p>
                      )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

// --- Small building blocks ---

const StatCard = ({
  icon: Icon,
  label,
  value,
  iconClass = "text-primary",
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  iconClass?: string;
}) => (
  <div className="gym-card p-4">
    <Icon className={`w-5 h-5 mb-2 ${iconClass}`} />
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-2">
    <span className="text-muted-foreground shrink-0">{label}</span>
    <span className="text-right truncate">{value}</span>
  </div>
);

const EmptyBlock = ({ message }: { message: string }) => (
  <div className="gym-card p-10 text-center text-sm text-muted-foreground">{message}</div>
);

const MemberRow = ({
  member,
  gymId,
  onChanged,
}: {
  member: GymMemberResponse;
  gymId: string;
  onChanged: () => void;
}) => {
  const remove = async () => {
    try {
      await ownerApi.removeMember(gymId, member.id);
      toast.success("관원이 삭제되었습니다.");
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "삭제에 실패했습니다.");
    }
  };

  const rate = member.attendanceRate ?? 0;

  return (
    <div className="flex items-center gap-3 p-4">
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-sm font-medium">
          {member.userName?.[0] ?? member.userEmail[0].toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{member.userName || member.userEmail}</p>
        <p className="text-xs text-muted-foreground truncate">
          {member.userPhone || member.userEmail}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm text-muted-foreground">출석률 {rate}%</span>
        <Badge
          variant={rate < 50 ? "destructive" : "secondary"}
          className={rate >= 50 ? "bg-green-500/10 text-green-600" : ""}
        >
          {rate >= 50 ? "활발" : "주의"}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          aria-label="관원 삭제"
          onClick={remove}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const MembershipPlanRow = ({
  plan,
  gymId,
  onChanged,
}: {
  plan: MembershipPlanResponse;
  gymId: string;
  onChanged: () => void;
}) => {
  const remove = async () => {
    try {
      await ownerApi.deleteMembershipPlan(gymId, plan.id);
      toast.success("회원권이 삭제되었습니다.");
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "삭제에 실패했습니다.");
    }
  };

  return (
    <div className="flex items-center gap-3 p-4">
      <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
        <Tag className="w-4 h-4 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{plan.name}</p>
        {plan.description && (
          <p className="text-xs text-muted-foreground truncate">{plan.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-semibold">{plan.price.toLocaleString()}원</span>
        <MembershipPlanDialog gymId={gymId} plan={plan} onSaved={onChanged} />
        <Button
          variant="ghost"
          size="icon"
          aria-label="회원권 삭제"
          onClick={remove}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const MembershipPlanDialog = ({
  gymId,
  plan,
  onSaved,
}: {
  gymId: string;
  plan?: MembershipPlanResponse;
  onSaved: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<MembershipPlanRequest>({ name: "", price: 0, description: "" });

  useEffect(() => {
    if (!open) return;
    setForm(
      plan
        ? { name: plan.name, price: plan.price, description: plan.description ?? "" }
        : { name: "", price: 0, description: "" }
    );
  }, [open, plan]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (plan) await ownerApi.updateMembershipPlan(gymId, plan.id, form);
      else await ownerApi.createMembershipPlan(gymId, form);
      toast.success(plan ? "수정되었습니다." : "회원권이 등록되었습니다.");
      setOpen(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {plan ? (
        <Button variant="ghost" size="icon" aria-label="회원권 수정" onClick={() => setOpen(true)}>
          <Pencil className="w-4 h-4" />
        </Button>
      ) : (
        <Button variant="gradient" className="w-full h-12" onClick={() => setOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          회원권 등록
        </Button>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{plan ? "회원권 수정" : "회원권 등록"}</DialogTitle>
          <DialogDescription>
            1개월 / 3개월 / 6개월처럼 자유롭게 이름을 붙여 등록하세요. 관원은 체육관 상세 화면에서
            보고 문의할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <Field label="이름" required>
            <Input
              required
              placeholder="1개월"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </Field>
          <Field label="가격 (원)" required>
            <Input
              type="number"
              min={0}
              required
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
            />
          </Field>
          <Field label="설명 (선택)">
            <Input
              placeholder="PT 4회 포함"
              value={form.description ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" variant="gradient" disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// --- Dialogs ---

const GymFormDialog = ({ gym, onSaved }: { gym?: GymResponse; onSaved: () => void }) => {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<GymOwnerRequest>(EMPTY_GYM_FORM);

  useEffect(() => {
    if (!open) return;
    setForm(
      gym
        ? {
            name: gym.name,
            category: gym.category,
            address: gym.address,
            description: gym.description ?? "",
            phone: gym.phone ?? "",
            imageUrl: gym.imageUrl,
            lat: gym.lat,
            lng: gym.lng,
            priceMin: gym.priceMin ?? 0,
            priceMax: gym.priceMax,
            isOpen: gym.isOpen,
            tags: gym.tags,
          }
        : EMPTY_GYM_FORM
    );
  }, [open, gym]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (gym) await ownerApi.updateGym(gym.id, form);
      else await ownerApi.createGym(form);
      toast.success(gym ? "수정되었습니다." : "체육관이 등록되었습니다.");
      setOpen(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant={gym ? "outline" : "gradient"} onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-1" />
        {gym ? "체육관 수정" : "체육관 등록"}
      </Button>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{gym ? "체육관 수정" : "체육관 등록"}</DialogTitle>
          <DialogDescription>가격 등록은 필수입니다.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <Field label="이름" required>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </Field>
          <Field label="카테고리" required>
            <Select
              value={form.category}
              onValueChange={(value) => setForm((p) => ({ ...p, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GYM_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.emoji} {category.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="주소" required>
            <Input
              required
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="위도 (지도 표시용)">
              <Input
                type="number"
                step="any"
                value={form.lat ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, lat: e.target.value ? Number(e.target.value) : undefined }))
                }
              />
            </Field>
            <Field label="경도 (지도 표시용)">
              <Input
                type="number"
                step="any"
                value={form.lng ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, lng: e.target.value ? Number(e.target.value) : undefined }))
                }
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="월 최소 가격 (원)" required>
              <Input
                type="number"
                min={0}
                required
                value={form.priceMin}
                onChange={(e) => setForm((p) => ({ ...p, priceMin: Number(e.target.value) }))}
              />
            </Field>
            <Field label="월 최대 가격 (원)">
              <Input
                type="number"
                min={0}
                value={form.priceMax ?? ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    priceMax: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </Field>
          </div>
          <Field label="전화번호">
            <Input
              value={form.phone ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            />
          </Field>
          <Field label="소개">
            <Textarea
              rows={3}
              value={form.description ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </Field>
          <Field label="태그 (쉼표로 구분)">
            <Input
              value={form.tags?.join(", ") ?? ""}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  tags: e.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                }))
              }
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" variant="gradient" disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const MemberDialog = ({ gymId, onSaved }: { gymId: string; onSaved: () => void }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await ownerApi.addMember(gymId, { userEmail: email });
      toast.success("관원이 등록되었습니다.");
      setEmail("");
      setOpen(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "등록에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="soft" className="w-full h-12" onClick={() => setOpen(true)}>
        <UserPlus className="w-5 h-5 mr-2" />
        신규 관원 등록
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>신규 관원 등록</DialogTitle>
          <DialogDescription>
            이미 우리짐에 가입한 사용자의 이메일로 관원을 등록합니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <Field label="회원 이메일" required>
            <Input
              type="email"
              required
              placeholder="member@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" variant="gradient" disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              등록
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const AnnouncementDialog = ({ gymId, onSaved }: { gymId: string; onSaved: () => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [isSaving, setIsSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await ownerApi.createAnnouncement(gymId, form);
      toast.success("공지가 등록되고 관원에게 알림이 발송되었습니다.");
      setForm({ title: "", content: "" });
      setOpen(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "등록에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="gradient" className="h-14 text-base" onClick={() => setOpen(true)}>
        <Bell className="w-5 h-5 mr-2" />
        공지 등록
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>공지 등록</DialogTitle>
          <DialogDescription>등록하면 관원 전원에게 알림이 발송됩니다.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <Field label="제목" required>
            <Input
              required
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </Field>
          <Field label="내용" required>
            <Textarea
              required
              rows={5}
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" variant="gradient" disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              등록 및 발송
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const GroupMessageDialog = ({
  gymId,
  members,
}: {
  gymId: string;
  members: GymMemberResponse[];
}) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const result = await ownerApi.sendGroupMessage(gymId, {
        ...form,
        targetType: sendToAll ? "ALL" : "SELECTED",
        memberIds: sendToAll ? undefined : selectedIds,
      });
      toast.success(`${result?.recipientCount ?? 0}명에게 발송되었습니다.`);
      setForm({ title: "", content: "" });
      setSelectedIds([]);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "발송에 실패했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" className="h-14 text-base" onClick={() => setOpen(true)}>
        <MessageSquare className="w-5 h-5 mr-2" />
        단체 메시지
      </Button>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>단체 메시지</DialogTitle>
          <DialogDescription>전체 관원 또는 선택한 관원에게 발송합니다.</DialogDescription>
        </DialogHeader>
        <form onSubmit={send} className="space-y-4">
          <Field label="제목" required>
            <Input
              required
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </Field>
          <Field label="내용" required>
            <Textarea
              required
              rows={4}
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            />
          </Field>

          <div className="space-y-2">
            <Label>발송 대상</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={sendToAll ? "gradient" : "outline"}
                size="sm"
                onClick={() => setSendToAll(true)}
              >
                전체 ({members.length}명)
              </Button>
              <Button
                type="button"
                variant={!sendToAll ? "gradient" : "outline"}
                size="sm"
                onClick={() => setSendToAll(false)}
              >
                선택 발송
              </Button>
            </div>
          </div>

          {!sendToAll && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border divide-y divide-border">
              {members.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-secondary/50"
                >
                  <Checkbox
                    checked={selectedIds.includes(member.id)}
                    onCheckedChange={(checked) =>
                      setSelectedIds((prev) =>
                        checked ? [...prev, member.id] : prev.filter((id) => id !== member.id)
                      )
                    }
                  />
                  <span className="text-sm truncate">{member.userName || member.userEmail}</span>
                </label>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button
              type="submit"
              variant="gradient"
              disabled={isSending || (!sendToAll && selectedIds.length === 0)}
            >
              {isSending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              발송
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const AbsentReminderDialog = ({
  gymId,
  members,
  days,
}: {
  gymId: string;
  members: GymMemberResponse[];
  days: number;
}) => {
  const [open, setOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [content, setContent] = useState(
    `안녕하세요! ${days}일 이상 방문하지 않으셨네요. 다시 운동 시작해보는 건 어떨까요? 언제든 편하게 방문해주세요 💪`
  );

  const send = async () => {
    setIsSending(true);
    try {
      const result = await ownerApi.sendGroupMessage(gymId, {
        title: "오랜만이에요! 다시 만나요",
        content,
        targetType: "SELECTED",
        memberIds: members.map((member) => member.id),
      });
      toast.success(`${result?.recipientCount ?? 0}명에게 발송되었습니다.`);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "발송에 실패했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" className="w-full" onClick={() => setOpen(true)}>
        미출석 관원에게 메시지 보내기
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>미출석 관원 안내</DialogTitle>
          <DialogDescription>{members.length}명에게 안내 메시지를 발송합니다.</DialogDescription>
        </DialogHeader>
        <Field label="메시지">
          <Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button variant="gradient" onClick={send} disabled={isSending}>
            {isSending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            발송
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EventDialog = ({ gymId, onSaved }: { gymId: string; onSaved: () => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", eventDate: "" });
  const [isSaving, setIsSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await ownerApi.createEvent(gymId, form);
      toast.success("이벤트가 등록되었습니다.");
      setForm({ title: "", description: "", eventDate: "" });
      setOpen(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "등록에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="gradient" className="w-full h-12" onClick={() => setOpen(true)}>
        <Calendar className="w-5 h-5 mr-2" />새 이벤트 등록
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>이벤트 등록</DialogTitle>
          <DialogDescription>승급 심사 등 체육관 일정을 등록합니다.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <Field label="제목" required>
            <Input
              required
              placeholder="승급 심사"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </Field>
          <Field label="날짜" required>
            <Input
              type="date"
              required
              value={form.eventDate}
              onChange={(e) => setForm((p) => ({ ...p, eventDate: e.target.value }))}
            />
          </Field>
          <Field label="설명">
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" variant="gradient" disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              등록
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <Label>
      {label}
      {required && <span className="text-destructive"> *</span>}
    </Label>
    {children}
  </div>
);

function daysUntil(date: string): string {
  const diff = Math.ceil(
    (new Date(date).getTime() - new Date(new Date().toDateString()).getTime()) /
      (24 * 60 * 60 * 1000)
  );
  if (diff === 0) return "D-DAY";
  return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
}

export default OwnerDashboard;
