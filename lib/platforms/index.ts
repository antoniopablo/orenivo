// ═══════════════════════════════════════════════════════════
// CHATORIO — Platform Registry
// Detects which AI platform we're on and returns the adapter
// ═══════════════════════════════════════════════════════════

import type { PlatformAdapter } from "./adapter";
import { ChatGPTAdapter } from "./chatgpt";
import { ClaudeAdapter } from "./claude";
import { GeminiAdapter } from "./gemini";
import { DeepSeekAdapter } from "./deepseek";
import { GrokAdapter } from "./grok";

// Register all adapters here. To add a new platform, create
// an adapter in lib/platforms/ and add it to this array.
const adapters: PlatformAdapter[] = [
  new ChatGPTAdapter(),
  new ClaudeAdapter(),
  new GeminiAdapter(),
  new DeepSeekAdapter(),
  new GrokAdapter(),
];

/**
 * Detect which platform adapter matches the current URL.
 * Returns null if we're not on a supported platform.
 */
export function detectPlatform(
  url: string = window.location.href
): PlatformAdapter | null {
  for (const adapter of adapters) {
    if (adapter.matches(url)) {
      return adapter;
    }
  }
  return null;
}

export { adapters };
