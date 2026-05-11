"use client";

interface FilterChipsProps {
  selectedGroup: string;
  onGroupChange: (group: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearAll: () => void;
}

const GROUPS = ["VIP", "Regular", "New"];
const TAGS = [
  "Airport",
  "Business",
  "Medical",
  "Regular",
  "Late Night",
  "Weekend",
  "Long Distance",
  "Local",
];

const groupColors: Record<string, string> = {
  VIP: "border-amber-300 bg-amber-100 text-amber-800 shadow-amber-900/10",
  Regular: "border-sky-300 bg-sky-100 text-sky-800 shadow-sky-900/10",
  New: "border-emerald-300 bg-emerald-100 text-emerald-800 shadow-emerald-900/10",
};

export default function FilterChips({
  selectedGroup,
  onGroupChange,
  selectedTags,
  onTagToggle,
  onClearAll,
}: FilterChipsProps) {
  const hasFilters = selectedGroup || selectedTags.length > 0;

  return (
    <div className="space-y-3">
      {/* Group filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => onGroupChange(selectedGroup === g ? "" : g)}
            className={`min-h-tap shrink-0 rounded-full border px-4 py-2 text-sm font-bold shadow-sm transition-all ${
              selectedGroup === g
                ? groupColors[g]
                : "border-white/70 bg-white/75 text-slate-600 hover:bg-white"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Tag filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagToggle(tag)}
            className={`min-h-tap shrink-0 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition-all ${
              selectedTags.includes(tag)
                ? "border-primary-300 bg-primary-100 text-primary-800 shadow-primary-900/10"
                : "border-white/70 bg-white/75 text-slate-600 hover:bg-white"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Clear all */}
      {hasFilters && (
        <button
          onClick={onClearAll}
          className="min-h-tap rounded-2xl px-3 py-2 text-sm font-bold text-primary-700 hover:bg-white/70"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
