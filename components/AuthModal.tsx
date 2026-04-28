import { useState } from "react";
import { requestOtp, verifyOtp } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n";

interface AuthModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

type Step = "email" | "otp";

export function AuthModal({ onSuccess, onClose }: AuthModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const { error: err } = await requestOtp(email.trim().toLowerCase());
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setStep("otp");
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true);
    setError(null);
    const { user, error: err } = await verifyOtp(email.trim().toLowerCase(), otp.trim());
    setLoading(false);
    if (err || !user) {
      setError(t("authError"));
    } else {
      onSuccess();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface border border-white/10 rounded-2xl shadow-2xl w-[280px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">{t("signIn")}</span>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendCode} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] text-gray-500">{t("emailLabel")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                required
                autoFocus
                className="w-full bg-surface-light border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50 transition-colors"
              />
            </div>
            {error && <p className="text-[11px] text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-medium transition-colors"
            >
              {loading ? t("sending") : t("sendCode")}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-3">
            <p className="text-[11px] text-gray-400">{t("enterCode")}</p>
            <div className="space-y-1.5">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder={t("codePlaceholder")}
                required
                autoFocus
                inputMode="numeric"
                maxLength={6}
                className="w-full bg-surface-light border border-white/10 rounded-lg px-3 py-2 text-[16px] text-white placeholder-gray-600 tracking-[0.3em] text-center focus:outline-none focus:border-brand-500/50 transition-colors"
              />
            </div>
            {error && <p className="text-[11px] text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-medium transition-colors"
            >
              {loading ? t("verifying") : t("verifyCode")}
            </button>
            <button
              type="button"
              onClick={() => { setStep("email"); setOtp(""); setError(null); }}
              className="w-full text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
            >
              {t("backToEmail")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
