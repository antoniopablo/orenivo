// ═══════════════════════════════════════════════════════════
// CHATORIO — Plans & Limits
// Defines what each tier can do.
// All limit checks are pure functions — no side effects.
// ═══════════════════════════════════════════════════════════

import type { Platform } from "./types";

export type Plan = "free" | "pro";

export const FREE_LIMITS = {
  folders: 5,
  prompts: 5,
  platforms: ["chatgpt", "claude", "gemini", "deepseek"] as Platform[],
} as const;

// ── Limit checks ──

export function canCreateFolder(currentFolderCount: number, plan: Plan): boolean {
  if (plan === "pro") return true;
  return currentFolderCount < FREE_LIMITS.folders;
}

export function canCreatePrompt(currentPromptCount: number, plan: Plan): boolean {
  if (plan === "pro") return true;
  return currentPromptCount < FREE_LIMITS.prompts;
}

export function isPlatformAvailable(platform: Platform, plan: Plan): boolean {
  if (plan === "pro") return true;
  return (FREE_LIMITS.platforms as readonly Platform[]).includes(platform);
}

export function getRemainingFolders(currentFolderCount: number, plan: Plan): number | null {
  if (plan === "pro") return null; // null = unlimited
  return Math.max(0, FREE_LIMITS.folders - currentFolderCount);
}
