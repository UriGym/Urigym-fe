import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Loader2,
  Trash2,
  Pencil,
  ShieldCheck,
  Ban,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { adminApi } from "@/api/admin";
import { apiClient } from "@/api/client";
import type {
  GymResponse,
  OwnerApplicationResponse,
  ReportResponse,
  UserResponse,
} from "@/api/types";

const ROLE_LABELS = {
  USER: { label: "일반회원", className: "bg-secondary text-secondary-foreground" },
  OWNER: { label: "관장", className: "bg-primary/10 text-primary" },
  ADMIN: { label: "관리자", className: "bg-accent/10 text-accent" },
} as const;

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate("/mypage")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <ShieldCheck className="w-5 h-5 text-accent" />
          <h1 className="text-lg font-bold">관리자 페이지</h1>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-4xl mx-auto">
        <Tabs defaultValue="users">
          <TabsList className="w-full grid grid-cols-4 bg-secondary/50">
            <TabsTrigger value="users">사용자</TabsTrigger>
            <TabsTrigger value="applications">관장 승인</TabsTrigger>
            <TabsTrigger value="reports">신고/문의</TabsTrigger>
            <TabsTrigger value="gyms">체육관</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            <UsersTab />
          </TabsContent>
          <TabsContent value="applications" className="mt-4">
            <ApplicationsTab />
          </TabsContent>
          <TabsContent value="reports" className="mt-4">
            <ReportsTab />
          </TabsContent>
          <TabsContent value="gyms" className="mt-4">
            <GymsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// --- Users ---

