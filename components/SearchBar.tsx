import { useStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { searchInputRef } from "@/entrypoints/sidepanel/App";

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useStore();
  const { t } = useTranslation();

  return (
    <div className="relative">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
        🔍
      </span>
      <input
        ref={(el) => { searchInputRef.current = el; }}
        type="text"
        placeholder={t("searchPlaceholder")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-white/5 border border-white/5 rounded-lg pl-8 pr-8 py-1.5 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-brand-500/30 transition-colors"
      />
      {searchQuery ? (
        <button
          onClick={() => setSearchQuery("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs hover:text-gray-300"
        >
          ✕
        </button>
      ) : (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-gray-700 pointer-events-none select-none hidden group-focus-within:hidden">
          ⌘K
        </span>
      )}
    </div>
  );
}
