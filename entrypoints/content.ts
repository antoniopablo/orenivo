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
    "https://grok.com/*",
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

    const onConversations = (conversations: any[]) => {
      console.log(
        `[Orenivo] ${conversations.length} conversations found on ${adapter.platform}`
      );
      safeSend({ type: "CONVERSATIONS_UPDATE", conversations });
    };

    adapter.observeChanges(onConversations);

    // ── SPA navigation guard ──────────────────────────────────
    // When the platform does a client-side navigation (React router,
    // Next.js, etc.) the sidebar DOM is often fully replaced.
    // The existing MutationObserver ends up watching a detached node
    // and stops firing — this is the #1 cause of "folders not updating"
    // bugs seen in all competing extensions.
    // Fix: detect URL changes and re-initialise the observer.
    let lastUrl = window.location.href;

    const handleNavigation = () => {
      const currentUrl = window.location.href;
      if (currentUrl === lastUrl) return;
      lastUrl = currentUrl;
      console.log(`[Orenivo] SPA navigation detected → re-initialising observer`);
      adapter.disconnect();
      adapter.observeChanges(onConversations);
    };

    // Modern Navigation API (Chrome 102+)
    if ("navigation" in window) {
      (window as any).navigation.addEventListener("navigate", handleNavigation);
    }

    // Fallback: intercept history.pushState / replaceState
    const patchHistory = (method: "pushState" | "replaceState") => {
      const original = history[method].bind(history);
      history[method] = (...args: Parameters<typeof history.pushState>) => {
        original(...args);
        handleNavigation();
      };
    };
    patchHistory("pushState");
    patchHistory("replaceState");

    // Fallback: popstate (back/forward buttons)
    window.addEventListener("popstate", handleNavigation);
    // ─────────────────────────────────────────────────────────

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
