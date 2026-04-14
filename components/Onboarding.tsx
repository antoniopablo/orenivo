import { useState } from "react";
import { setOnboardingDone } from "@/lib/storage";
import { useTranslation } from "@/lib/i18n";

interface OnboardingProps {
  onDone: () => void;
}

export function Onboarding({ onDone }: OnboardingProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  const STEPS = [
    { icon: t("onboardingStep1Icon"), title: t("onboardingStep1Title"), description: t("onboardingStep1Desc"), hint: t("onboardingStep1Hint") },
    { icon: t("onboardingStep2Icon"), title: t("onboardingStep2Title"), description: t("onboardingStep2Desc"), hint: t("onboardingStep2Hint") },
    { icon: t("onboardingStep3Icon"), title: t("onboardingStep3Title"), description: t("onboardingStep3Desc"), hint: t("onboardingStep3Hint") },
  ];

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  async function handleDone() {
    await setOnboardingDone();
    onDone();
  }

  return (
    <div className="flex flex-col h-screen bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
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
        </div>
        <button
          onClick={handleDone}
          className="text-[11px] text-gray-400 hover:text-gray-200 transition-colors px-2 py-1 rounded border border-white/10 hover:border-white/20"
        >
          {t("onboardingSkip")}
        </button>
      </div>

      {/* Welcome heading (only on step 0) */}
      {step === 0 && (
        <div className="px-4 pt-3 pb-1">
          <p className="text-[11px] text-brand-400 font-medium uppercase tracking-wider mb-1">
            {t("onboardingWelcome")}
          </p>
          <h1 className="text-base font-semibold text-white leading-snug">
            {t("onboardingTitle")}
          </h1>
        </div>
      )}

      {/* Step card */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <div className="w-full bg-surface-light rounded-xl p-5 border border-white/5 space-y-3">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={[
                  "h-1 rounded-full transition-all",
                  i === step
                    ? "bg-brand-500 flex-1"
                    : i < step
                    ? "bg-brand-500/40 w-6"
                    : "bg-white/10 w-6",
                ].join(" ")}
              />
            ))}
          </div>

          <div className="text-3xl">{current.icon}</div>

          <div>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">
              {t("onboardingStep", { current: step + 1, total: STEPS.length })}
            </p>
            <h2 className="text-[15px] font-semibold text-white mb-2">
              {current.title}
            </h2>
            <p className="text-[13px] text-gray-400 leading-relaxed">
              {current.description}
            </p>
          </div>

          <div className="flex items-start gap-2 bg-white/3 rounded-lg px-3 py-2 border border-white/5">
            <span className="text-brand-400 text-[11px] mt-0.5">💡</span>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              {current.hint}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 pb-5 pt-3 flex items-center gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-2 rounded-lg border border-white/10 text-[13px] text-gray-400 hover:bg-white/5 transition-colors"
          >
            {t("onboardingBack")}
          </button>
        )}
        <button
          onClick={isLast ? handleDone : () => setStep(step + 1)}
          className="flex-1 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-[13px] font-medium text-white transition-colors"
        >
          {isLast ? t("onboardingStart") : t("onboardingNext")}
        </button>
      </div>
    </div>
  );
}
