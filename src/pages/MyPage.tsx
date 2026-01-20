import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Settings,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  LogIn,
  ChevronRight,
  Crown,
  Calendar,
  Heart,
  FileText,
  Shield
} from "lucide-react";

const MyPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      section: "내 체육관",
      items: [
        { icon: Calendar, label: "출석 기록", path: "/attendance" },
        { icon: Heart, label: "찜한 체육관" },
        { icon: FileText, label: "리뷰 관리" },
      ]
    },
    {
      section: "계정",
      items: [
        { icon: CreditCard, label: "결제 관리" },
        { icon: Bell, label: "알림 설정" },
        { icon: Settings, label: "계정 설정" },
      ]
    },
    {
      section: "기타",
      items: [
        { icon: HelpCircle, label: "고객센터" },
        { icon: Shield, label: "관장 등록 신청", highlight: true },
      ]
    },
  ];

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return '관리자';
      case 'OWNER':
        return '관장';
      default:
        return '일반회원';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="마이페이지" showLocation={false} />

      <main className="pt-20 px-4 space-y-6">
        {/* Profile Card */}
        <div className="gym-card p-5 animate-fade-in">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold">{user.fullName || '사용자'}</h2>
                    <Badge className="bg-primary/10 text-primary text-xs">
                      {getRoleBadge(user.role)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Button variant="outline" size="sm">
                  프로필 수정
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-xs text-muted-foreground">등록 체육관</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-xs text-muted-foreground">총 출석</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-xs text-muted-foreground">작성 리뷰</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-6">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">로그인이 필요합니다</p>
              <Button onClick={() => navigate('/login')} className="gap-2">
                <LogIn className="w-4 h-4" />
                로그인하기
              </Button>
            </div>
          )}
        </div>

        {/* Premium Banner */}
        <div
          className="gradient-warm rounded-xl p-4 cursor-pointer animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white/80 text-xs">프리미엄 멤버십</p>
              <p className="text-white font-medium">광고 없이 더 빠르게</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/80" />
          </div>
        </div>

        {/* Menu Lists */}
        {menuItems.map((section, sectionIndex) => (
          <div
            key={section.section}
            className="animate-slide-up"
            style={{ animationDelay: `${0.2 + sectionIndex * 0.1}s` }}
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">
              {section.section}
            </h3>
            <div className="gym-card overflow-hidden">
              {section.items.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => item.path && navigate(item.path)}
                  className={`flex items-center gap-3 w-full p-4 hover:bg-secondary/50 transition-colors ${
                    index < section.items.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${item.highlight ? "text-accent" : "text-muted-foreground"}`} />
                  <span className={`flex-1 text-left ${item.highlight ? "text-accent font-medium" : ""}`}>
                    {item.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout - only show when authenticated */}
        {isAuthenticated && (
          <div className="animate-slide-up" style={{ animationDelay: "0.5s" }}>
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

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          우리짐 v1.0.0
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default MyPage;
