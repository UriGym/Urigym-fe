import { useState } from "react";
import { Smartphone, Scan, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AttendanceCardProps {
  gymName: string;
  isSubmitting?: boolean;
  onCheckIn: (phoneNumber: string) => Promise<boolean>;
}

export const AttendanceCard = ({ gymName, isSubmitting = false, onCheckIn }: AttendanceCardProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const handleCheckIn = async () => {
    const succeeded = await onCheckIn(phoneNumber);
    if (!succeeded) return;

    setIsCheckedIn(true);
    setPhoneNumber("");
    setTimeout(() => setIsCheckedIn(false), 3000);
  };

  /*
   * Face recognition and NFC are on hold. The buttons stay visible so the flow is
   * discoverable, but they only explain the status — the real calls would go through
   * attendanceApi.checkIn with checkInMethod "FACE" / "NFC", which the backend
   * currently answers with 501 until the hardware integration is decided.
   */
  const notifyOnHold = (method: string) => {
    toast.info(`${method} 출석은 준비 중입니다. 전화번호로 출석해주세요.`);
  };

  if (isCheckedIn) {
    return (
      <div className="gym-card p-8 text-center animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 animate-bounce-soft" />
        </div>
        <h3 className="text-xl font-bold mb-2">출석 완료!</h3>
        <p className="text-muted-foreground">{gymName}에 출석하셨습니다</p>
        <p className="text-sm text-muted-foreground mt-2">
          {new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    );
  }

  return (
    <div className="gym-card p-6 animate-fade-in">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-1">출석 체크</h3>
        <p className="text-sm text-muted-foreground">{gymName}</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="tel"
            inputMode="numeric"
            placeholder="010-0000-0000"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && phoneNumber.length >= 12 && handleCheckIn()}
            className="gym-input text-center text-lg tracking-wider"
            maxLength={13}
            aria-label="등록된 전화번호"
          />
          <Button
            variant="gradient"
            onClick={handleCheckIn}
            disabled={phoneNumber.length < 12 || isSubmitting}
            className="shrink-0"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "출석"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          가입 시 등록한 전화번호를 입력해주세요.
        </p>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">또는</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 relative"
            onClick={() => notifyOnHold("NFC")}
          >
            <Smartphone className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">NFC 태그</span>
            <span className="absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
              준비중
            </span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 relative"
            onClick={() => notifyOnHold("얼굴 인식")}
          >
            <Scan className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">얼굴 인식</span>
            <span className="absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
              준비중
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}
