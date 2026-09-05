import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  const toggle = async (field: "notifyAnnouncements" | "notifyMessages", value: boolean) => {
    try {
      await updateProfile({ [field]: value });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "변경에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate("/mypage")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">알림 설정</h1>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-lg mx-auto space-y-3">
        <div className="gym-card divide-y divide-border">
          <div className="flex items-center justify-between p-4">
            <div>
              <Label htmlFor="notify-announcements" className="font-medium">
                체육관 공지
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                등록된 체육관의 공지사항 알림을 받습니다.
              </p>
            </div>
            <Switch
              id="notify-announcements"
              checked={user?.notifyAnnouncements ?? true}
              onCheckedChange={(checked) => toggle("notifyAnnouncements", checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4">
            <div>
              <Label htmlFor="notify-messages" className="font-medium">
                단체 메시지
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                관장이 보내는 단체 메시지 알림을 받습니다.
              </p>
            </div>
            <Switch
              id="notify-messages"
              checked={user?.notifyMessages ?? true}
              onCheckedChange={(checked) => toggle("notifyMessages", checked)}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground px-1">
          가입 승인 등 계정과 관련된 중요 알림은 항상 발송되며 끌 수 없습니다.
        </p>
      </main>
    </div>
  );
};

export default NotificationSettings;
