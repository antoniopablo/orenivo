import { useTranslation } from "@/lib/i18n";

interface HeaderProps {
  onSettings: () => void;
}

export function Header({ onSettings }: HeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between px-3 pt-3 pb-2">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" opacity="0.9" />
            <rect x="3" y="13" width="7" height="8" rx="1.5" fill="white" opacity="0.6" />
            <rect x="13" y="3" width="8" height="5" rx="1.5" fill="white" opacity="0.7" />
            <rect x="13" y="11" width="8" height="4" rx="1.5" fill="white" opacity="0.5" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-white">Orenivo</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-500/15 text-brand-400 font-medium">
          BETA
        </span>
      </div>
      <button
        onClick={onSettings}
        className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/8 text-gray-400 hover:text-gray-200 text-[11px] transition-colors border border-white/8"
        title={t("settings")}
      >
        <span className="text-[12px]">⚙</span>
        <span>{t("settings")}</span>
      </button>
    </div>
  );
}
