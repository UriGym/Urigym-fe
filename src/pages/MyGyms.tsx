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
import { GymImage } from "@/components/gym/GymImage";
import type { MyMembershipResponse } from "@/api/types";

const MyGyms = () => {
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState<MyMembershipResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelling, setCancelling] = useState<MyMembershipResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

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
    const isPending = cancelling.status === "PENDING";
    const isInvited = cancelling.status === "INVITED";
    setIsSubmitting(true);
    try {
      if (isInvited) {
        await membershipsApi.decline(cancelling.id);
        toast.success(`${cancelling.gym.name} 초대를 거절했습니다.`);
      } else {
        await membershipsApi.cancel(cancelling.id);
        toast.success(
          isPending ? `${cancelling.gym.name} 등록 신청을 취소했습니다.` : `${cancelling.gym.name} 회원권을 해지했습니다.`
        );
      }
      setCancelling(null);
      load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isInvited
            ? "거절에 실패했습니다."
            : isPending
              ? "신청 취소에 실패했습니다."
              : "해지에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccept = async (membership: MyMembershipResponse) => {
    setAcceptingId(membership.id);
    try {
      await membershipsApi.accept(membership.id);
      toast.success(`${membership.gym.name} 등록을 수락했습니다.`);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "수락에 실패했습니다.");
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="fixed top-16 left-0 right-0 z-40 glass border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate("/mypage")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">등록 체육관</h1>
        </div>
      </header>

      <main className="pt-32 px-4 max-w-lg mx-auto space-y-3">
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
                <GymImage
                  src={membership.gym.imageUrl}
                  alt={membership.gym.name}
                  className="w-16 h-16 rounded-lg shrink-0"
                  compact
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{membership.gym.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate mt-0.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {membership.gym.address}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    {new Date(membership.joinedAt).toLocaleDateString("ko-KR")}{" "}
                    {membership.status === "PENDING"
                      ? "신청"
                      : membership.status === "INVITED"
                        ? "초대"
                        : "가입"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                {membership.status === "PENDING" ? (
                  <p className="text-sm text-muted-foreground">관장 승인 대기중</p>
                ) : membership.status === "INVITED" ? (
                  <p className="text-sm text-muted-foreground">
                    {membership.gym.name} 체육관에서 등록을 초대했습니다
                  </p>
                ) : (
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
                )}
                {membership.status === "INVITED" ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      disabled={acceptingId === membership.id}
                      onClick={() => handleAccept(membership)}
                    >
                      수락
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setCancelling(membership)}
                    >
                      거절
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive shrink-0"
                    onClick={() => setCancelling(membership)}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    {membership.status === "PENDING" ? "신청 취소" : "해지"}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </main>

      <AlertDialog open={!!cancelling} onOpenChange={(open) => !open && setCancelling(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {cancelling?.status === "PENDING"
                ? "등록 신청을 취소할까요?"
                : cancelling?.status === "INVITED"
                  ? "초대를 거절할까요?"
                  : "회원권을 해지할까요?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {cancelling?.status === "PENDING" ? (
                <>{cancelling?.gym.name} 등록 신청을 취소합니다. 다시 신청하려면 체육관 페이지에서 재신청해야 합니다.</>
              ) : cancelling?.status === "INVITED" ? (
                <>{cancelling?.gym.name}의 등록 초대를 거절합니다. 다시 등록하려면 관장에게 재초대를 요청해야 합니다.</>
              ) : (
                <>
                  {cancelling?.gym.name}의 회원권을 해지합니다. 해지 후에는 이 체육관에서 출석 체크를 할 수
                  없고, 다시 이용하려면 체육관에 재등록해야 합니다. 지금까지의 출석 기록은 그대로 남습니다.
                </>
              )}
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
              {cancelling?.status === "PENDING"
                ? "신청 취소하기"
                : cancelling?.status === "INVITED"
                  ? "거절하기"
                  : "해지하기"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyGyms;
