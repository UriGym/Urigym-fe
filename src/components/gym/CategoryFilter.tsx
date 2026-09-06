import { cn } from "@/lib/utils";

/**
 * The id doubles as the category value stored on a gym, so filtering matches
 * exactly what owners pick when registering.
 */
export const GYM_CATEGORIES = [
  { id: "헬스장", label: "헬스", emoji: "💪" },
  { id: "크로스핏", label: "크로스핏", emoji: "🔥" },
  { id: "요가", label: "요가", emoji: "🧘" },
  { id: "필라테스", label: "필라테스", emoji: "🤸" },
  { id: "구기종목", label: "구기종목", emoji: "⚽" },
  { id: "투기종목", label: "투기종목", emoji: "🥊" },
  { id: "수영장", label: "수영", emoji: "🏊" },
  { id: "클라이밍", label: "클라이밍", emoji: "🧗" },
  { id: "골프", label: "골프", emoji: "⛳" },
  { id: "댄스", label: "댄스", emoji: "💃" },
] as const;

const filters = [{ id: "all", label: "전체", emoji: "🏋️" }, ...GYM_CATEGORIES];

interface CategoryFilterProps {
  selected: string;
  onSelect: (id: string) => void;
}

export const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200",
            selected === category.id
              ? "gradient-primary text-primary-foreground shadow-gym"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <span>{category.emoji}</span>
          <span className="text-sm font-medium">{category.label}</span>
        </button>
      ))}
    </div>
  );
};
