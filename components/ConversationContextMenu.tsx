// ═══════════════════════════════════════════════════════════
// ORENIVO — Conversation Context Menu
// Right-click menu: open, pin, move to folder, remove
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import type { Conversation, Folder } from "@/lib/types";

interface Props {
  conversation: Conversation;
  x: number;
  y: number;
  onClose: () => void;
}

export function ConversationContextMenu({ conversation, x, y, onClose }: Props) {
  const { folders, togglePinConversation, moveToFolder, removeConversation } = useStore();
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const [showFolders, setShowFolders] = useState(false);

  // Close on outside click or Escape
  useEffect(() => {
    const handleDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  // Adjust position so the menu never overflows the viewport
  const menuWidth = 200;
  const menuHeight = showFolders ? 260 : 160;
  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 8);
  const adjustedY = Math.min(y, window.innerHeight - menuHeight - 8);

  // Only root-level folders available for "move to folder"
  const rootFolders = folders.filter((f) => f.parentId === null);

  const handlePin = () => {
    togglePinConversation(conversation.id, conversation.platform);
    onClose();
  };

  const handleMove = (folderId: string | null) => {
    moveToFolder(conversation.id, conversation.platform, folderId);
    onClose();
  };

  const handleRemove = () => {
    removeConversation(conversation.id, conversation.platform);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{ left: adjustedX, top: adjustedY }}
      className="fixed z-[9999] w-[200px] bg-[#12121e] border border-white/10 rounded-xl shadow-2xl shadow-black/60 py-1 overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Open in new tab */}
      <a
        href={conversation.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-300 hover:bg-white/5 transition-colors cursor-pointer no-underline"
      >
        <span className="text-[14px] opacity-70">↗</span>
        {t("ctxOpenNewTab")}
      </a>

      <div className="h-px bg-white/[0.06] my-1" />

      {/* Pin / Unpin */}
      <button
        onClick={handlePin}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-300 hover:bg-white/5 transition-colors text-left"
      >
        <span className="text-[12px]">📌</span>
        {conversation.pinned ? t("unpinAction") : t("pinAction")}
      </button>

      {/* Move to folder */}
      <button
        onClick={() => setShowFolders((v) => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-300 hover:bg-white/5 transition-colors text-left"
      >
        <span className="text-[12px]">📁</span>
        <span className="flex-1">{t("ctxMoveToFolder")}</span>
        <span className={`text-[10px] text-gray-500 transition-transform ${showFolders ? "rotate-90" : ""}`}>›</span>
      </button>

      {/* Folder list — inline expansion */}
      {showFolders && (
        <div className="mx-1 mb-1 border border-white/[0.06] rounded-lg overflow-hidden max-h-[140px] overflow-y-auto">
          {/* Unfiled option */}
          <button
            onClick={() => handleMove(null)}
            className={[
              "w-full flex items-center gap-2 px-3 py-1.5 text-[12px] transition-colors text-left",
              conversation.folderId === null
                ? "text-brand-400 bg-brand-500/10"
                : "text-gray-400 hover:bg-white/5",
            ].join(" ")}
          >
            <span className="w-2 h-2 rounded-sm bg-gray-600 flex-shrink-0" />
            {t("ctxUnfiled")}
          </button>
          {rootFolders.map((folder) => (
            <FolderOption
              key={folder.id}
              folder={folder}
              isActive={conversation.folderId === folder.id}
              onSelect={() => handleMove(folder.id)}
            />
          ))}
        </div>
      )}

      <div className="h-px bg-white/[0.06] my-1" />

      {/* Remove */}
      <button
        onClick={handleRemove}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-400 hover:bg-red-500/10 transition-colors text-left"
      >
        <span className="text-[12px]">🗑</span>
        {t("ctxRemove")}
      </button>
    </div>
  );
}

function FolderOption({
  folder,
  isActive,
  onSelect,
}: {
  folder: Folder;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={[
        "w-full flex items-center gap-2 px-3 py-1.5 text-[12px] transition-colors text-left",
        isActive
          ? "text-brand-400 bg-brand-500/10"
          : "text-gray-400 hover:bg-white/5",
      ].join(" ")}
    >
      <span
        className="w-2 h-2 rounded-sm flex-shrink-0"
        style={{ background: folder.color }}
      />
      <span className="truncate">{folder.name}</span>
    </button>
  );
}
