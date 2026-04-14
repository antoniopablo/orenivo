// ═══════════════════════════════════════════════════════════
// ORENIVO — DeepSeek Adapter
// Reads conversation list from chat.deepseek.com
//
// DOM notes (as of 2025-2026):
// - Conversations listed in a left sidebar
// - Each item links to /a/chat/<id> or /chat/<id>
//
// If selectors break, inspect chat.deepseek.com sidebar and
// update CONVERSATION_ITEM_SELECTORS with the new selector.
// ═══════════════════════════════════════════════════════════

import type { Conversation } from "../types";
import {
  PlatformAdapter,
  queryAllWithFallback,
  waitForElement,
  debounce,
} from "./adapter";

const SIDEBAR_SELECTORS = [
  "[class*='sidebar']",
  "[class*='Sidebar']",
  "[class*='history']",
  "[class*='History']",
  "[class*='chat-list']",
  "[class*='chatList']",
  "aside",
  "nav",
];

const CONVERSATION_ITEM_SELECTORS = [
  "a[href^='/a/chat/']",
  "a[href^='/chat/']",
  "[class*='conversation'] a",
  "[class*='Conversation'] a",
  "[class*='chat-item'] a",
  "[class*='chatItem'] a",
  "[class*='session'] a",
  "li a[href*='/chat/']",
  // 2026 fallback — look for any link with chat-like href
  "a[href*='/chat/']",
];

export class DeepSeekAdapter implements PlatformAdapter {
  platform = "deepseek" as const;
  private observer: MutationObserver | null = null;
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;

  matches(url: string): boolean {
    return url.includes("chat.deepseek.com");
  }

  getConversations(): Conversation[] {
    const links = queryAllWithFallback(CONVERSATION_ITEM_SELECTORS);
    const conversations: Conversation[] = [];
    const seen = new Set<string>();

    for (const link of links) {
      const href = link.getAttribute("href") ?? (link as HTMLAnchorElement).href;
      if (!href) continue;

      // Normalize: extract path component if full URL
      const path = href.startsWith("http")
        ? new URL(href).pathname
        : href;

      // Extract ID from /a/chat/<id> or /chat/<id>
      const match = path.match(/\/(?:a\/)?chat\/([^/?#]+)/);
      if (!match) continue;

      const id = match[1].trim();
      if (!id || id.length < 3 || seen.has(id)) continue;
      seen.add(id);

      const rawTitle =
        link.getAttribute("aria-label") ||
        (link as HTMLElement).innerText?.trim() ||
        link.textContent?.trim() ||
        "Untitled conversation";

      if (!rawTitle || rawTitle.length === 0) continue;
      const title = rawTitle.slice(0, 300).trim();

      conversations.push({
        id,
        title,
        platform: "deepseek",
        url: `https://chat.deepseek.com/a/chat/${id}`,
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
      console.log(`[Orenivo/DeepSeek] Observing: ${target.tagName}`);

      this.observer = new MutationObserver(debouncedCallback);
      this.observer.observe(target, {
        childList: true,
        subtree: true,
        characterData: false,
        attributes: false,
      });

      const convs = this.getConversations();
      if (convs.length > 0) {
        callback(convs);
      } else {
        this.retryTimeout = setTimeout(() => callback(this.getConversations()), 2500);
      }
    };

    if (document.readyState === "complete") {
      setTimeout(startObserving, 1200);
    } else {
      window.addEventListener("load", () => setTimeout(startObserving, 1200), { once: true });
    }
  }

  disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  }
}
