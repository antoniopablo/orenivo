// ═══════════════════════════════════════════════════════════
// CHATORIO — Zustand Store
// Central state management for the side panel UI
// ═══════════════════════════════════════════════════════════

import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";
import type { User } from "@supabase/supabase-js";
import type { Folder, Conversation, PromptTemplate, Platform } from "../types";
import { FOLDER_COLORS } from "../types";
import * as storage from "../storage";
import { type Plan, canCreateFolder, canCreatePrompt } from "../plans";
import type { Locale } from "../i18n";
import { getUser, getUserPlan, signOut as supabaseSignOut, syncFolders, syncConversations, syncPrompts, fetchCloudData } from "../supabase";

// Track sync interval so we can clear it on sign out
let syncIntervalId: ReturnType<typeof setInterval> | null = null;
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

interface OrenivoStore {
  // State
  plan: Plan;
  language: Locale;
  folders: Folder[];
  conversations: Conversation[];
  prompts: PromptTemplate[];
  searchQuery: string;
  platformFilter: Platform | "all";
  activeTab: "folders" | "recent" | "pinned" | "prompts";
  isLoading: boolean;
  user: User | null;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  justUpgraded: boolean;

  // Actions — Data loading
  loadAll: () => Promise<void>;

  // Actions — Auth & Cloud Sync
  loadUser: () => Promise<void>;
  refreshPlan: () => Promise<void>;
  signOut: () => Promise<void>;
  syncToCloud: () => Promise<void>;
  dismissUpgrade: () => void;

  // Actions — Folders
  // Returns false if the free tier folder limit has been reached
  createFolder: (name: string, parentId?: string | null) => Promise<boolean>;
  renameFolder: (id: string, name: string) => Promise<void>;
  changeFolderColor: (id: string, color: string) => Promise<void>;
  removeFolder: (id: string) => Promise<void>;
  reorderFolders: (activeFolderId: string, overFolderId: string) => Promise<void>;

  // Actions — Conversations
  updateConversations: (convs: Conversation[]) => Promise<void>;
  moveToFolder: (convId: string, platform: string, folderId: string | null) => Promise<void>;
  moveManyToFolder: (keys: Array<{ id: string; platform: string }>, folderId: string | null) => Promise<void>;
  togglePinConversation: (convId: string, platform: string) => Promise<void>;
  removeConversation: (convId: string, platform: string) => Promise<void>;

  // Actions — Prompts
  // Returns false if the free tier prompt limit has been reached
  createPrompt: (name: string, text: string, platform?: Platform | "all") => Promise<boolean>;
  removePrompt: (id: string) => Promise<void>;

  // Actions — UI
  setSearchQuery: (query: string) => void;
  setPlatformFilter: (platform: Platform | "all") => void;
  setActiveTab: (tab: "folders" | "recent" | "pinned" | "prompts") => void;
  setLanguage: (lang: Locale) => Promise<void>;
}

