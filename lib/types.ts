// ═══════════════════════════════════════════════════════════
// CHATORIO — Core Types
// ═══════════════════════════════════════════════════════════

export type Platform = "chatgpt" | "claude" | "gemini" | "deepseek" | "grok";

export interface PlatformInfo {
  id: Platform;
  name: string;
  color: string;
  icon: string;
  hostPatterns: string[];
}

export const PLATFORMS: Record<Platform, PlatformInfo> = {
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT",
    color: "#10a37f",
    icon: "⬡",
    hostPatterns: ["chat.openai.com", "chatgpt.com"],
  },
  claude: {
    id: "claude",
    name: "Claude",
    color: "#d97706",
    icon: "◈",
    hostPatterns: ["claude.ai"],
  },
  gemini: {
    id: "gemini",
    name: "Gemini",
    color: "#4285f4",
    icon: "✦",
    hostPatterns: ["gemini.google.com"],
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    color: "#6366f1",
    icon: "◆",
    hostPatterns: ["chat.deepseek.com"],
  },
  grok: {
    id: "grok",
    name: "Grok",
    color: "#000000",
    icon: "✕",
    hostPatterns: ["grok.com"],
  },
};

export interface Conversation {
  id: string;
  title: string;
  platform: Platform;
  url: string;
  lastAccessed: number; // timestamp
  pinned: boolean;
  folderId: string | null; // null = unfiled
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  parentId: string | null; // null = root level
  order: number;
  createdAt: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  text: string;
  folderId: string | null;
  platform: Platform | "all";
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  folders: Folder[];
  conversations: Conversation[];
  prompts: PromptTemplate[];
}

export const FOLDER_COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

// Messages between content script <-> background <-> sidepanel
export type MessageType =
  | { type: "GET_CONVERSATIONS"; platform: Platform }
  | { type: "CONVERSATIONS_UPDATE"; conversations: Conversation[] }
  | { type: "PLATFORM_DETECTED"; platform: Platform }
  | { type: "OPEN_SIDEPANEL" };
