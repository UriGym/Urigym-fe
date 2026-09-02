import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Loader2, MapPin, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { membershipsApi } from "@/api/misc";
import type { MyMembershipResponse } from "@/api/types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop";

const MyGyms = () => {
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState<MyMembershipResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelling, setCancelling] = useState<MyMembershipResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(() => {
    setIsLoading(true);
    membershipsApi
      .getMine()
      .then((data) => setMemberships(data ?? []))
      .catch(() => setMemberships([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(load, [load]);

  const handleCancel = async () => {
    if (!cancelling) return;
    setIsSubmitting(true);
    try {
      await membershipsApi.cancel(cancelling.id);
      toast.success(`${cancelling.gym.name} 회원권을 해지했습니다.`);
      setCancelling(null);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "해지에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate("/mypage")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">등록 체육관</h1>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-lg mx-auto space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : memberships.length === 0 ? (
          <div className="gym-card p-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">등록된 체육관이 없습니다.</p>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              체육관 둘러보기
            </Button>
          </div>
        ) : (
          memberships.map((membership) => (
            <div key={membership.id} className="gym-card p-4">
              <div
                className="flex gap-3 cursor-pointer"
                onClick={() => navigate(`/gym/${membership.gym.id}`)}
              >
                <img
                  src={membership.gym.imageUrl || FALLBACK_IMAGE}
                  alt={membership.gym.name}
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{membership.gym.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate mt-0.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {membership.gym.address}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    {new Date(membership.joinedAt).toLocaleDateString("ko-KR")} 가입
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <p className="text-sm">
                  총 출석 <span className="font-semibold text-primary">{membership.attendanceCount}</span>회
                  {membership.lastCheckInTime && (
                    <span className="text-muted-foreground">
                      {" "}
                      · 마지막 방문{" "}
                      {new Date(membership.lastCheckInTime).toLocaleDateString("ko-KR")}
                    </span>
                  )}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => setCancelling(membership)}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  해지
                </Button>
              </div>
            </div>
          ))
        )}
      </main>

      <AlertDialog open={!!cancelling} onOpenChange={(open) => !open && setCancelling(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>회원권을 해지할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelling?.gym.name}의 회원권을 해지합니다. 해지 후에는 이 체육관에서 출석 체크를 할 수
              없고, 다시 이용하려면 체육관에 재등록해야 합니다. 지금까지의 출석 기록은 그대로 남습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              해지하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyGyms;
