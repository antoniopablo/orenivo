import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { PLATFORMS, type Platform } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

export function StatusBar() {
  const { conversations, folders } = useStore();
  const [activePlatforms, setActivePlatforms] = useState<Platform[]>([]);

  useEffect(() => {
    const listener = (message: any) => {
      if (message.type === "ACTIVE_PLATFORMS_UPDATE") {
        setActivePlatforms(message.platforms ?? []);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const { t } = useTranslation();
  const hasActive = activePlatforms.length > 0;

  return (
    <div className="border-t border-white/5">
      {/* Nudge when no platform tab is open */}
      {!hasActive && conversations.length > 0 && (
        <div className="px-3 py-1.5 flex items-center gap-1.5 bg-amber-500/5 border-b border-amber-500/10">
          <span className="text-[10px]">💡</span>
          <p className="text-[10px] text-amber-400/70 leading-snug">
            {t("syncNudge")}
          </p>
        </div>
      )}

      <div className="px-3 py-2 flex items-center justify-between gap-2">
        {/* Active platforms */}
        <div className="flex items-center gap-1.5">
          {hasActive ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse flex-shrink-0" />
              <div className="flex items-center gap-1">
                {activePlatforms.map((id) => {
                  const p = PLATFORMS[id];
                  return (
                    <span
                      key={id}
                      className="text-[11px] font-medium"
                      style={{ color: p.color }}
                      title={`${p.name} — ${t("syncingTooltip")}`}
                    >
                      {p.icon} {p.name}
                    </span>
                  );
                })}
              </div>
            </>
          ) : (
            <span className="text-[10px] text-gray-600">{t("noActiveTabs")}</span>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-2 text-[10px] text-gray-600 flex-shrink-0">
          <span>{conversations.length} {t("statChats")}</span>
          <span>·</span>
          <span>{folders.length} {t("statFolders")}</span>
        </div>
      </div>
    </div>
  );
}