const UsersTab = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<UserResponse | null>(null);
  const [deleting, setDeleting] = useState<UserResponse | null>(null);
  const [form, setForm] = useState({ fullName: "", phone: "", address: "" });

  const load = useCallback(async (search: string) => {
    setIsLoading(true);
    try {
      const page = await adminApi.getUsers(search, 0, 50);
      setUsers(page?.content ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(keyword), 300);
    return () => clearTimeout(timer);
  }, [keyword, load]);

  const openEdit = (user: UserResponse) => {
    setEditing(user);
    setForm({
      fullName: user.fullName ?? "",
      phone: user.phone ?? "",
      address: user.address ?? "",
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      await adminApi.updateUser(editing.id, form);
      toast.success("수정되었습니다.");
      setEditing(null);
      load(keyword);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "수정에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await adminApi.deleteUser(deleting.id);
      toast.success("삭제되었습니다.");
      setDeleting(null);
      load(keyword);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "삭제에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="이메일, 이름, 전화번호로 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <LoadingBlock />
      ) : users.length === 0 ? (
        <EmptyBlock message="사용자가 없습니다." />
      ) : (
        <div className="gym-card divide-y divide-border">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-medium">
                  {user.fullName?.[0] ?? user.email[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{user.fullName || "이름 없음"}</p>
                  <Badge variant="secondary" className={ROLE_LABELS[user.role].className}>
                    {ROLE_LABELS[user.role].label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.phone || "전화번호 없음"} · {user.address || "주소 없음"}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openEdit(user)} aria-label="수정">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleting(user)}
                  aria-label="삭제"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 수정</DialogTitle>
            <DialogDescription>
              이름, 전화번호, 주소만 수정할 수 있습니다. 이메일과 비밀번호는 변경할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>이메일 (변경 불가)</Label>
              <Input value={editing?.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">이름</Label>
              <Input
                id="edit-name"
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">전화번호</Label>
              <Input
                id="edit-phone"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">주소</Label>
              <Input
                id="edit-address"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              취소
            </Button>
            <Button variant="gradient" onClick={handleSave}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>사용자를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.email} 계정이 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// --- Owner applications ---

const ApplicationsTab = () => {
  const [applications, setApplications] = useState<OwnerApplicationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewing, setReviewing] = useState<OwnerApplicationResponse | null>(null);
  const [approve, setApprove] = useState(true);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const page = await adminApi.getOwnerApplications("PENDING", 0, 50);
      setApplications(page?.content ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submitReview = async () => {
    if (!reviewing) return;
    try {
      await adminApi.reviewOwnerApplication(reviewing.id, approve, note || undefined);
      toast.success(approve ? "관장 권한이 부여되었습니다." : "신청이 반려되었습니다.");
      setReviewing(null);
      setNote("");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "처리에 실패했습니다.");
    }
  };

  if (isLoading) return <LoadingBlock />;
  if (applications.length === 0) return <EmptyBlock message="대기 중인 관장 신청이 없습니다." />;

  return (
    <div className="space-y-3">
      {applications.map((application) => (
        <div key={application.id} className="gym-card p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <p className="font-medium">{application.userName || "이름 없음"}</p>
              <p className="text-xs text-muted-foreground truncate">{application.userEmail}</p>
              <p className="text-xs text-muted-foreground">
                {application.userPhone || "전화번호 없음"}
                {application.businessNumber ? ` · 사업자번호 ${application.businessNumber}` : ""}
              </p>
            </div>
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 shrink-0">
              심사 대기
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <DocumentPreview label="사업자등록증" url={application.businessRegImageUrl} />
            <DocumentPreview label="관장 자격증" url={application.licenseImageUrl} />
          </div>

          <div className="flex gap-2">
            <Button
              variant="gradient"
              className="flex-1"
              onClick={() => {
                setReviewing(application);
                setApprove(true);
                setNote("서류 확인 완료");
              }}
            >
              승인
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setReviewing(application);
                setApprove(false);
                setNote("");
              }}
            >
              반려
            </Button>
          </div>
        </div>
      ))}

      <Dialog open={!!reviewing} onOpenChange={(open) => !open && setReviewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{approve ? "관장 승인" : "신청 반려"}</DialogTitle>
            <DialogDescription>
              {approve
                ? `${reviewing?.userName ?? reviewing?.userEmail} 님에게 관장 권한을 부여합니다.`
                : "반려 사유를 남기면 신청자에게 알림으로 전달됩니다."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="admin-note">관리자 메모</Label>
            <Textarea
              id="admin-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={approve ? "서류 확인 완료" : "예: 자격증 사본이 흐릿하여 확인이 어렵습니다."}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewing(null)}>
              취소
            </Button>
            <Button variant={approve ? "gradient" : "destructive"} onClick={submitReview}>
              {approve ? "승인하기" : "반려하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const DocumentPreview = ({ label, url }: { label: string; url: string }) => (
  <a
    href={apiClient.fileUrl(url)}
    target="_blank"
    rel="noreferrer"
    className="block rounded-lg border border-border overflow-hidden hover:border-primary transition-colors"
  >
    <img
      src={apiClient.fileUrl(url)}
      alt={label}
      className="w-full h-24 object-cover bg-muted"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
    <p className="text-xs px-2 py-1.5 flex items-center gap-1">
      {label}
      <ExternalLink className="w-3 h-3 text-muted-foreground" />
    </p>
  </a>
);

// --- Reports ---

const ReportsTab = () => {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suspending, setSuspending] = useState<ReportResponse | null>(null);
  const [days, setDays] = useState(3);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const page = await adminApi.getReports(undefined, 0, 50);
      setReports(page?.content ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (report: ReportResponse, status: "RESOLVED" | "REJECTED") => {
    try {
      await adminApi.updateReportStatus(report.id, status);
      toast.success("처리되었습니다.");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "처리에 실패했습니다.");
    }
  };

  const handleSuspend = async () => {
    if (!suspending?.gymId) return;
    try {
      await adminApi.suspendGym(suspending.gymId, days);
      await adminApi.updateReportStatus(suspending.id, "RESOLVED", `${days}일 노출 정지 처리`);
      toast.success(`${days}일간 노출이 정지되었습니다.`);
      setSuspending(null);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "정지 처리에 실패했습니다.");
    }
  };

  if (isLoading) return <LoadingBlock />;
  if (reports.length === 0) return <EmptyBlock message="접수된 신고나 문의가 없습니다." />;

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div key={report.id} className="gym-card p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <p className="font-medium truncate">{report.title}</p>
              <p className="text-xs text-muted-foreground">
                {report.reporterName || "익명"}
                {report.gymName ? ` · ${report.gymName}` : ""} ·{" "}
                {new Date(report.createdAt).toLocaleDateString("ko-KR")}
              </p>
            </div>
            <Badge
              className={
                report.status === "OPEN"
                  ? "bg-yellow-500/10 text-yellow-600 shrink-0"
                  : "bg-secondary text-secondary-foreground shrink-0"
              }
            >
              {report.status === "OPEN" ? "접수" : report.status === "RESOLVED" ? "완료" : "반려"}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-3">{report.content}</p>

          {report.status === "OPEN" && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => updateStatus(report, "RESOLVED")}>
                처리 완료
              </Button>
              <Button size="sm" variant="ghost" onClick={() => updateStatus(report, "REJECTED")}>
                반려
              </Button>
              {report.gymId && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setSuspending(report);
                    setDays(3);
                  }}
                >
                  <Ban className="w-4 h-4 mr-1" />
                  체육관 정지
                </Button>
              )}
            </div>
          )}
        </div>
      ))}

      <Dialog open={!!suspending} onOpenChange={(open) => !open && setSuspending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>체육관 노출 정지</DialogTitle>
            <DialogDescription>
              {suspending?.gymName} 을(를) 지정한 기간 동안 목록과 지도에서 숨깁니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="suspend-days">정지 기간 (일)</Label>
            <Input
              id="suspend-days"
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspending(null)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleSuspend}>
              {days}일 정지
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Gyms ---

