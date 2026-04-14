import { useStore } from "@/lib/store";
import { PLATFORMS, type Platform } from "@/lib/types";
import { isPlatformAvailable } from "@/lib/plans";
import { useTranslation } from "@/lib/i18n";

export function PlatformFilter() {
  const { plan, platformFilter, setPlatformFilter } = useStore();
  const { t } = useTranslation();

  return (
    <div className="flex gap-1">
      <FilterChip
        label={t("allPlatforms")}
        active={platformFilter === "all"}
        onClick={() => setPlatformFilter("all")}
      />
      {Object.values(PLATFORMS).map((p) => {
        const available = isPlatformAvailable(p.id, plan);
        return (
          <FilterChip
            key={p.id}
            label={p.icon + " " + p.name}
            active={platformFilter === p.id}
            color={p.color}
            locked={!available}
            onClick={() => {
              if (available) setPlatformFilter(p.id);
            }}
          />
        );
      })}
    </div>
  );
}

function FilterChip({
  label,
  active,
  color,
  locked,
  onClick,
}: {
  label: string;
  active: boolean;
  color?: string;
  locked?: boolean;
  onClick: () => void;
}) {
  if (locked) {
    return (
      <button
        title="Disponible en Pro"
        className="px-2 py-1 rounded-md text-[10px] font-medium text-gray-600 cursor-default relative"
        onClick={onClick}
      >
        {label}
        <span className="absolute -top-0.5 -right-0.5 text-[7px] leading-none">🔒</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
        active
          ? "bg-white/10 text-white"
          : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
      }`}
      style={active && color ? { color } : undefined}
    >
      {label}
    </button>
  );
}
