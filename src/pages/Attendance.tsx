import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { AttendanceCard } from "@/components/attendance/AttendanceCard";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Award, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { attendanceApi } from "@/api/attendance";
import { membershipsApi } from "@/api/misc";
import { useAuth } from "@/contexts/AuthContext";
import type { AttendanceResponse, GymResponse } from "@/api/types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop";

const Attendance = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [gyms, setGyms] = useState<GymResponse[]>([]);
  const [selectedGym, setSelectedGym] = useState<GymResponse | null>(null);
  const [records, setRecords] = useState<AttendanceResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const [myGyms, recent, total, monthly] = await Promise.all([
        membershipsApi.getMyGyms(),
        attendanceApi.getMyAttendances(0, 10),
        attendanceApi.getTotalCount(),
        attendanceApi.getMonthlyAttendances(now.getFullYear(), now.getMonth() + 1),
      ]);

      setGyms(myGyms ?? []);
      setSelectedGym((current) => current ?? myGyms?.[0] ?? null);
      setRecords(recent?.content ?? []);
      setTotalCount(total ?? 0);
      setMonthlyCount(monthly?.length ?? 0);
    } catch (error) {
      console.error("Failed to load attendance data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadData();
    else if (!isAuthLoading) setIsLoading(false);
  }, [isAuthenticated, isAuthLoading, loadData]);

  const handleCheckIn = async (phoneNumber: string): Promise<boolean> => {
    if (!selectedGym) return false;

    setIsSubmitting(true);
    try {
      await attendanceApi.checkIn({
        gymId: selectedGym.id,
        checkInMethod: "PHONE",
        phoneNumber,
      });
      toast.success("출석 체크가 완료되었습니다!");
      await loadData();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "출석 체크에 실패했습니다.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="출석 체크" showLocation={false} />
        <main className="pt-20 px-4">
          <div className="gym-card p-8 text-center">
            <p className="text-muted-foreground mb-4">출석 체크는 로그인 후 이용할 수 있습니다.</p>
            <Button onClick={() => navigate("/login")} className="gap-2">
              <LogIn className="w-4 h-4" />
              로그인하기
            </Button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const streak = calculateStreak(records);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="출석 체크" showLocation={false} />

      <main className="pt-20 px-4 space-y-6">
        <div className="grid grid-cols-3 gap-3 animate-fade-in">
          <div className="gym-card p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{monthlyCount}</p>
            <p className="text-xs text-muted-foreground">이번 달</p>
          </div>
          <div className="gym-card p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-xs text-muted-foreground">연속 출석</p>
          </div>
          <div className="gym-card p-4 text-center">
            <Award className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{totalCount}</p>
            <p className="text-xs text-muted-foreground">누적 출석</p>
          </div>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <p className="text-sm font-medium mb-3">출석할 체육관 선택</p>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : gyms.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {gyms.map((gym) => (
                <button
                  key={gym.id}
                  onClick={() => setSelectedGym(gym)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl whitespace-nowrap transition-all duration-200 ${
                    selectedGym?.id === gym.id
                      ? "bg-primary text-primary-foreground shadow-gym"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  <img
                    src={gym.imageUrl || FALLBACK_IMAGE}
                    alt={gym.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="text-left">
                    <p className="font-medium text-sm">{gym.name}</p>
                    <p
                      className={`text-xs ${
                        selectedGym?.id === gym.id
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {gym.address.slice(0, 14)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="gym-card p-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                등록된 체육관이 없습니다. 체육관에 관원으로 등록되면 출석 체크를 할 수 있습니다.
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                체육관 둘러보기
              </Button>
            </div>
          )}
        </div>

        {selectedGym && (
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <AttendanceCard
              gymName={selectedGym.name}
              isSubmitting={isSubmitting}
              onCheckIn={handleCheckIn}
            />
          </div>
        )}

        <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="gym-card p-4">
            <h3 className="font-semibold mb-4">최근 출석 기록</h3>
            {records.length > 0 ? (
              <div className="space-y-3">
                {records.map((record) => {
                  const time = new Date(record.checkInTime);
                  return (
                    <div
                      key={record.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {time.toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">{record.gymName}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {time.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">출석 기록이 없습니다.</p>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

/** Consecutive days ending today or yesterday, based on the most recent records. */
function calculateStreak(records: AttendanceResponse[]): number {
  if (records.length === 0) return 0;

  const days = [...new Set(records.map((r) => new Date(r.checkInTime).toDateString()))]
    .map((day) => new Date(day).getTime())
    .sort((a, b) => b - a);

  const oneDay = 24 * 60 * 60 * 1000;
  const today = new Date(new Date().toDateString()).getTime();

  if (days[0] !== today && days[0] !== today - oneDay) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i += 1) {
    if (days[i - 1] - days[i] !== oneDay) break;
    streak += 1;
  }
  return streak;
}

export default Attendance;