const GymsTab = () => {
  const [gyms, setGyms] = useState<GymResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const page = await adminApi.getAllGyms(0, 50);
      setGyms(page?.content ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unsuspend = async (gym: GymResponse) => {
    try {
      await adminApi.unsuspendGym(gym.id);
      toast.success("정지가 해제되었습니다.");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "해제에 실패했습니다.");
    }
  };

  const suspend = async (gym: GymResponse) => {
    try {
      await adminApi.suspendGym(gym.id, 3);
      toast.success("3일간 노출이 정지되었습니다.");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "정지에 실패했습니다.");
    }
  };

  if (isLoading) return <LoadingBlock />;
  if (gyms.length === 0) return <EmptyBlock message="등록된 체육관이 없습니다." />;

  return (
    <div className="gym-card divide-y divide-border">
      {gyms.map((gym) => {
        const suspended = gym.suspendedUntil && new Date(gym.suspendedUntil) > new Date();
        return (
          <div key={gym.id} className="flex items-center gap-3 p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{gym.name}</p>
                {suspended && <Badge variant="destructive">정지중</Badge>}
              </div>
              <p className="text-xs text-muted-foreground truncate">{gym.address}</p>
              <p className="text-xs text-muted-foreground">
                평점 {gym.rating.toFixed(1)} · 리뷰 {gym.reviewCount} · 신고 {gym.reportCount}건
                {suspended &&
                  ` · ${new Date(gym.suspendedUntil as string).toLocaleDateString("ko-KR")}까지`}
              </p>
            </div>
            {suspended ? (
              <Button size="sm" variant="outline" onClick={() => unsuspend(gym)}>
                해제
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => suspend(gym)}>
                <Ban className="w-4 h-4 mr-1" />
                3일 정지
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};

const LoadingBlock = () => (
  <div className="flex justify-center py-16">
    <Loader2 className="w-7 h-7 animate-spin text-primary" />
  </div>
);

const EmptyBlock = ({ message }: { message: string }) => (
  <div className="gym-card p-10 text-center text-sm text-muted-foreground">{message}</div>
);

export default AdminDashboard;
