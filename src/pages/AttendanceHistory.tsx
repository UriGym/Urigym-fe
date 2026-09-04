import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { attendanceApi } from "@/api/attendance";
import type { AttendanceResponse } from "@/api/types";

const PAGE_SIZE = 20;

const METHOD_LABELS: Record<string, string> = {
  PHONE: "전화번호",
  QR: "QR",
  FACE: "얼굴인식",
  NFC: "NFC",
};

const AttendanceHistory = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<AttendanceResponse[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const load = useCallback(async (pageToLoad: number) => {
    const result = await attendanceApi.getMyAttendances(pageToLoad, PAGE_SIZE);
    setRecords((prev) => (pageToLoad === 0 ? result?.content ?? [] : [...prev, ...(result?.content ?? [])]));
    setHasMore(result ? !result.last : false);
    setPage(pageToLoad);
  }, []);

  useEffect(() => {
    load(0).finally(() => setIsLoading(false));
  }, [load]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      await load(page + 1);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const groups = groupByDate(records);

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate("/mypage")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">총 출석 기록</h1>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-lg mx-auto space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : records.length === 0 ? (
          <div className="gym-card p-8 text-center space-y-3">
            <Calendar className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">아직 출석 기록이 없습니다.</p>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              체육관 둘러보기
            </Button>
          </div>
        ) : (
          <>
            {groups.map(({ dateLabel, items }) => (
              <div key={dateLabel}>
                <p className="text-sm font-semibold text-muted-foreground mb-2 px-1">{dateLabel}</p>
                <div className="gym-card divide-y divide-border">
                  {items.map((record) => {
                    const time = new Date(record.checkInTime);
                    return (
                      <div key={record.id} className="flex items-center gap-3 p-4">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{record.gymName}</p>
                          <p className="text-xs text-muted-foreground">
                            {METHOD_LABELS[record.checkInMethod] ?? record.checkInMethod} 출석
                          </p>
                        </div>
                        <span className="text-sm text-muted-foreground shrink-0">
                          {time.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {hasMore && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                더 보기
              </Button>
            )}
          </>
        )}
      </main>
    </div>
  );
};

function groupByDate(records: AttendanceResponse[]): { dateLabel: string; items: AttendanceResponse[] }[] {
  const groups = new Map<string, AttendanceResponse[]>();

  for (const record of records) {
    const date = new Date(record.checkInTime);
    const key = date.toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(record);
  }

  return [...groups.entries()].map(([key, items]) => ({
    dateLabel: new Date(key).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    }),
    items,
  }));
}

export default AttendanceHistory;
