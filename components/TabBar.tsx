import { useStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";

export function TabBar() {
  const { activeTab, setActiveTab, conversations, folders, prompts } = useStore();
  const { t } = useTranslation();

  const pinnedCount = conversations.filter((c) => c.pinned).length;
  const recentCount = Math.min(conversations.length, 30);

  const tabs = [
    { id: "folders" as const, icon: "📁", label: t("tabFolders"), count: folders.length || null },
    { id: "recent" as const, icon: "🕐", label: t("tabRecent"), count: recentCount || null },
    { id: "pinned" as const, icon: "📌", label: t("tabPinned"), count: pinnedCount || null },
    { id: "prompts" as const, icon: "⚡", label: t("tabPrompts"), count: prompts.length || null },
  ];

  return (
    <div className="flex border-b border-white/5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 py-2 text-[10px] font-medium transition-all border-b-2 flex items-center justify-center gap-1 ${
            activeTab === tab.id
              ? "text-brand-400 border-brand-500"
              : "text-gray-500 border-transparent hover:text-gray-300"
          }`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
          {tab.count !== null && (
            <span className={`text-[9px] px-1 py-0.5 rounded-full leading-none ${
              activeTab === tab.id
                ? "bg-brand-500/20 text-brand-400"
                : "bg-white/8 text-gray-600"
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
