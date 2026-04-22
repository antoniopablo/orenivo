// ═══════════════════════════════════════════════════════════
// ORENIVO — Storage Layer
// Abstraction over chrome.storage.local for all persistent data
// ═══════════════════════════════════════════════════════════

import type { Folder, Conversation, PromptTemplate, AppState } from "./types";

const STORAGE_KEYS = {
  // Keep legacy keys to avoid breaking existing user data after the rebrand.
  folders: "chatorio_folders",
  conversations: "chatorio_conversations",
  prompts: "chatorio_prompts",
  settings: "chatorio_settings",
  onboardingDone: "chatorio_onboarding_done",
  language: "chatorio_language",
  installDate: "orenivo_install_date",
  reviewDismissed: "orenivo_review_dismissed",
} as const;

// ── Generic helpers ──

async function get<T>(key: string, fallback: T): Promise<T> {
  try {
    const result = await chrome.storage.local.get(key);
    return result[key] ?? fallback;
  } catch {
    console.warn(`[Orenivo] Storage read failed for key: ${key}`);
    return fallback;
  }
}

async function set(key: string, value: unknown): Promise<void> {
  try {
    await chrome.storage.local.set({ [key]: value });
  } catch (err) {
    console.error(`[Orenivo] Storage write failed for key: ${key}`, err);
  }
}

// ── Folders ──

export async function getFolders(): Promise<Folder[]> {
  return get<Folder[]>(STORAGE_KEYS.folders, []);
}

export async function saveFolders(folders: Folder[]): Promise<void> {
  return set(STORAGE_KEYS.folders, folders);
}

export async function addFolder(folder: Folder): Promise<void> {
  const folders = await getFolders();
  folders.push(folder);
  await saveFolders(folders);
}

export async function updateFolder(
  id: string,
  updates: Partial<Folder>
): Promise<void> {
  const folders = await getFolders();
  const idx = folders.findIndex((f) => f.id === id);
  if (idx !== -1) {
    folders[idx] = { ...folders[idx], ...updates };
    await saveFolders(folders);
  }
}

export async function deleteFolder(id: string): Promise<void> {
  let folders = await getFolders();
  // Also delete child folders
  const idsToDelete = new Set<string>();
  const collectChildren = (parentId: string) => {
    idsToDelete.add(parentId);
    folders
      .filter((f) => f.parentId === parentId)
      .forEach((f) => collectChildren(f.id));
  };
  collectChildren(id);

  folders = folders.filter((f) => !idsToDelete.has(f.id));
  await saveFolders(folders);

  // Unfiled conversations from deleted folders
  const conversations = await getConversations();
  const updated = conversations.map((c) =>
    idsToDelete.has(c.folderId ?? "") ? { ...c, folderId: null } : c
  );
  await saveConversations(updated);
}

// ── Conversations ──

export async function getConversations(): Promise<Conversation[]> {
  return get<Conversation[]>(STORAGE_KEYS.conversations, []);
}

export async function saveConversations(
  conversations: Conversation[]
): Promise<void> {
  return set(STORAGE_KEYS.conversations, conversations);
}

export async function upsertConversation(conv: Conversation): Promise<void> {
  const conversations = await getConversations();
  const idx = conversations.findIndex(
    (c) => c.id === conv.id && c.platform === conv.platform
  );
  if (idx !== -1) {
    // Preserve folder assignment and pin status
    conversations[idx] = {
      ...conv,
      folderId: conversations[idx].folderId,
      pinned: conversations[idx].pinned,
    };
  } else {
    conversations.push(conv);
  }
  await saveConversations(conversations);
}

export async function upsertConversations(
  newConvs: Conversation[]
): Promise<void> {
  const existing = await getConversations();
  const map = new Map(
    existing.map((c) => [`${c.platform}:${c.id}`, c])
  );

  for (const conv of newConvs) {
    const key = `${conv.platform}:${conv.id}`;
    const old = map.get(key);
    if (old) {
      map.set(key, {
        ...conv,
        folderId: old.folderId,
        pinned: old.pinned,
      });
    } else {
      map.set(key, conv);
    }
  }

  await saveConversations(Array.from(map.values()));
}

export async function moveConversationToFolder(
  conversationId: string,
  platform: string,
  folderId: string | null
): Promise<void> {
  const conversations = await getConversations();
  const idx = conversations.findIndex(
    (c) => c.id === conversationId && c.platform === platform
  );
  if (idx !== -1) {
    conversations[idx].folderId = folderId;
    await saveConversations(conversations);
  }
}

export async function togglePin(
  conversationId: string,
  platform: string
): Promise<void> {
  const conversations = await getConversations();
  const idx = conversations.findIndex(
    (c) => c.id === conversationId && c.platform === platform
  );
  if (idx !== -1) {
    conversations[idx].pinned = !conversations[idx].pinned;
    await saveConversations(conversations);
  }
}

export async function deleteConversation(
  conversationId: string,
  platform: string
): Promise<void> {
  const conversations = await getConversations();
  await saveConversations(
    conversations.filter(
      (c) => !(c.id === conversationId && c.platform === platform)
    )
  );
}

// ── Prompts ──

export async function getPrompts(): Promise<PromptTemplate[]> {
  return get<PromptTemplate[]>(STORAGE_KEYS.prompts, []);
}

export async function savePrompts(prompts: PromptTemplate[]): Promise<void> {
  return set(STORAGE_KEYS.prompts, prompts);
}

export async function addPrompt(prompt: PromptTemplate): Promise<void> {
  const prompts = await getPrompts();
  prompts.push(prompt);
  await savePrompts(prompts);
}

export async function deletePrompt(id: string): Promise<void> {
  const prompts = await getPrompts();
  await savePrompts(prompts.filter((p) => p.id !== id));
}

// ── Full state (for export/import) ──

export async function getFullState(): Promise<AppState> {
  const [folders, conversations, prompts] = await Promise.all([
    getFolders(),
    getConversations(),
    getPrompts(),
  ]);
  return { folders, conversations, prompts };
}

export async function importState(state: AppState): Promise<void> {
  await Promise.all([
    saveFolders(state.folders),
    saveConversations(state.conversations),
    savePrompts(state.prompts),
  ]);
}

// ── Onboarding ──

export async function isOnboardingDone(): Promise<boolean> {
  return get<boolean>(STORAGE_KEYS.onboardingDone, false);
}

export async function setOnboardingDone(): Promise<void> {
  return set(STORAGE_KEYS.onboardingDone, true);
}

// ── Language ──

export async function getLanguage(): Promise<string> {
  const stored = await get<string | null>(STORAGE_KEYS.language, null);
  if (stored) return stored;
  // Auto-detect from browser
  const lang = navigator.language.slice(0, 2);
  return ["es", "en", "fr", "pt"].includes(lang) ? lang : "en";
}

export async function saveLanguage(lang: string): Promise<void> {
  return set(STORAGE_KEYS.language, lang);
}

// ── Review prompt ──

export async function getInstallDate(): Promise<number> {
  const stored = await get<number | null>(STORAGE_KEYS.installDate, null);
  if (stored) return stored;
  // First call — record now as install date
  const now = Date.now();
  await set(STORAGE_KEYS.installDate, now);
  return now;
}

export async function isReviewDismissed(): Promise<boolean> {
  return get<boolean>(STORAGE_KEYS.reviewDismissed, false);
}

export async function setReviewDismissed(): Promise<void> {
  return set(STORAGE_KEYS.reviewDismissed, true);
}

// ── Utils ──

export function generateId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}
