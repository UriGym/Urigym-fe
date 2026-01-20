import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "전체", emoji: "🏋️" },
  { id: "fitness", label: "헬스", emoji: "💪" },
  { id: "crossfit", label: "크로스핏", emoji: "🔥" },
  { id: "yoga", label: "요가", emoji: "🧘" },
  { id: "pilates", label: "필라테스", emoji: "🤸" },
  { id: "boxing", label: "복싱", emoji: "🥊" },
  { id: "swimming", label: "수영", emoji: "🏊" },
  { id: "martial", label: "무술", emoji: "🥋" },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (id: string) => void;
}

export const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
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
