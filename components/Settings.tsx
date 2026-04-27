import { useState } from "react";
import { useStore } from "@/lib/store";
import { getFullState, importState } from "@/lib/storage";
import { FREE_LIMITS } from "@/lib/plans";
import { useTranslation, LOCALE_NAMES } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

interface SettingsProps {
  onClose: () => void;
}

const VERSION = chrome.runtime.getManifest().version;
const CWS_REVIEW_URL = `https://chromewebstore.google.com/detail/${chrome.runtime.id}/reviews`;

export function Settings({ onClose }: SettingsProps) {
  const { plan, folders, conversations, prompts, language, setLanguage } = useStore();
  const { t } = useTranslation();
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  async function handleExport() {
    const state = await getFullState();
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orenivo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (
          !parsed ||
          typeof parsed !== "object" ||
          !Array.isArray(parsed.folders) ||
          !Array.isArray(parsed.conversations) ||
          !Array.isArray(parsed.prompts ?? [])
        ) {
          setImportError("Archivo inválido. Asegúrate de usar un backup de Orenivo.");
          return;
        }
        await importState({
          folders: parsed.folders,
          conversations: parsed.conversations,
          prompts: Array.isArray(parsed.prompts) ? parsed.prompts : [],
        });
        setImportSuccess(true);
        // Reload store state
        setTimeout(() => window.location.reload(), 800);
      } catch {
        setImportError("No se pudo leer el archivo. Comprueba que es un JSON válido.");
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-imported
    e.target.value = "";
  }

  return (
    <div className="flex flex-col h-screen bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-md hover:bg-white/5 flex items-center justify-center text-gray-500 text-sm transition-colors"
            title="Volver"
          >
            ←
          </button>
          <span className="text-sm font-semibold text-white">{t("settingsTitle")}</span>
        </div>
        <span className="text-[10px] text-gray-600">v{VERSION}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Plan */}
        <Section title={t("planSection")}>
          <div className="flex items-center justify-between px-3 py-2.5 bg-surface-light rounded-xl border border-white/5">
            <div>
              <p className="text-[13px] text-white font-medium capitalize">
                {plan === "free" ? t("planFree") : t("planPro")}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {plan === "free"
                  ? t("planFreeUsage", { folders: folders.length, maxFolders: FREE_LIMITS.folders, prompts: prompts.length, maxPrompts: FREE_LIMITS.prompts })
                  : t("planUnlimited")}
              </p>
            </div>
            {plan === "free" && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 font-medium">
                {t("planFree")}
              </span>
            )}
            {plan === "pro" && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-brand-500/15 text-brand-400 font-medium">
                {t("planProBadge")}
              </span>
            )}
          </div>
          {plan === "free" && (
            <a
              href="https://orenivo.com/#pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-brand-500/10 to-brand-600/5 rounded-xl border border-brand-500/20 hover:border-brand-500/40 transition-colors"
            >
              <div>
                <p className="text-[12px] text-brand-300 font-medium">Upgrade to Pro</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Unlimited folders · Cloud sync</p>
              </div>
              <span className="text-brand-400 text-[11px]">→</span>
            </a>
          )}
        </Section>

        {/* Stats */}
        <Section title={t("dataSection")}>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: t("statsFolders"), value: folders.length },
              { label: t("statsChats"), value: conversations.length },
              { label: t("statsPrompts"), value: prompts.length },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-surface-light rounded-xl border border-white/5 px-3 py-2.5 text-center"
              >
                <p className="text-[18px] font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-600 px-1">{t("dataLocalNote")}</p>
        </Section>

        {/* Export / Import */}
        <Section title={t("backupSection")}>
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-surface-light rounded-xl border border-white/5 hover:bg-white/5 transition-colors text-left"
          >
            <span className="text-lg">📤</span>
            <div>
              <p className="text-[13px] text-white font-medium">{t("exportData")}</p>
              <p className="text-[11px] text-gray-500">{t("exportDesc")}</p>
            </div>
          </button>

          <label className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-surface-light rounded-xl border border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
            <span className="text-lg">📥</span>
            <div className="flex-1">
              <p className="text-[13px] text-white font-medium">{t("importData")}</p>
              <p className="text-[11px] text-gray-500">{t("importDesc")}</p>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          {importError && (
            <p className="text-[11px] text-red-400 px-1">{importError}</p>
          )}
          {importSuccess && (
            <p className="text-[11px] text-brand-400 px-1">{t("importSuccess")}</p>
          )}
        </Section>

        {/* Language */}
        <Section title={t("languageSection")}>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.entries(LOCALE_NAMES) as [Locale, string][]).map(([code, name]) => (
              <button
                key={code}
                onClick={() => setLanguage(code)}
                className={[
                  "px-3 py-2 rounded-lg text-[12px] font-medium transition-all border",
                  language === code
                    ? "bg-brand-500/15 border-brand-500/30 text-brand-300"
                    : "bg-white/3 border-white/5 text-gray-400 hover:bg-white/6 hover:text-gray-200",
                ].join(" ")}
              >
                {name}
              </button>
            ))}
          </div>
        </Section>

        {/* About */}
        <Section title={t("aboutSection")}>
          <div className="px-3 py-2.5 bg-surface-light rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-gray-400">{t("aboutVersion")}</span>
              <span className="text-[12px] text-white">v{VERSION}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-gray-400">{t("aboutSupport")}</span>
              <span className="text-[12px] text-brand-400">support@orenivo.ai</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-gray-400">{t("aboutMadeIn")}</span>
              <span className="text-[12px] text-gray-300">{t("aboutMadeInValue")}</span>
            </div>
          </div>
          <a
            href={CWS_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-surface-light rounded-xl border border-white/5 hover:bg-white/5 transition-colors"
          >
            <span className="text-lg">⭐</span>
            <div className="flex-1">
              <p className="text-[13px] text-white font-medium">Leave a review</p>
              <p className="text-[11px] text-gray-500">Helps other users find Orenivo</p>
            </div>
            <span className="text-gray-600 text-[11px]">→</span>
          </a>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium px-1">
        {title}
      </p>
      {children}
    </div>
  );
}
