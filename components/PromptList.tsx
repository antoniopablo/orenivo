import { useState } from "react";
import { useStore } from "@/lib/store";
import { PLATFORMS, type Platform } from "@/lib/types";
import { FREE_LIMITS } from "@/lib/plans";
import { useTranslation } from "@/lib/i18n";

// Regex to highlight {variables} in prompt text
function highlightVars(text: string) {
  const parts = text.split(/(\{[^}]+\})/g);
  return parts.map((part, i) =>
    /^\{[^}]+\}$/.test(part) ? (
      <span key={i} className="text-brand-400 font-medium">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function PromptList() {
  const { plan, prompts, createPrompt, removePrompt } = useStore();
  const { t } = useTranslation();

  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [promptSearch, setPromptSearch] = useState("");

  const atLimit = plan === "free" && prompts.length >= FREE_LIMITS.prompts;

  const filteredPrompts = promptSearch.trim()
    ? prompts.filter(p =>
        p.name.toLowerCase().includes(promptSearch.toLowerCase()) ||
        p.text.toLowerCase().includes(promptSearch.toLowerCase())
      )
    : prompts;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    const created = await createPrompt(name.trim(), text.trim(), platform);
    if (created) {
      setName("");
      setText("");
      setPlatform("all");
      setShowForm(false);
    }
  }

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">
          {prompts.length !== 1 ? t("promptCount_other", { n: prompts.length }) : t("promptCount_one")}
        </p>
        {!atLimit && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-500/15 hover:bg-brand-500/25 text-brand-400 hover:text-brand-300 text-[11px] font-medium transition-colors border border-brand-500/20"
          >
            <span className="text-[13px] leading-none">+</span> {t("newPrompt")}
          </button>
        )}
      </div>

      {/* Prompt search — only show when there are prompts */}
      {prompts.length > 3 && !showForm && (
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600 text-[10px]">🔍</span>
          <input
            type="text"
            value={promptSearch}
            onChange={(e) => setPromptSearch(e.target.value)}
            placeholder="Filtrar prompts..."
            className="w-full bg-white/5 border border-white/5 rounded-lg pl-7 pr-3 py-1 text-[11px] text-gray-200 placeholder-gray-600 outline-none focus:border-brand-500/30 transition-colors"
          />
          {promptSearch && (
            <button
              onClick={() => setPromptSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] hover:text-gray-300"
            >✕</button>
          )}
        </div>
      )}

      {/* Limit nudge */}
      {atLimit && !showForm && (
        <div className="px-2 py-2 rounded-md border border-dashed border-amber-500/30 bg-amber-500/5">
          <p className="text-[10px] text-amber-400/80 leading-relaxed">
            {t("promptLimitReached", { n: FREE_LIMITS.prompts })}{" "}
            <span className="text-amber-400 font-medium">{t("upgradeToPro")}</span>{" "}
            {t("unlimitedPrompts")}
          </p>
        </div>
      )}

      {/* New prompt form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-surface-light rounded-xl border border-white/8 p-3 space-y-2.5"
        >
          <p className="text-[11px] text-gray-400 font-medium">{t("newPromptTitle")}</p>

          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("promptNamePlaceholder")}
            className="w-full bg-white/5 border border-white/8 rounded-lg px-2.5 py-1.5 text-[12px] text-white placeholder-gray-600 outline-none focus:border-brand-500/40"
          />

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("promptTextPlaceholder")}
            rows={4}
            className="w-full bg-white/5 border border-white/8 rounded-lg px-2.5 py-1.5 text-[12px] text-white placeholder-gray-600 outline-none focus:border-brand-500/40 resize-none font-mono leading-relaxed"
          />

          {/* Variables preview */}
          {text && /\{[^}]+\}/.test(text) && (
            <div className="flex flex-wrap gap-1">
              {[...text.matchAll(/\{([^}]+)\}/g)].map(([full], i) => (
                <span
                  key={i}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/15 text-brand-400 font-mono"
                >
                  {full}
                </span>
              ))}
            </div>
          )}

          {/* Platform selector */}
          <div className="flex gap-1 flex-wrap">
            <PlatformChip
              label={t("promptPlatformAll")}
              active={platform === "all"}
              onClick={() => setPlatform("all")}
            />
            {Object.values(PLATFORMS).map((p) => (
              <PlatformChip
                key={p.id}
                label={p.icon + " " + p.name}
                active={platform === p.id}
                color={p.color}
                onClick={() => setPlatform(p.id)}
              />
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={!name.trim() || !text.trim()}
              className="flex-1 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-[12px] font-medium text-white transition-colors"
            >
              {t("savePrompt")}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setName("");
                setText("");
                setPlatform("all");
              }}
              className="px-3 py-1.5 rounded-lg border border-white/10 text-[12px] text-gray-400 hover:bg-white/5 transition-colors"
            >
              {t("cancelPrompt")}
            </button>
          </div>
        </form>
      )}

      {/* Prompt list */}
      {prompts.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl mb-3">
            ⚡
          </div>
          <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
            {t("emptyPromptsHint")}
          </p>
        </div>
      ) : filteredPrompts.length === 0 && promptSearch ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <p className="text-xs text-gray-500">No hay prompts que coincidan con "{promptSearch}"</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filteredPrompts.map((prompt) => {
            const isExpanded = expandedId === prompt.id;
            const platformInfo =
              prompt.platform !== "all"
                ? PLATFORMS[prompt.platform as Platform]
                : null;

            return (
              <div
                key={prompt.id}
                className="bg-surface-light rounded-xl border border-white/5 overflow-hidden"
              >
                {/* Prompt header */}
                <div
                  className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-white/3 transition-colors"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : prompt.id)
                  }
                >
                  <span className="text-[13px] flex-shrink-0">⚡</span>
                  <span className="text-[13px] text-gray-200 font-medium truncate flex-1">
                    {prompt.name}
                  </span>
                  {platformInfo && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                      style={{
                        color: platformInfo.color,
                        background: platformInfo.color + "20",
                      }}
                    >
                      {platformInfo.icon} {platformInfo.name}
                    </span>
                  )}
                  <span className="text-gray-600 text-[10px] flex-shrink-0">
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>

                {/* Expanded body */}
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2 border-t border-white/5 pt-2">
                    <p className="text-[12px] text-gray-400 leading-relaxed font-mono whitespace-pre-wrap break-words">
                      {highlightVars(prompt.text)}
                    </p>

                    {/* Variables found */}
                    {/\{[^}]+\}/.test(prompt.text) && (
                      <div className="flex flex-wrap gap-1">
                        {[...prompt.text.matchAll(/\{([^}]+)\}/g)].map(
                          ([full], i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/15 text-brand-400 font-mono"
                            >
                              {full}
                            </span>
                          )
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleCopy(prompt.id, prompt.text)}
                        className={[
                          "flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center justify-center gap-1.5",
                          copiedId === prompt.id
                            ? "bg-brand-500/30 text-brand-300"
                            : "bg-brand-500/15 hover:bg-brand-500/25 text-brand-400",
                        ].join(" ")}
                      >
                        {copiedId === prompt.id ? t("copiedPrompt") : `📋 ${t("copyPrompt")}`}
                      </button>
                      {confirmDeleteId === prompt.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              removePrompt(prompt.id);
                              if (expandedId === prompt.id) setExpandedId(null);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1.5 rounded-lg bg-red-500/20 text-[11px] text-red-400 hover:bg-red-500/30 transition-colors font-medium"
                          >
                            {t("deletePrompt")}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1.5 rounded-lg border border-white/10 text-[11px] text-gray-400 hover:bg-white/5 transition-colors"
                          >
                            {t("cancelDelete")}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(prompt.id)}
                          className="px-3 py-1.5 rounded-lg border border-red-500/20 text-[11px] text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PlatformChip({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
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
