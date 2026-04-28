import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Orenivo — AI Folders for ChatGPT, Claude, Gemini, Grok & DeepSeek",
    description:
      "Folders, search & prompt templates for ChatGPT, Claude, Gemini, Grok and DeepSeek — all in one place. Free to use, no paywall.",
    version: "0.1.6",
    permissions: ["storage", "sidePanel", "activeTab"],
    host_permissions: [
      "https://chat.openai.com/*",
      "https://chatgpt.com/*",
      "https://claude.ai/*",
      "https://gemini.google.com/*",
      "https://chat.deepseek.com/*",
      "https://grok.com/*",
      "https://*.supabase.co/*",
    ],
    side_panel: {
      default_path: "sidepanel.html",
    },
    action: {
      default_title: "Open Orenivo",
    },
    icons: {
      16: "icons/icon-16.png",
      32: "icons/icon-32.png",
      48: "icons/icon-48.png",
      128: "icons/icon-128.png",
    },
  },
});
