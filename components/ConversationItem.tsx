import { useState, useRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { PlatformBadge } from "./PlatformBadge";
import { ConversationContextMenu } from "./ConversationContextMenu";
import type { Conversation } from "@/lib/types";

interface ConversationItemProps {
  conversation: Conversation;
  /** When true, renders as the DragOverlay ghost — no drag handlers attached */
  isDragOverlay?: boolean;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (conv: Conversation) => void;
}

export function ConversationItem({ conversation, isDragOverlay = false, selectionMode = false, selected = false, onToggleSelect }: ConversationItemProps) {
  const { togglePinConversation } = useStore();
  const { t } = useTranslation();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handlePointerDown() {
    if (isDragOverlay || selectionMode) return;
    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null;
      onToggleSelect?.(conversation);
    }, 500);
  }

  function cancelLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  const draggableId = `${conversation.platform}:${conversation.id}`;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: draggableId,
    disabled: isDragOverlay,
    data: { conversation },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const timeAgo = getTimeAgo(conversation.lastAccessed, t("timeNow"), t("timeWeeks"));

  const handleContextMenu = (e: React.MouseEvent) => {
    if (selectionMode) return;
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  if (selectionMode) {
    return (
      <div
        onClick={() => onToggleSelect?.(conversation)}
        className={[
          "flex items-center gap-2 px-2 py-1.5 rounded-md transition-all select-none cursor-pointer",
          selected ? "bg-brand-500/15 ring-1 ring-brand-500/30" : "hover:bg-white/5",
        ].join(" ")}
      >
        <div className={[
          "w-3.5 h-3.5 rounded flex-shrink-0 border transition-colors flex items-center justify-center",
          selected ? "bg-brand-500 border-brand-500" : "border-gray-600",
        ].join(" ")}>
          {selected && <span className="text-[8px] text-white font-bold">✓</span>}
        </div>
        <PlatformBadge platform={conversation.platform} />
        <span className="text-[13px] text-gray-200 truncate flex-1" title={conversation.title}>
          {conversation.title}
        </span>
      </div>
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onPointerDown={(e) => { handlePointerDown(); (listeners as any)?.onPointerDown?.(e); }}
        onPointerUp={cancelLongPress}
        onPointerMove={cancelLongPress}
        onPointerLeave={cancelLongPress}
        onContextMenu={handleContextMenu}
        className={[
          "flex items-center gap-2 px-2 py-1.5 rounded-md group transition-all select-none",
          isDragOverlay
            ? "bg-surface-light border border-brand-500/30 shadow-xl shadow-black/40 cursor-grabbing opacity-95"
            : "hover:bg-white/5 cursor-grab active:cursor-grabbing",
          isDragging ? "opacity-30" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <PlatformBadge platform={conversation.platform} />
        <a
          href={conversation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-gray-200 truncate flex-1 hover:text-white transition-colors"
          title={conversation.title}
        >
          {conversation.title}
        </a>
        {conversation.pinned && (
          <span className="text-amber-400 text-[10px] flex-shrink-0">📌</span>
        )}
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              togglePinConversation(conversation.id, conversation.platform);
            }}
            className="w-5 h-5 rounded flex items-center justify-center text-[9px] hover:bg-white/10 text-gray-500 hover:text-gray-300"
            title={conversation.pinned ? t("unpinAction") : t("pinAction")}
          >
            📌
          </button>
        </div>
        <span className="text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {timeAgo}
        </span>
      </div>

      {contextMenu && (
        <ConversationContextMenu
          conversation={conversation}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}

function getTimeAgo(timestamp: number, nowLabel: string, weeksLabel: string): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return nowLabel;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}${weeksLabel}`;
}
