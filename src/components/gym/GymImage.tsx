import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

interface GymImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

/**
 * Kakao-imported gyms have no photo yet (imageUrl is null for every one of
 * them today), so falling back to a stock gym photo made every listing look
 * like it had a real, identical photo. Show a clearly-labeled placeholder
 * instead.
 */
export const GymImage = ({ src, alt, className }: GymImageProps) => {
  if (!src) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 bg-secondary text-muted-foreground",
          className
        )}
      >
        <Dumbbell className="w-8 h-8" />
        <span className="text-xs">등록된 사진 없음</span>
      </div>
    );
  }

  return <img src={src} alt={alt} className={cn("object-cover", className)} />;
};