export const useStore = create<OrenivoStore>((set, get) => ({
  plan: "free",
  language: "es",
  folders: [],
  conversations: [],
  prompts: [],
  searchQuery: "",
  platformFilter: "all",
  activeTab: "folders",
  isLoading: true,
  user: null,
  isSyncing: false,
  lastSyncedAt: null,
  justUpgraded: false,

  // ── Data loading ──

  loadAll: async () => {
    set({ isLoading: true });
    const [folders, conversations, prompts, language] = await Promise.all([
      storage.getFolders(),
      storage.getConversations(),
      storage.getPrompts(),
      storage.getLanguage(),
    ]);
    set({ folders, conversations, prompts, language: language as Locale, isLoading: false });

    // Load user & plan in background (non-blocking)
    get().loadUser();
  },

  // ── Auth & Cloud Sync ──

  loadUser: async () => {
    const user = await getUser();
    if (!user) {
      set({ user: null, plan: "free" });
      return;
    }
    const plan = await getUserPlan();
    set({ user, plan });

    // If Pro, fetch cloud data and merge + start auto-sync
    if (plan === "pro") {
      const cloudData = await fetchCloudData();
      if (cloudData) {
        await Promise.all([
          storage.saveFolders(cloudData.folders),
          storage.saveConversations(cloudData.conversations),
          storage.savePrompts(cloudData.prompts),
        ]);
        set({
          folders: cloudData.folders,
          conversations: cloudData.conversations,
          prompts: cloudData.prompts,
        });
      }

      // Start auto-sync interval
      if (!syncIntervalId) {
        syncIntervalId = setInterval(() => {
          get().syncToCloud();
        }, SYNC_INTERVAL_MS);
      }
    }
  },

  refreshPlan: async () => {
    const user = await getUser();
    if (!user) return;
    const previousPlan = get().plan;
    const plan = await getUserPlan();
    set({ user, plan });

    // Detect free→pro transition
    if (previousPlan === "free" && plan === "pro") {
      set({ justUpgraded: true });

      // Start auto-sync on upgrade
      if (!syncIntervalId) {
        syncIntervalId = setInterval(() => {
          get().syncToCloud();
        }, SYNC_INTERVAL_MS);
      }

      // Initial sync after upgrade
      get().syncToCloud();
    }
  },

  dismissUpgrade: () => set({ justUpgraded: false }),

  signOut: async () => {
    await supabaseSignOut();
    if (syncIntervalId) {
      clearInterval(syncIntervalId);
      syncIntervalId = null;
    }
    set({ user: null, plan: "free", lastSyncedAt: null });
  },

  syncToCloud: async () => {
    const { user, plan, folders, conversations, prompts } = get();
    if (!user || plan !== "pro") return;
    set({ isSyncing: true });
    try {
      await Promise.all([
        syncFolders(folders),
        syncConversations(conversations),
        syncPrompts(prompts),
      ]);
      set({ lastSyncedAt: Date.now() });
    } finally {
      set({ isSyncing: false });
    }
  },

  // ── Folders ──

  createFolder: async (name, parentId = null) => {
    const { folders, plan } = get();
    if (!canCreateFolder(folders.length, plan)) return false;

    const newFolder: Folder = {
      id: storage.generateId(),
      name,
      color: FOLDER_COLORS[folders.length % FOLDER_COLORS.length],
      parentId,
      order: folders.filter((f) => f.parentId === parentId).length,
      createdAt: Date.now(),
    };
    await storage.addFolder(newFolder);
    set({ folders: [...folders, newFolder] });
    return true;
  },

  renameFolder: async (id, name) => {
    await storage.updateFolder(id, { name });
    set({
      folders: get().folders.map((f) =>
        f.id === id ? { ...f, name } : f
      ),
    });
  },

  changeFolderColor: async (id, color) => {
    await storage.updateFolder(id, { color });
    set({
      folders: get().folders.map((f) =>
        f.id === id ? { ...f, color } : f
      ),
    });
  },

  reorderFolders: async (activeFolderId, overFolderId) => {
    const { folders } = get();
    const rootFolders = folders
      .filter((f) => f.parentId === null)
      .sort((a, b) => a.order - b.order);
    const activeIndex = rootFolders.findIndex((f) => f.id === activeFolderId);
    const overIndex = rootFolders.findIndex((f) => f.id === overFolderId);
    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return;
    const reordered = arrayMove(rootFolders, activeIndex, overIndex);
    const updatedFolders = folders.map((f) => {
      const newOrder = reordered.findIndex((r) => r.id === f.id);
      return newOrder !== -1 ? { ...f, order: newOrder } : f;
    });
    set({ folders: updatedFolders });
    await storage.saveFolders(updatedFolders);
  },

  removeFolder: async (id) => {
    await storage.deleteFolder(id);
    // Reload from storage to get clean state (cascade deletes children)
    const [folders, conversations] = await Promise.all([
      storage.getFolders(),
      storage.getConversations(),
    ]);
    set({ folders, conversations });
  },

  // ── Conversations ──

  updateConversations: async (convs) => {
    await storage.upsertConversations(convs);
    const conversations = await storage.getConversations();
    set({ conversations });
  },

  moveToFolder: async (convId, platform, folderId) => {
    await storage.moveConversationToFolder(convId, platform, folderId);
    set({
      conversations: get().conversations.map((c) =>
        c.id === convId && c.platform === platform
          ? { ...c, folderId }
          : c
      ),
    });
  },

  moveManyToFolder: async (keys, folderId) => {
    const keySet = new Set(keys.map((k) => `${k.platform}:${k.id}`));
    const conversations = get().conversations.map((c) =>
      keySet.has(`${c.platform}:${c.id}`) ? { ...c, folderId } : c
    );
    await storage.saveConversations(conversations);
    set({ conversations });
  },

  togglePinConversation: async (convId, platform) => {
    await storage.togglePin(convId, platform);
    set({
      conversations: get().conversations.map((c) =>
        c.id === convId && c.platform === platform
          ? { ...c, pinned: !c.pinned }
          : c
      ),
    });
  },

  removeConversation: async (convId, platform) => {
    await storage.deleteConversation(convId, platform);
    set({
      conversations: get().conversations.filter(
        (c) => !(c.id === convId && c.platform === platform)
      ),
    });
  },

  // ── Prompts ──

  createPrompt: async (name, text, platform = "all") => {
    const { prompts, plan } = get();
    if (!canCreatePrompt(prompts.length, plan)) return false;

    const newPrompt: PromptTemplate = {
      id: storage.generateId(),
      name,
      text,
      folderId: null,
      platform,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await storage.addPrompt(newPrompt);
    set({ prompts: [...prompts, newPrompt] });
    return true;
  },

  removePrompt: async (id) => {
    await storage.deletePrompt(id);
    set({ prompts: get().prompts.filter((p) => p.id !== id) });
  },

  // ── UI ──

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setPlatformFilter: (platformFilter) => set({ platformFilter }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setLanguage: async (language) => {
    set({ language });
    await storage.saveLanguage(language);
  },
}));
