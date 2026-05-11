import { useStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";

interface HeaderProps {
  onSettings: () => void;
}

export function Header({ onSettings }: HeaderProps) {
  const { plan } = useStore();
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
        {plan === "pro" && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-500/15 text-brand-400 font-semibold tracking-wide">
            PRO
          </span>
        )}
      </div>
      <button
        onClick={onSettings}
        className="relative w-7 h-7 rounded-lg hover:bg-white/8 text-gray-400 hover:text-gray-200 flex items-center justify-center transition-colors"
        title={t("settings")}
      >
        <span className="text-[14px]">⚙</span>
        {plan === "free" && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-500 border border-surface" />
        )}
      </button>
    </div>
  );
}
