// ═══════════════════════════════════════════════════════════
// ORENIVO — Platform Adapter Interface
// Each AI platform has an adapter that implements this interface.
// When a platform updates their DOM, only the adapter changes.
// ═══════════════════════════════════════════════════════════

import type { Platform, Conversation } from "../types";

export interface PlatformAdapter {
  platform: Platform;

  /** Check if this adapter matches the current page */
  matches(url: string): boolean;

  /** Extract conversation list from the page DOM */
  getConversations(): Conversation[];

  /** Set up a MutationObserver to watch for conversation list changes */
  observeChanges(callback: (conversations: Conversation[]) => void): void;

  /** Clean up observers */
  disconnect(): void;
}

/**
 * Helper: safely query a DOM element with fallback selectors.
 * Returns the first match from a list of selectors.
 */
export function queryWithFallback(
  selectors: string[],
  root: Element | Document = document
): Element | null {
  for (const sel of selectors) {
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch {
      // Invalid selector, skip
    }
  }
  return null;
}

/**
 * Helper: query all matching elements with fallback selectors.
 */
export function queryAllWithFallback(
  selectors: string[],
  root: Element | Document = document
): Element[] {
  for (const sel of selectors) {
    try {
      const els = root.querySelectorAll(sel);
      if (els.length > 0) return Array.from(els);
    } catch {
      // Invalid selector, skip
    }
  }
  return [];
}

/**
 * Retry helper — polls a condition every `interval`ms up to `maxAttempts` times.
 * Useful for waiting for sidebar DOM to appear after SPA navigation.
 */
export function waitForElement(
  selectors: string[],
  { interval = 500, maxAttempts = 20 } = {}
): Promise<Element | null> {
  return new Promise((resolve) => {
    let attempts = 0;
    const check = () => {
      const el = queryWithFallback(selectors);
      if (el) {
        resolve(el);
        return;
      }
      attempts++;
      if (attempts >= maxAttempts) {
        resolve(null);
        return;
      }
      setTimeout(check, interval);
    };
    check();
  });
}

/**
 * Standard debounce helper for MutationObserver callbacks.
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): T {
  let timeout: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  }) as T;
}
