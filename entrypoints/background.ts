// ═══════════════════════════════════════════════════════════
// ORENIVO — Background Service Worker
// Handles: side panel toggling, message routing between
// content scripts and side panel, platform detection
// ═══════════════════════════════════════════════════════════

export default defineBackground(() => {
  console.log("[Orenivo] Background service worker started");

  // Open side panel when extension icon is clicked
  chrome.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      try {
        await chrome.sidePanel.open({ tabId: tab.id });
      } catch (err) {
        console.error("[Orenivo] Failed to open side panel:", err);
      }
    }
  });

  // Enable side panel on supported sites
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  // Track which tabs have a detected platform (tabId → platform)
  const activeTabs = new Map<number, string>();

  function broadcastActivePlatforms() {
    const platforms = [...new Set(activeTabs.values())];
    chrome.runtime.sendMessage({ type: "ACTIVE_PLATFORMS_UPDATE", platforms }).catch(() => {});
  }

  // Clean up when a tab closes
  chrome.tabs.onRemoved.addListener((tabId) => {
    if (activeTabs.has(tabId)) {
      activeTabs.delete(tabId);
      broadcastActivePlatforms();
    }
  });

  const ALLOWED_ORIGINS = new Set([
    "https://chat.openai.com",
    "https://chatgpt.com",
    "https://claude.ai",
    "https://gemini.google.com",
    "https://chat.deepseek.com",
  ]);

  function isAllowedSender(sender: chrome.runtime.MessageSender): boolean {
    // Messages from the extension's own pages (side panel, popup) have no tab
    if (!sender.tab) return true;
    if (!sender.origin) return false;
    return ALLOWED_ORIGINS.has(sender.origin);
  }

  // Route messages between content scripts and side panel
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!isAllowedSender(sender)) return false;

    if (message.type === "CONVERSATIONS_UPDATE") {
      // Forward to all extension pages (side panel will pick this up)
      chrome.runtime
        .sendMessage(message)
        .catch(() => {
          // Side panel might not be open, that's OK
        });
    }

    if (message.type === "PLATFORM_DETECTED") {
      const tabId = sender.tab?.id;
      if (tabId) {
        activeTabs.set(tabId, message.platform);
        broadcastActivePlatforms();
      }
    }

    if (message.type === "OPEN_SIDEPANEL" && sender.tab?.id) {
      chrome.sidePanel.open({ tabId: sender.tab.id });
    }

    return false; // No async response needed
  });
});
