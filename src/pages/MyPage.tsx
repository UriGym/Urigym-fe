import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { attendanceApi } from "@/api/attendance";
import { membershipsApi } from "@/api/misc";
import {
  User,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  LogIn,
  ChevronRight,
  Calendar,
  FileText,
  Shield,
  Building2,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ROLE_LABELS = {
  ADMIN: "관리자",
  OWNER: "관장",
  USER: "일반회원",
} as const;

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path?: string;
  highlight?: boolean;
}

const MyPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [stats, setStats] = useState({ gyms: 0, attendances: 0 });

  useEffect(() => {
    if (!isAuthenticated) return;

    Promise.all([membershipsApi.getMyGyms(), attendanceApi.getTotalCount()])
      .then(([gyms, count]) => setStats({ gyms: gyms?.length ?? 0, attendances: count ?? 0 }))
      .catch(() => setStats({ gyms: 0, attendances: 0 }));
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const roleSection: MenuItem[] = [];
  if (user?.role === "OWNER") {
    roleSection.push({ icon: Building2, label: "관장 대시보드", path: "/owner", highlight: true });
  }
  if (user?.role === "ADMIN") {
    roleSection.push({ icon: ShieldCheck, label: "관리자 페이지", path: "/admin", highlight: true });
  }
  if (user?.role === "USER") {
    roleSection.push({
      icon: Shield,
      label: "관장 등록 신청",
      path: "/owner-application",
      highlight: true,
    });
  }

  const menuSections: { section: string; items: MenuItem[] }[] = [
    ...(roleSection.length > 0 ? [{ section: "권한", items: roleSection }] : []),
    {
      section: "내 체육관",
      items: [{ icon: Calendar, label: "출석 기록", path: "/attendance" }],
    },
    {
      section: "기타",
      items: [
        { icon: HelpCircle, label: "고객센터 / 문의하기", path: "/support" },
        { icon: FileText, label: "내 신고·문의 내역", path: "/support" },
        { icon: Bell, label: "알림 설정", path: "/mypage/notifications" },
        { icon: Settings, label: "계정 설정", path: "/mypage/account" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="마이페이지" showLocation={false} />

      <main className="pt-20 px-4 space-y-6">
        <div className="gym-card p-5 animate-fade-in">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold truncate">{user.fullName || "사용자"}</h2>
                    <Badge className="bg-primary/10 text-primary text-xs shrink-0">
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  {user.phone && (
                    <p className="text-xs text-muted-foreground truncate">{user.phone}</p>
                  )}
                </div>
              </div>

              {stats.gyms === 0 ? (
                <div className="mt-6 pt-6 border-t border-border text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    등록된 체육관이 없습니다. 운동하러 가기!
                  </p>
                  <Button variant="gradient" size="sm" onClick={() => navigate("/")}>
                    주변 체육관 둘러보기
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
                  <button
                    type="button"
                    onClick={() => navigate("/mypage/gyms")}
                    className="text-center rounded-lg -m-2 p-2 border-0 bg-transparent hover:bg-secondary/50 transition-colors"
                  >
                    <p className="text-2xl font-bold text-primary">{stats.gyms}</p>
                    <p className="text-xs text-muted-foreground">등록 체육관</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/mypage/attendance")}
                    className="text-center rounded-lg -m-2 p-2 border-0 bg-transparent hover:bg-secondary/50 transition-colors"
                  >
                    <p className="text-2xl font-bold text-primary">{stats.attendances}</p>
                    <p className="text-xs text-muted-foreground">총 출석</p>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center py-6">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">로그인이 필요합니다</p>
              <Button onClick={() => navigate("/login")} className="gap-2">
                <LogIn className="w-4 h-4" />
                로그인하기
              </Button>
            </div>
          )}
        </div>

        {isAuthenticated &&
          menuSections.map((section, sectionIndex) => (
            <div
              key={section.section}
              className="animate-slide-up"
              style={{ animationDelay: `${0.1 + sectionIndex * 0.05}s` }}
            >
              <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">
                {section.section}
              </h3>
              <div className="gym-card overflow-hidden">
                {section.items.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={() => item.path && navigate(item.path)}
                    disabled={!item.path}
                    className={`flex items-center gap-3 w-full p-4 hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      index < section.items.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${
                        item.highlight ? "text-accent" : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`flex-1 text-left ${
                        item.highlight ? "text-accent font-medium" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          ))}

        {isAuthenticated && (
          <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Button
              variant="ghost"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              로그아웃
            </Button>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground pb-4">우리짐 v1.0.0</p>
      </main>

      <BottomNav />
    </div>
  );
};

export default MyPage;
