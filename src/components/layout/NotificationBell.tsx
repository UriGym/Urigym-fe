import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notificationsApi } from "@/api/misc";
import { cn } from "@/lib/utils";
import type { NotificationResponse } from "@/api/types";

export const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const refreshUnreadCount = useCallback(async () => {
    try {
      setUnreadCount((await notificationsApi.unreadCount()) ?? 0);
    } catch {
      // A failed badge refresh shouldn't disrupt the page.
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  const loadNotifications = async (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) return;
    setIsLoading(true);
    try {
      const page = await notificationsApi.list(0, 10);
      setNotifications(page?.content ?? []);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = (notification: NotificationResponse) => {
    setOpen(false);
    if (notification.type === "MESSAGE" && notification.relatedRoomId) {
      navigate(`/chat/${notification.relatedRoomId}`);
    }
    // 관원 등록 초대 알림(SYSTEM 타입 중 이 제목만 해당 — GymMemberService.addMember에서 고정
    // 발송)만 /mypage/gyms로 보낸다. 같은 SYSTEM+relatedGymId 조합을 쓰는 다른 알림(관장에게
    // 가는 "초대를 수락/거절했습니다", "새 등록 신청이 있습니다" 등)은 관원용 수락 화면과
    // 무관하므로 제목으로 정확히 구분한다.
    if (notification.type === "SYSTEM" && notification.title === "체육관 등록 초대가 도착했습니다.") {
      navigate("/mypage/gyms");
    }
    if (!notification.isRead) {
      // Fire-and-forget: navigation shouldn't wait on this round-trip. Failure leaves
      // the notification unread, which is safe — it can just be retried later.
      notificationsApi
        .markAsRead(notification.id)
        .then(() => {
          setNotifications((prev) =>
            prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
          );
          setUnreadCount((count) => Math.max(0, count - 1));
        })
        .catch(() => {
          // Ignore — the notification stays unread and can be retried.
        });
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={loadNotifications}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="알림">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-accent text-[10px] font-bold text-accent-foreground flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="px-3 py-2 border-b border-border">
          <p className="font-semibold text-sm">알림</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">알림이 없습니다.</p>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={cn(
                "w-full text-left px-3 py-2.5 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors",
                !notification.isRead && "bg-primary/5"
              )}
            >
              <div className="flex items-start gap-2">
                {!notification.isRead && (
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                )}
                <div className={cn("flex-1 min-w-0", notification.isRead && "pl-3.5")}>
                  <p className="text-sm font-medium truncate">{notification.title}</p>
                  {notification.body && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{notification.body}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleString("ko-KR", {
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
