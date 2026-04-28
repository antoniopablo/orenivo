// ═══════════════════════════════════════════════════════════
// ORENIVO — Supabase Client
// Auth + plan checks + cloud sync for Pro users
// ═══════════════════════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";
import type { User, Session } from "@supabase/supabase-js";
import type { Folder, Conversation, PromptTemplate } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Chrome extensions: persist session in chrome.storage.local manually
    // to avoid localStorage restrictions in service workers
    persistSession: true,
    storage: {
      getItem: async (key: string) => {
        try {
          const result = await chrome.storage.local.get(key);
          return result[key] ?? null;
        } catch {
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          await chrome.storage.local.set({ [key]: value });
        } catch {}
      },
      removeItem: async (key: string) => {
        try {
          await chrome.storage.local.remove(key);
        } catch {}
      },
    },
  },
});

// ── Auth ──

export async function requestOtp(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  return { error: error?.message ?? null };
}

export async function verifyOtp(
  email: string,
  token: string
): Promise<{ user: User | null; error: string | null }> {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  return { user: data.user ?? null, error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

// ── Plan ──

export type DbPlan = "free" | "pro";

interface DbUser {
  id: string;
  email: string;
  plan: DbPlan;
  plan_expires_at: string | null;
  lemon_squeezy_customer_id: string | null;
}

export async function getUserPlan(): Promise<DbPlan> {
  const user = await getUser();
  if (!user) return "free";

  const { data, error } = await supabase
    .from("users")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  if (error || !data) return "free";

  // Check expiry
  if (data.plan_expires_at && new Date(data.plan_expires_at) < new Date()) {
    return "free";
  }

  return (data as DbUser).plan ?? "free";
}

// ── Cloud Sync (Pro only) ──

export async function syncFolders(folders: Folder[]): Promise<void> {
  const user = await getUser();
  if (!user) return;

  const rows = folders.map((f) => ({
    id: f.id,
    user_id: user.id,
    name: f.name,
    color: f.color,
    parent_id: f.parentId ?? null,
    order: f.order,
    created_at: f.createdAt,
    updated_at: Date.now(),
  }));

  await supabase
    .from("folders")
    .upsert(rows, { onConflict: "id" });
}

export async function syncConversations(conversations: Conversation[]): Promise<void> {
  const user = await getUser();
  if (!user) return;

  const rows = conversations.map((c) => ({
    id: c.id,
    platform: c.platform,
    user_id: user.id,
    title: c.title,
    url: c.url,
    folder_id: c.folderId ?? null,
    pinned: c.pinned ?? false,
    last_accessed: c.lastAccessed,
    updated_at: Date.now(),
  }));

  await supabase
    .from("conversations")
    .upsert(rows, { onConflict: "id,platform" });
}

export async function syncPrompts(prompts: PromptTemplate[]): Promise<void> {
  const user = await getUser();
  if (!user) return;

  const rows = prompts.map((p) => ({
    id: p.id,
    user_id: user.id,
    name: p.name,
    text: p.text,
    platform: p.platform,
    folder_id: p.folderId ?? null,
    created_at: p.createdAt,
    updated_at: Date.now(),
  }));

  await supabase
    .from("prompts")
    .upsert(rows, { onConflict: "id" });
}

export async function fetchCloudData(): Promise<{
  folders: Folder[];
  conversations: Conversation[];
  prompts: PromptTemplate[];
} | null> {
  const user = await getUser();
  if (!user) return null;

  const [foldersRes, convsRes, promptsRes] = await Promise.all([
    supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null),
    supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null),
    supabase
      .from("prompts")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null),
  ]);

  if (foldersRes.error || convsRes.error || promptsRes.error) return null;

  const folders: Folder[] = (foldersRes.data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    color: r.color,
    parentId: r.parent_id ?? null,
    order: r.order,
    createdAt: r.created_at,
  }));

  const conversations: Conversation[] = (convsRes.data ?? []).map((r: any) => ({
    id: r.id,
    platform: r.platform,
    title: r.title,
    url: r.url,
    folderId: r.folder_id ?? null,
    pinned: r.pinned ?? false,
    lastAccessed: r.last_accessed,
  }));

  const prompts: PromptTemplate[] = (promptsRes.data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    text: r.text,
    platform: r.platform,
    folderId: r.folder_id ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  return { folders, conversations, prompts };
}
