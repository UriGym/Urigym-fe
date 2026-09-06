import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { authApi } from "@/api/auth";
import { AddressSearchField } from "@/components/common/AddressSearchField";
import { useAuth } from "@/contexts/AuthContext";

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user, updateProfile, refreshUser } = useAuth();

  const [profile, setProfile] = useState({
    fullName: user?.fullName ?? "",
    address: user?.address ?? "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [phone, setPhone] = useState(user?.phone ?? "");
  const [phoneVerified, setPhoneVerified] = useState(user?.phoneVerified ?? false);
  const [phoneStep, setPhoneStep] = useState<"idle" | "code-sent">("idle");
  const [phoneCode, setPhoneCode] = useState("");
  const [isPhoneBusy, setIsPhoneBusy] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile(profile);
      toast.success("프로필이 수정되었습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "수정에 실패했습니다.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSendCode = async () => {
    if (!phone) {
      toast.error("전화번호를 입력해주세요.");
      return;
    }
    setIsPhoneBusy(true);
    try {
      await authApi.sendPhoneCode(phone);
      setPhoneStep("code-sent");
      toast.success("인증번호를 발송했습니다. (개발 중: 서버 콘솔 로그에서 확인)");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "발송에 실패했습니다.");
    } finally {
      setIsPhoneBusy(false);
    }
  };

  const handleConfirmCode = async () => {
    setIsPhoneBusy(true);
    try {
      const updated = await authApi.confirmPhoneCode(phone, phoneCode);
      setPhoneVerified(true);
      setPhoneStep("idle");
      setPhoneCode("");
      if (updated) toast.success("전화번호 인증이 완료되었습니다.");
      await refreshUser();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "인증에 실패했습니다.");
    } finally {
      setIsPhoneBusy(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.next !== password.confirm) {
      toast.error("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsSavingPassword(true);
    try {
      await authApi.changePassword({ currentPassword: password.current, newPassword: password.next });
      toast.success("비밀번호가 변경되었습니다.");
      setPassword({ current: "", next: "", confirm: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "변경에 실패했습니다.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate("/mypage")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">계정 설정</h1>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-lg mx-auto space-y-5">
        <form onSubmit={handleProfileSubmit} className="gym-card p-5 space-y-4">
          <h2 className="font-semibold">프로필</h2>

          <div className="space-y-2">
            <Label>이메일</Label>
            <Input value={user?.email ?? ""} disabled />
            <p className="text-xs text-muted-foreground">이메일은 변경할 수 없습니다.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">이름</Label>
            <Input
              id="fullName"
              value={profile.fullName}
              onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
            />
          </div>

          <AddressSearchField
            value={profile.address}
            onPicked={(result) => setProfile((p) => ({ ...p, address: result.address }))}
          />

          <Button type="submit" variant="gradient" className="w-full" disabled={isSavingProfile}>
            {isSavingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            저장
          </Button>
        </form>

        <div className="gym-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">전화번호</h2>
            {phoneVerified && (
              <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                인증됨
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            체육관 전화번호 출석 체크에 사용되는 번호입니다. 번호를 바꾸면 다시 인증해야 합니다.
          </p>

          <div className="flex gap-2">
            <Input
              type="tel"
              value={phone}
              disabled={phoneStep === "code-sent"}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneVerified(false);
              }}
              placeholder="010-0000-0000"
              className="flex-1"
            />
            {phoneStep === "idle" ? (
              <Button type="button" variant="outline" onClick={handleSendCode} disabled={isPhoneBusy}>
                {isPhoneBusy && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                인증번호 받기
              </Button>
            ) : (
              <Button type="button" variant="ghost" onClick={() => setPhoneStep("idle")}>
                취소
              </Button>
            )}
          </div>

          {phoneStep === "code-sent" && (
            <div className="flex gap-2">
              <Input
                inputMode="numeric"
                maxLength={6}
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ""))}
                placeholder="인증번호 6자리"
                className="flex-1"
              />
              <Button
                type="button"
                variant="gradient"
                onClick={handleConfirmCode}
                disabled={isPhoneBusy || phoneCode.length !== 6}
              >
                {isPhoneBusy && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                확인
              </Button>
            </div>
          )}
        </div>

        {user?.hasPassword && (
          <form onSubmit={handlePasswordSubmit} className="gym-card p-5 space-y-4">
            <h2 className="font-semibold">비밀번호 변경</h2>

            <div className="space-y-2">
              <Label htmlFor="current-password">현재 비밀번호</Label>
              <Input
                id="current-password"
                type="password"
                required
                value={password.current}
                onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">새 비밀번호</Label>
              <Input
                id="new-password"
                type="password"
                required
                minLength={8}
                value={password.next}
                onChange={(e) => setPassword((p) => ({ ...p, next: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={password.confirm}
                onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))}
              />
            </div>

            <Button type="submit" variant="outline" className="w-full" disabled={isSavingPassword}>
              {isSavingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              비밀번호 변경
            </Button>
          </form>
        )}
      </main>
    </div>
  );
};

export default AccountSettings;
