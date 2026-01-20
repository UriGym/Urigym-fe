import { Star, MapPin, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface GymData {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  distance?: string;
  address: string;
  priceRange?: string;
  priceMin?: number;
  priceMax?: number;
  image?: string;
  imageUrl?: string;
  isOpen: boolean;
  memberCount?: number;
  tags?: string[];
}

interface GymCardProps {
  gym: GymData;
  onClick?: () => void;
  className?: string;
}

export const GymCard = ({ gym, onClick, className }: GymCardProps) => {
  const imageUrl = gym.image || gym.imageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop';
  const priceDisplay = gym.priceRange || (gym.priceMin ? `월 ${gym.priceMin.toLocaleString()}원` : '가격문의');

  return (
    <div
      className={cn("gym-card overflow-hidden cursor-pointer", className)}
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt={gym.name}
          className="w-full h-40 object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs font-medium",
              gym.isOpen 
                ? "bg-green-500/90 text-white" 
                : "bg-muted/90 text-muted-foreground"
            )}
          >
            {gym.isOpen ? "영업중" : "영업종료"}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="text-sm font-semibold">{gym.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{gym.category}</p>
            <h3 className="font-semibold text-lg">{gym.name}</h3>
          </div>
          <span className="text-sm font-medium text-primary">{gym.distance}</span>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{gym.address}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              리뷰 {gym.reviewCount}
            </span>
            {gym.memberCount && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                관원 {gym.memberCount}명
              </span>
            )}
          </div>
          <span className="text-sm font-semibold text-foreground">
            {priceDisplay}
          </span>
        </div>
        
        {gym.tags && gym.tags.length > 0 && (
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {gym.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
