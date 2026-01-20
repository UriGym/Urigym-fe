import { Home, Search, MapPin, User, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "홈", path: "/" },
  { icon: Search, label: "검색", path: "/search" },
  { icon: MapPin, label: "출석", path: "/attendance" },
  { icon: User, label: "마이", path: "/mypage" },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 safe-area-pb">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "bottom-nav-item flex-1",
                isActive && "active"
              )}
            >
              <item.icon 
                className={cn(
                  "w-6 h-6 transition-all duration-200",
                  isActive && "scale-110"
                )} 
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
