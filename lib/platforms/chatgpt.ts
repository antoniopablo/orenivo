// ═══════════════════════════════════════════════════════════
// ORENIVO — ChatGPT Adapter
// Reads conversation list from chat.openai.com / chatgpt.com
//
// NOTE: ChatGPT frequently changes their DOM structure.
// All selectors use fallback chains for resilience.
// When something breaks, update the selectors here only.
// ═══════════════════════════════════════════════════════════

import type { Conversation } from "../types";
import { PlatformAdapter, queryAllWithFallback, waitForElement, debounce } from "./adapter";

const SIDEBAR_SELECTORS = [
  "nav[aria-label='Chat history']",
  "nav[aria-label='chat history']",
  "nav.flex-col",
  "#__next nav",
  "[data-testid='nav-history']",
  "[class*='overflow-y-auto'] nav",
];

const CONVERSATION_ITEM_SELECTORS = [
  "nav[aria-label='Chat history'] a[href^='/c/']",
  "nav a[href^='/c/']",
  "a[href^='/c/']",
  // Projects sidebar items also use /c/ but inside a different nav
  "[data-testid='history-item'] a",
];

export class ChatGPTAdapter implements PlatformAdapter {
  platform = "chatgpt" as const;
  private observer: MutationObserver | null = null;

  matches(url: string): boolean {
    return url.includes("chat.openai.com") || url.includes("chatgpt.com");
  }

  getConversations(): Conversation[] {
    const links = queryAllWithFallback(CONVERSATION_ITEM_SELECTORS);
    const conversations: Conversation[] = [];
    const seen = new Set<string>();

    for (const link of links) {
      const href = link.getAttribute("href") ?? (link as HTMLAnchorElement).href;
      if (!href) continue;

      const path = href.startsWith("http") ? new URL(href).pathname : href;
      if (!path.startsWith("/c/")) continue;

      const id = path.replace("/c/", "").split("?")[0].trim();
      if (!id || seen.has(id)) continue;
      seen.add(id);

      const rawTitle =
        link.getAttribute("aria-label") ||
        (link as HTMLElement).innerText?.trim() ||
        link.textContent?.trim() ||
        "Untitled conversation";

      if (!rawTitle) continue;
      const title = rawTitle.slice(0, 300).trim();

      conversations.push({
        id,
        title,
        platform: "chatgpt",
        url: `${window.location.origin}/c/${id}`,
        lastAccessed: Date.now(),
        pinned: false,
        folderId: null,
      });
    }

    return conversations;
  }

  observeChanges(callback: (conversations: Conversation[]) => void): void {
    this.disconnect();
    const debouncedCallback = debounce(() => callback(this.getConversations()), 500);

    const startObserving = async () => {
      const sidebar = await waitForElement(SIDEBAR_SELECTORS, {
        interval: 500,
        maxAttempts: 20,
      });

      const target = sidebar ?? document.body;
      console.log(`[Orenivo/ChatGPT] Observing: ${target.tagName}`);

      this.observer = new MutationObserver(debouncedCallback);
      this.observer.observe(target, {
        childList: true,
        subtree: true,
        characterData: false,
        attributes: false,
      });

      callback(this.getConversations());
    };

    startObserving();
  }

  disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
