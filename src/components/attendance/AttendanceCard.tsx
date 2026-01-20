import { Fingerprint, Smartphone, Scan, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AttendanceCardProps {
  gymName: string;
  onCheckIn?: (method: string, data?: string) => void;
}

export const AttendanceCard = ({ gymName, onCheckIn }: AttendanceCardProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInMethod, setCheckInMethod] = useState<string | null>(null);

  const handleCheckIn = (method: string) => {
    if (method === "phone" && !phoneNumber) return;
    
    setCheckInMethod(method);
    setIsCheckedIn(true);
    onCheckIn?.(method, method === "phone" ? phoneNumber : undefined);
    
    // Reset after animation
    setTimeout(() => {
      setIsCheckedIn(false);
      setCheckInMethod(null);
      setPhoneNumber("");
    }, 3000);
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
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
        {/* Phone Number Input */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="tel"
              placeholder="010-0000-0000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
              className="gym-input text-center text-lg tracking-wider"
              maxLength={13}
            />
            <Button
              variant="gradient"
              onClick={() => handleCheckIn("phone")}
              disabled={phoneNumber.length < 13}
              className="shrink-0"
            >
              출석
            </Button>
          </div>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">또는</span>
          </div>
        </div>

        {/* Quick Check-in Methods */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => handleCheckIn("nfc")}
          >
            <Smartphone className="w-6 h-6 text-primary" />
            <span className="text-sm">NFC 태그</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => handleCheckIn("face")}
          >
            <Scan className="w-6 h-6 text-primary" />
            <span className="text-sm">얼굴 인식</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
