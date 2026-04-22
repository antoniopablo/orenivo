// ═══════════════════════════════════════════════════════════
// CHATORIO — Side Panel App
// Main entry point for the side panel React application
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useStore } from "@/lib/store";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { PlatformFilter } from "@/components/PlatformFilter";
import { TabBar } from "@/components/TabBar";
import { FolderList } from "@/components/FolderList";
import { PromptList } from "@/components/PromptList";
import { Settings } from "@/components/Settings";
import { StatusBar } from "@/components/StatusBar";
import { ConversationItem } from "@/components/ConversationItem";
import { Onboarding } from "@/components/Onboarding";
import { ReviewBanner } from "@/components/ReviewBanner";
import { isOnboardingDone, setOnboardingDone, getConversations, getInstallDate, isReviewDismissed } from "@/lib/storage";
import type { Conversation, Folder } from "@/lib/types";

// Global search input ref — used by Cmd+K shortcut
export const searchInputRef = { current: null as HTMLInputElement | null };

export default function App() {
  const { loadAll, updateConversations, conversations, moveToFolder, reorderFolders, isLoading, activeTab } = useStore();
  const [draggingConv, setDraggingConv] = useState<Conversation | null>(null);
  const [draggingFolder, setDraggingFolder] = useState<Folder | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReviewBanner, setShowReviewBanner] = useState(false);

  // 5px activation distance so clicks still work normally
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Always read fresh conversations from store to avoid stale closure in handlers
  const getConversations = () => useStore.getState().conversations;

  useEffect(() => {
    loadAll();
    Promise.all([isOnboardingDone(), getConversations()]).then(([done, existingConvs]) => {
      if (!done) {
        if (existingConvs.length > 0) {
          // Returning user with data — skip onboarding silently
          setOnboardingDone();
        } else {
          setShowOnboarding(true);
        }
      }
    });

    // Show review banner after 3 days of use
    Promise.all([getInstallDate(), isReviewDismissed()]).then(([installDate, dismissed]) => {
      if (!dismissed) {
        const daysSinceInstall = (Date.now() - installDate) / (1000 * 60 * 60 * 24);
        if (daysSinceInstall >= 3) {
          setShowReviewBanner(true);
        }
      }
    });

    const listener = (message: any) => {
      if (message.type === "CONVERSATIONS_UPDATE" && message.conversations) {
        updateConversations(message.conversations);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  // Cmd+K / Ctrl+K → focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
        useStore.getState().setSearchQuery("");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleDragStart(event: DragStartEvent) {
    const activeId = String(event.active.id);
    if (activeId.startsWith("folder:")) {
      const folderId = activeId.replace("folder:", "");
      const folder = useStore.getState().folders.find((f) => f.id === folderId);
      setDraggingFolder(folder ?? null);
    } else {
      const conv = getConversations().find(
        (c) => `${c.platform}:${c.id}` === activeId
      );
      setDraggingConv(conv ?? null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingConv(null);
    setDraggingFolder(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Folder reorder
    if (activeId.startsWith("folder:") && overId.startsWith("folder:")) {
      const activeFolderId = activeId.replace("folder:", "");
      const overFolderId = overId.replace("folder:", "");
      if (activeFolderId !== overFolderId) {
        reorderFolders(activeFolderId, overFolderId);
      }
      return;
    }

    // Conversation → folder
    const conv = getConversations().find(
      (c) => `${c.platform}:${c.id}` === activeId
    );
    if (!conv) return;
    const targetFolderId = overId === "unfiled" ? null : overId.replace("folder:", "");
    if (conv.folderId === targetFolderId) return;
    moveToFolder(conv.id, conv.platform, targetFolderId);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 animate-pulse" />
          <span className="text-xs text-gray-500">{useStore.getState().language === "es" ? "Cargando..." : useStore.getState().language === "fr" ? "Chargement..." : useStore.getState().language === "pt" ? "Carregando..." : "Loading..."}</span>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <Onboarding onDone={() => setShowOnboarding(false)} />;
  }

  if (showSettings) {
    return <Settings onClose={() => setShowSettings(false)} />;
  }

  return (
    // DndContext wraps the entire app so DragOverlay renders outside the
    // overflow-y:auto scroll container and is never clipped
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen bg-surface">
        <Header onSettings={() => setShowSettings(true)} />
        <div className="px-3 pt-2 pb-1.5 border-b border-white/5 space-y-2">
          <SearchBar />
          <PlatformFilter />
        </div>
        <TabBar />
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {activeTab === "prompts" ? (
            <PromptList />
          ) : (
            <FolderList draggingConv={draggingConv} />
          )}
        </div>
        {showReviewBanner && (
          <ReviewBanner onDismiss={() => setShowReviewBanner(false)} />
        )}
        <StatusBar />
      </div>

      {/* Overlay renders at the root level — never clipped by overflow */}
      <DragOverlay>
        {draggingConv ? (
          <ConversationItem conversation={draggingConv} isDragOverlay />
        ) : draggingFolder ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-light border border-brand-500/30 shadow-xl shadow-black/40 opacity-95 cursor-grabbing">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: draggingFolder.color }} />
            <span className="text-[13px] font-medium text-gray-100">{draggingFolder.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
