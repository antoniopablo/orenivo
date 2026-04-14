// ═══════════════════════════════════════════════════════════
// ORENIVO — Claude Adapter
// Reads conversation list from claude.ai
// ═══════════════════════════════════════════════════════════

import type { Conversation } from "../types";
import { PlatformAdapter, queryAllWithFallback, waitForElement, debounce } from "./adapter";

const SIDEBAR_SELECTORS = [
  "nav[aria-label]",
  "[data-testid='sidebar']",
  "[class*='sidebar']",
  "[class*='Sidebar']",
  "nav",
];

const CONVERSATION_SELECTORS = [
  "a[href^='/chat/']",
  "nav a[href*='/chat/']",
  "[data-testid='chat-link']",
  "[data-testid='conversation-link']",
  // Fallback: any link that looks like a Claude chat
  "a[href*='claude.ai/chat/']",
];

export class ClaudeAdapter implements PlatformAdapter {
  platform = "claude" as const;
  private observer: MutationObserver | null = null;

  matches(url: string): boolean {
    return url.includes("claude.ai");
  }

  getConversations(): Conversation[] {
    const links = queryAllWithFallback(CONVERSATION_SELECTORS);
    const conversations: Conversation[] = [];
    const seen = new Set<string>();

    for (const link of links) {
      const href = link.getAttribute("href") ?? (link as HTMLAnchorElement).href;
      if (!href) continue;

      const path = href.startsWith("http") ? new URL(href).pathname : href;
      if (!path.includes("/chat/")) continue;

      const match = path.match(/\/chat\/([a-f0-9-]{8,})/);
      if (!match) continue;

      const id = match[1];
      if (seen.has(id)) continue;
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
        platform: "claude",
        url: `https://claude.ai/chat/${id}`,
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
      console.log(`[Orenivo/Claude] Observing: ${target.tagName}`);

      this.observer = new MutationObserver(debouncedCallback);
      this.observer.observe(target, {
        childList: true,
        subtree: true,
        characterData: false,
        attributes: false,
      });

      callback(this.getConversations());
    };

    if (document.readyState === "complete") {
      setTimeout(startObserving, 1000);
    } else {
      window.addEventListener("load", () => setTimeout(startObserving, 1000), { once: true });
    }
  }

  disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
