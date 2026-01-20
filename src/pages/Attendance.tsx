import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { AttendanceCard } from "@/components/attendance/AttendanceCard";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Award, Loader2 } from "lucide-react";
import { gymsApi } from "@/api/gyms";
import { GymData } from "@/components/gym/GymCard";

const Attendance = () => {
  const [gyms, setGyms] = useState<GymData[]>([]);
  const [selectedGym, setSelectedGym] = useState<GymData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGyms = async () => {
      setIsLoading(true);
      try {
        const data = await gymsApi.getAll(0, 10);
        if (data?.content && data.content.length > 0) {
          const gymList = data.content as unknown as GymData[];
          setGyms(gymList);
          setSelectedGym(gymList[0]);
        }
      } catch (error) {
        console.error("Failed to fetch gyms:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGyms();
  }, []);

  const attendanceStats = {
    thisMonth: 0,
    streak: 0,
    total: 0,
  };

  const recentAttendance: { date: string; time: string; gym: string }[] = [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="출석 체크" showLocation={false} />

      <main className="pt-20 px-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 animate-fade-in">
          <div className="gym-card p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{attendanceStats.thisMonth}</p>
            <p className="text-xs text-muted-foreground">이번 달</p>
          </div>
          <div className="gym-card p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{attendanceStats.streak}</p>
            <p className="text-xs text-muted-foreground">연속 출석</p>
          </div>
          <div className="gym-card p-4 text-center">
            <Award className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{attendanceStats.total}</p>
            <p className="text-xs text-muted-foreground">누적 출석</p>
          </div>
        </div>

        {/* Gym Selector */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <p className="text-sm font-medium mb-3">출석할 체육관 선택</p>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : gyms.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {gyms.slice(0, 5).map((gym) => {
                const imageUrl = gym.image || gym.imageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop';
                return (
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
                      src={imageUrl}
                      alt={gym.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="text-left">
                      <p className="font-medium text-sm">{gym.name}</p>
                      <p className={`text-xs ${selectedGym?.id === gym.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {gym.distance || gym.address?.slice(0, 10)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              등록된 체육관이 없습니다.
            </p>
          )}
        </div>

        {/* Attendance Card */}
        {selectedGym && (
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <AttendanceCard
              gymName={selectedGym.name}
              onCheckIn={(method, data) => {
                console.log("Check-in:", method, data);
              }}
            />
          </div>
        )}

        {/* Recent Attendance */}
        <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="gym-card p-4">
            <h3 className="font-semibold mb-4">최근 출석 기록</h3>
            {recentAttendance.length > 0 ? (
              <div className="space-y-3">
                {recentAttendance.map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{record.date}</p>
                      <p className="text-xs text-muted-foreground">{record.gym}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{record.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                출석 기록이 없습니다.
              </p>
            )}
            <Button variant="ghost" className="w-full mt-4 text-sm">
              전체 기록 보기
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Attendance;
