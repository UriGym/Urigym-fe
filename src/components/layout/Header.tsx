import { LogIn, LogOut, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { NotificationBell } from "@/components/layout/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  title?: string;
  showLocation?: boolean;
  /** Label shown next to the title, e.g. the district of the current location. */
  locationLabel?: string;
}

export const Header = ({ title = "우리짐", showLocation = true, locationLabel }: HeaderProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <h1
            className="text-xl font-bold text-gradient cursor-pointer"
            onClick={() => navigate('/')}
          >
            {title}
          </h1>
          {showLocation && locationLabel && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse-soft" />
              <span>{locationLabel}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.fullName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{user?.fullName || '사용자'}</p>
                    <p className="text-muted-foreground text-xs">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/mypage')}>
                    <User className="mr-2 h-4 w-4" />
                    마이페이지
                  </DropdownMenuItem>
                  {user?.role === 'OWNER' && (
                    <DropdownMenuItem onClick={() => navigate('/owner')}>
                      <Shield className="mr-2 h-4 w-4" />
                      관장 대시보드
                    </DropdownMenuItem>
                  )}
                  {user?.role === 'ADMIN' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      관리자 페이지
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              <LogIn className="w-4 h-4 mr-2" />
              로그인
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
