import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Clock, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import { ownerApplicationsApi } from "@/api/misc";
import { useAuth } from "@/contexts/AuthContext";
import type { OwnerApplicationResponse } from "@/api/types";

const STATUS_META = {
  PENDING: { label: "심사 대기", icon: Clock, className: "bg-yellow-500/10 text-yellow-600" },
  APPROVED: { label: "승인 완료", icon: CheckCircle2, className: "bg-green-500/10 text-green-600" },
  REJECTED: { label: "반려", icon: XCircle, className: "bg-destructive/10 text-destructive" },
} as const;

const OwnerApplication = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [application, setApplication] = useState<OwnerApplicationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    businessRegImageUrl: "",
    licenseImageUrl: "",
    businessNumber: "",
  });

  useEffect(() => {
    ownerApplicationsApi
      .getMine()
      .then((data) => setApplication(data ?? null))
      .catch(() => setApplication(null))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.businessRegImageUrl || !form.businessNumber) {
      toast.error("사업자등록증과 사업자등록번호를 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await ownerApplicationsApi.apply({
        businessRegImageUrl: form.businessRegImageUrl,
        licenseImageUrl: form.licenseImageUrl || undefined,
        businessNumber: form.businessNumber,
      });
      setApplication(created ?? null);
      toast.success("신청이 접수되었습니다. 관리자 확인 후 승인됩니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "신청에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const canApply = user?.role === "USER" && application?.status !== "PENDING";

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate("/mypage")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">관장 등록 신청</h1>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-lg mx-auto space-y-5">
        {user?.role === "OWNER" && (
          <div className="gym-card p-5 text-center">
            <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-green-500" />
            <p className="font-semibold mb-1">이미 관장 권한을 보유하고 있습니다.</p>
            <Button variant="gradient" className="mt-3" onClick={() => navigate("/owner")}>
              관장 대시보드로 이동
            </Button>
          </div>
        )}

        {application && <ApplicationStatusCard application={application} />}

        {canApply && (
          <form onSubmit={handleSubmit} className="gym-card p-5 space-y-5">
            <div>
              <h2 className="font-semibold mb-1">서류 제출</h2>
              <p className="text-sm text-muted-foreground">
                제출한 서류는 관리자가 직접 확인한 뒤 승인합니다. 자동 승인되지 않습니다.
              </p>
            </div>

            <ImageUploadField
              label="사업자등록증"
              description="체육관 사업자등록증 사본을 업로드해주세요."
              value={form.businessRegImageUrl}
              onChange={(url) => setForm((prev) => ({ ...prev, businessRegImageUrl: url }))}
              required
            />

            <ImageUploadField
              label="관장 자격증"
              description="지도자 자격증 등 관장 자격을 증명하는 서류입니다."
              value={form.licenseImageUrl}
              onChange={(url) => setForm((prev) => ({ ...prev, licenseImageUrl: url }))}
            />

            <div className="space-y-2">
              <Label htmlFor="businessNumber">
                사업자등록번호
                <span className="text-red-500"> *</span>
              </Label>
              <Input
                id="businessNumber"
                placeholder="123-45-67890"
                value={form.businessNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, businessNumber: e.target.value }))}
              />
            </div>

            <Button type="submit" variant="gradient" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              신청하기
            </Button>
          </form>
        )}
      </main>
    </div>
  );
};

const ApplicationStatusCard = ({ application }: { application: OwnerApplicationResponse }) => {
  const meta = STATUS_META[application.status];
  const Icon = meta.icon;

  return (
    <div className="gym-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">신청 현황</h2>
        <Badge variant="secondary" className={meta.className}>
          <Icon className="w-3.5 h-3.5 mr-1" />
          {meta.label}
        </Badge>
      </div>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">신청일</dt>
          <dd>{new Date(application.createdAt).toLocaleDateString("ko-KR")}</dd>
        </div>
        {application.reviewedAt && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">처리일</dt>
            <dd>{new Date(application.reviewedAt).toLocaleDateString("ko-KR")}</dd>
          </div>
        )}
        {application.adminNote && (
          <div className="pt-2 border-t border-border">
            <dt className="text-muted-foreground mb-1">관리자 메모</dt>
            <dd>{application.adminNote}</dd>
          </div>
        )}
      </dl>
    </div>
  );
};

export default OwnerApplication;
