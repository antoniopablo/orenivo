import { useStore } from "@/lib/store";
import { LOCALES } from "./locales";
import type { TranslationKeys } from "./locales";

export type { Locale } from "./locales";
export { LOCALE_NAMES } from "./locales";

/**
 * Returns a `t(key, vars?)` function for the current locale.
 * Supports {placeholder} substitution: t("folderLimitReached", { n: 5 })
 */
export function useTranslation() {
  const locale = useStore((s) => s.language);
  const strings = LOCALES[locale] ?? LOCALES.en;

  function t(key: keyof TranslationKeys, vars?: Record<string, string | number>): string {
    let str = strings[key] as string;
    if (!str) return key as string;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replaceAll(`{${k}}`, String(v));
      });
    }
    return str;
  }

  return { t, locale };
}
