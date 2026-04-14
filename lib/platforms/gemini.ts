// ═══════════════════════════════════════════════════════════
// ORENIVO — Gemini Adapter
// Reads conversation list from gemini.google.com
//
// DOM notes (as of 2025-2026):
// - Conversations listed in a left sidebar
// - Each item links to /app/<conversation_id>
// - Sidebar container: bard-sidenav or similar Material component
//
// If selectors break, open DevTools on gemini.google.com,
// inspect the sidebar and update CONVERSATION_ITEM_SELECTORS.
// ═══════════════════════════════════════════════════════════

import type { Conversation } from "../types";
import {
  PlatformAdapter,
  queryAllWithFallback,
  waitForElement,
  debounce,
} from "./adapter";

const SIDEBAR_SELECTORS = [
  "bard-sidenav-content",
  "[data-test-id='conversation-history']",
  "[data-test-id='side-nav']",
  "mat-sidenav-content",
  "mat-sidenav",
  "nav[aria-label]",
  "nav",
];

const CONVERSATION_ITEM_SELECTORS = [
  "a[href^='/app/']",
  "[data-test-id='conversation-item'] a",
  ".conversation-item a",
  "li a[href*='/app/']",
  // 2026 Gemini UI fallbacks
  "[data-conversation-id] a",
  "a[href*='gemini.google.com/app/']",
];

export class GeminiAdapter implements PlatformAdapter {
  platform = "gemini" as const;
  private observer: MutationObserver | null = null;
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;

  matches(url: string): boolean {
    return url.includes("gemini.google.com");
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

      if (!path.startsWith("/app/")) continue;

      const id = path.replace("/app/", "").split("?")[0].split("/")[0].trim();
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
        platform: "gemini",
        url: `https://gemini.google.com/app/${id}`,
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
        interval: 600,
        maxAttempts: 25,
      });

      const target = sidebar ?? document.body;
      console.log(`[Orenivo/Gemini] Observing: ${target.tagName}.${target.className.toString().slice(0, 50)}`);

      this.observer = new MutationObserver(debouncedCallback);
      this.observer.observe(target, {
        childList: true,
        subtree: true,
        characterData: false,
        attributes: false,
      });

      // Fire once immediately
      const convs = this.getConversations();
      if (convs.length > 0) {
        callback(convs);
      } else {
        // Retry after extra delay — Gemini hydrates slowly
        this.retryTimeout = setTimeout(() => callback(this.getConversations()), 3000);
      }
    };

    // Wait for document to settle
    if (document.readyState === "complete") {
      setTimeout(startObserving, 1500);
    } else {
      window.addEventListener("load", () => setTimeout(startObserving, 1500), { once: true });
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
