import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { reportsApi } from "@/api/misc";
import { gymsApi } from "@/api/gyms";
import type { ReportCategory, ReportResponse } from "@/api/types";

const CATEGORY_LABELS: Record<ReportCategory, string> = {
  PRICE_MISMATCH: "등록 금액과 다름",
  FACILITY: "시설 문제",
  STAFF: "직원 / 응대 문제",
  OTHER: "기타 신고",
  INQUIRY: "일반 문의",
};

const STATUS_LABELS = {
  OPEN: { label: "접수", className: "bg-yellow-500/10 text-yellow-600" },
  RESOLVED: { label: "처리 완료", className: "bg-green-500/10 text-green-600" },
  REJECTED: { label: "반려", className: "bg-muted text-muted-foreground" },
} as const;

const Support = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gymId = searchParams.get("gymId") ?? undefined;
  const planName = searchParams.get("planName") ?? undefined;
  const planPrice = searchParams.get("planPrice") ?? undefined;

  const [gymName, setGymName] = useState<string | null>(null);
  const [myReports, setMyReports] = useState<ReportResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<{ category: ReportCategory; title: string; content: string }>(
    planName
      ? {
          category: "INQUIRY",
          title: `'${planName}' 회원권 문의`,
          content: `'${planName}' 회원권${
            planPrice ? `(${Number(planPrice).toLocaleString()}원)` : ""
          }에 대해 문의드립니다.\n\n`,
        }
      : { category: gymId ? "PRICE_MISMATCH" : "INQUIRY", title: "", content: "" }
  );

  useEffect(() => {
    if (gymId) {
      gymsApi
        .getById(gymId)
        .then((gym) => setGymName(gym?.name ?? null))
        .catch(() => setGymName(null));
    }
  }, [gymId]);

  const loadMyReports = () => {
    reportsApi
      .getMine(0, 20)
      .then((page) => setMyReports(page?.content ?? []))
      .catch(() => setMyReports([]));
  };

  useEffect(loadMyReports, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await reportsApi.create({
        gymId: form.category === "INQUIRY" ? undefined : gymId,
        category: form.category,
        title: form.title,
        content: form.content,
      });
      toast.success("접수되었습니다. 관리자가 확인 후 처리합니다.");
      setForm({ category: form.category, title: "", content: "" });
      loadMyReports();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "접수에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">고객센터</h1>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-lg mx-auto">
        <Tabs defaultValue="new">
          <TabsList className="w-full grid grid-cols-2 bg-secondary/50">
            <TabsTrigger value="new">문의 / 신고하기</TabsTrigger>
            <TabsTrigger value="history">내 내역</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="mt-4">
            <form onSubmit={handleSubmit} className="gym-card p-5 space-y-4">
              {gymName && (
                <div className="p-3 rounded-lg bg-secondary/50 text-sm space-y-0.5">
                  <p>
                    대상 체육관: <span className="font-medium">{gymName}</span>
                  </p>
                  {planName && (
                    <p>
                      회원권: <span className="font-medium">{planName}</span>
                      {planPrice && ` (${Number(planPrice).toLocaleString()}원)`}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>유형</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, category: value as ReportCategory }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CATEGORY_LABELS) as ReportCategory[])
                      .filter((category) => (gymId ? true : category === "INQUIRY"))
                      .map((category) => (
                        <SelectItem key={category} value={category}>
                          {CATEGORY_LABELS[category]}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {!gymId && (
                  <p className="text-xs text-muted-foreground">
                    특정 체육관을 신고하려면 체육관 상세 화면의 신고 버튼을 이용해주세요.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  required
                  placeholder="제목을 입력해주세요"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  required
                  rows={6}
                  placeholder="자세한 내용을 입력해주세요. 가격 신고의 경우 앱에 표시된 금액과 실제 금액을 함께 적어주세요."
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                />
              </div>

              <Button type="submit" variant="gradient" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                접수하기
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-3">
            {myReports.length === 0 ? (
              <div className="gym-card p-8 text-center text-sm text-muted-foreground">
                접수한 내역이 없습니다.
              </div>
            ) : (
              myReports.map((report) => {
                const status = STATUS_LABELS[report.status];
                return (
                  <div key={report.id} className="gym-card p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{report.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {CATEGORY_LABELS[report.category]}
                          {report.gymName ? ` · ${report.gymName}` : ""}
                        </p>
                      </div>
                      <Badge variant="secondary" className={status.className}>{status.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{report.content}</p>
                    {report.adminNote && (
                      <p className="mt-2 pt-2 border-t border-border text-sm">
                        <span className="text-muted-foreground">답변: </span>
                        {report.adminNote}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(report.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Support;
