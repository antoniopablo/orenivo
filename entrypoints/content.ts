// ═══════════════════════════════════════════════════════════
// ORENIVO — Content Script
// Runs on ChatGPT, Claude, Gemini, DeepSeek
// Detects platform, reads conversations, sends to background
// ═══════════════════════════════════════════════════════════

import { detectPlatform } from "@/lib/platforms";

/** Safe wrapper — chrome.runtime becomes undefined if the extension
 *  is reloaded while the tab stays open. Swallow those errors silently. */
function safeSend(message: object) {
  try {
    chrome.runtime?.sendMessage(message).catch(() => {});
  } catch {
    // Extension context invalidated — ignore
  }
}

export default defineContentScript({
  matches: [
    "https://chat.openai.com/*",
    "https://chatgpt.com/*",
    "https://claude.ai/*",
    "https://gemini.google.com/*",
    "https://chat.deepseek.com/*",
  ],
  runAt: "document_idle",

  main() {
    console.log("[Orenivo] Content script loaded on:", window.location.href);

    const adapter = detectPlatform();
    if (!adapter) {
      console.log("[Orenivo] No matching platform adapter found");
      return;
    }

    console.log(`[Orenivo] Platform detected: ${adapter.platform}`);

    safeSend({ type: "PLATFORM_DETECTED", platform: adapter.platform });

    adapter.observeChanges((conversations) => {
      console.log(
        `[Orenivo] ${conversations.length} conversations found on ${adapter.platform}`
      );
      safeSend({ type: "CONVERSATIONS_UPDATE", conversations });
    });

    chrome.runtime.onMessage.addListener((message) => {
      if (
        message.type === "GET_CONVERSATIONS" &&
        message.platform === adapter.platform
      ) {
        safeSend({
          type: "CONVERSATIONS_UPDATE",
          conversations: adapter.getConversations(),
        });
      }
    });
  },
});
