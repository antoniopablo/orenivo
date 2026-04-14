import { useState, useMemo, useEffect, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useStore } from "@/lib/store";
import { ConversationItem } from "./ConversationItem";
import { FOLDER_COLORS } from "@/lib/types";
import type { Folder, Conversation } from "@/lib/types";
import { FREE_LIMITS, getRemainingFolders } from "@/lib/plans";
import { useTranslation } from "@/lib/i18n";

// ── Droppable unfiled zone ───────────────────────────────────────────────────

function DroppableUnfiledZone({ children }: { children: (isOver: boolean) => React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "unfiled" });
  return <div ref={setNodeRef}>{children(isOver)}</div>;
}

// ── Main FolderList ──────────────────────────────────────────────────────────

interface FolderListProps {
  /** Currently dragged conversation (lifted from App-level DndContext) */
  draggingConv: Conversation | null;
}

export function FolderList({ draggingConv }: FolderListProps) {
  const { t } = useTranslation();
  const {
    plan,
    folders,
    conversations,
    searchQuery,
    platformFilter,
    activeTab,
    createFolder,
  } = useStore();

  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);

  // Collapse / expand all
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [commandSeq, setCommandSeq] = useState(0);

  const handleToggleAll = () => {
    setAllCollapsed((prev) => !prev);
    setCommandSeq((s) => s + 1);
  };

  const remainingFolders = getRemainingFolders(folders.length, plan);
  const atFolderLimit = remainingFolders === 0;

  const filtered = useMemo(() => {
    let result = conversations;
    if (platformFilter !== "all") {
      result = result.filter((c) => c.platform === platformFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.title.toLowerCase().includes(q));
    }
    return result;
  }, [conversations, platformFilter, searchQuery]);

  // ── Pinned / Recent tabs — no DnD needed ─────────────────────────────────

  if (activeTab === "pinned") {
    const pinned = filtered.filter((c) => c.pinned);
    return (
      <div className="space-y-0.5">
        {pinned.length === 0 ? (
          <EmptyState message={t("noSearchResults")} />
        ) : (
          pinned.map((c) => (
            <ConversationItem key={`${c.platform}:${c.id}`} conversation={c} />
          ))
        )}
      </div>
    );
  }

  if (activeTab === "recent") {
    const recent = [...filtered]
      .sort((a, b) => b.lastAccessed - a.lastAccessed)
      .slice(0, 30);
    return (
      <div className="space-y-0.5">
        {recent.length === 0 ? (
          <EmptyState message={t("noSearchResults")} />
        ) : (
          recent.map((c) => (
            <ConversationItem key={`${c.platform}:${c.id}`} conversation={c} />
          ))
        )}
      </div>
    );
  }

  // ── Folders tab ───────────────────────────────────────────────────────────

  const rootFolders = folders
    .filter((f) => f.parentId === null)
    .sort((a, b) => a.order - b.order);

  const unfiled = filtered
    .filter((c) => c.folderId === null)
    .sort((a, b) => b.lastAccessed - a.lastAccessed);

  return (
    <div className="space-y-0.5">
      {/* New folder button / form / limit nudge */}
      {showNewFolder ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (newFolderName.trim()) {
              const created = await createFolder(newFolderName.trim());
              if (created) {
                setNewFolderName("");
                setShowNewFolder(false);
              }
            }
          }}
          className="flex items-center gap-1.5 px-2 py-1.5"
        >
          <input
            autoFocus
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onBlur={() => {
              if (!newFolderName.trim()) setShowNewFolder(false);
            }}
            placeholder={t("folderNamePlaceholder")}
            className="flex-1 bg-white/5 border border-brand-500/30 rounded px-2 py-1 text-xs text-white placeholder-gray-600 outline-none"
          />
          <button
            type="submit"
            className="text-brand-400 text-xs font-medium px-2 py-1 hover:bg-brand-500/10 rounded"
          >
            ✓
          </button>
          <button
            type="button"
            onClick={() => setShowNewFolder(false)}
            className="text-gray-500 text-xs px-2 py-1 hover:bg-white/5 rounded"
          >
            ✕
          </button>
        </form>
      ) : atFolderLimit ? (
        <div className="px-2 py-2 rounded-md border border-dashed border-amber-500/30 bg-amber-500/5">
          <p className="text-[10px] text-amber-400/80 leading-relaxed">
            {t("folderLimitReached", { n: FREE_LIMITS.folders })}{" "}
            <span className="text-amber-400 font-medium">{t("upgradeToPro")}</span>{" "}
            {t("unlimitedFolders")}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNewFolder(true)}
            className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] text-brand-400 hover:bg-brand-500/10 transition-colors"
          >
            <span className="w-5 h-5 rounded-md border border-dashed border-brand-500/40 flex items-center justify-center text-[10px]">
              +
            </span>
            {t("newFolder")}
            {remainingFolders !== null && (
              <span className="ml-auto text-[10px] text-gray-600">
                {folders.length}/{FREE_LIMITS.folders}
              </span>
            )}
          </button>
          {rootFolders.length > 0 && (
            <button
              onClick={handleToggleAll}
              className="px-2 py-1.5 rounded-md text-[13px] text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors flex-shrink-0"
              title={allCollapsed ? "Expandir todo" : "Colapsar todo"}
            >
              {allCollapsed ? "⊞" : "⊟"}
            </button>
          )}
        </div>
      )}

      {/* Folder tree — SortableContext enables drag-to-reorder */}
      <SortableContext
        items={rootFolders.map((f) => `folder:${f.id}`)}
        strategy={verticalListSortingStrategy}
      >
        {rootFolders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            conversations={filtered}
            allFolders={folders}
            expandCommand={allCollapsed ? "collapse" : "expand"}
            commandSeq={commandSeq}
          />
        ))}
      </SortableContext>

      {/* Unfiled section — visible when there are unfiled convs or during drag */}
      {(unfiled.length > 0 || draggingConv) && (
        <DroppableUnfiledZone>
          {(isOver) => (
            <div
              className={[
                "mt-3 pt-2 border-t transition-all rounded-md",
                isOver ? "border-brand-500/40 bg-brand-500/5 px-1" : "border-white/5",
              ].join(" ")}
            >
              <div className="px-2 py-1 text-[10px] text-gray-600 uppercase tracking-wider font-medium flex items-center gap-1.5">
                {t("unfiled")}
                {isOver && (
                  <span className="text-brand-400 normal-case tracking-normal font-normal">
                    {t("dropHere")}
                  </span>
                )}
                {unfiled.length > 0 && (
                  <span className="ml-auto">({unfiled.length})</span>
                )}
              </div>
              {unfiled.map((c) => (
                <ConversationItem key={`${c.platform}:${c.id}`} conversation={c} />
              ))}
            </div>
          )}
        </DroppableUnfiledZone>
      )}

      {rootFolders.length === 0 && unfiled.length === 0 && conversations.length === 0 && (
        <NoConversationsState />
      )}
      {rootFolders.length === 0 && unfiled.length === 0 && conversations.length > 0 && (
        <EmptyState message={t("noSearchResults")} />
      )}
    </div>
  );
}

// ── Folder Item ──────────────────────────────────────────────────────────────

function FolderItem({
  folder,
  conversations,
  allFolders,
  level = 0,
  expandCommand,
  commandSeq = 0,
}: {
  folder: Folder;
  conversations: Conversation[];
  allFolders: Folder[];
  level?: number;
  expandCommand?: "expand" | "collapse";
  commandSeq?: number;
}) {
  const [expanded, setExpanded] = useState(level === 0);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Sync with global expand/collapse command
  useEffect(() => {
    if (commandSeq === 0) return; // ignore initial render
    setExpanded(expandCommand === "expand");
  }, [commandSeq]); // eslint-disable-line react-hooks/exhaustive-deps
  const { removeFolder, renameFolder, changeFolderColor } = useStore();
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showColorPicker) return;
    function handleClick(e: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showColorPicker]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isOver,
    isDragging,
  } = useSortable({ id: `folder:${folder.id}`, disabled: level > 0 });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const childFolders = allFolders
    .filter((f) => f.parentId === folder.id)
    .sort((a, b) => a.order - b.order);

  const folderConvs = conversations.filter((c) => c.folderId === folder.id);
  const totalCount =
    folderConvs.length +
    childFolders.reduce(
      (acc, cf) => acc + conversations.filter((c) => c.folderId === cf.id).length,
      0
    );

  return (
    <div style={{ paddingLeft: level * 12, ...style }}>
      <div
        ref={setNodeRef}
        className={[
          "flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer group transition-all",
          isOver ? "bg-brand-500/15 ring-1 ring-brand-500/40" : "hover:bg-white/5",
        ].join(" ")}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Drag handle — only root folders, shows on hover */}
        {level === 0 && (
          <span
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 select-none"
            title="Arrastrar para reordenar"
          >
            ⠿
          </span>
        )}
        <span
          className="text-gray-400 text-[10px] w-3 transition-transform duration-200 flex-shrink-0"
          style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          ▶
        </span>
        <div className="relative flex-shrink-0">
          <span
            className="w-2.5 h-2.5 rounded-sm flex-shrink-0 block cursor-pointer hover:ring-1 hover:ring-white/30 transition-all"
            style={{ background: folder.color }}
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            title="Cambiar color"
          />
          {showColorPicker && (
            <div
              ref={colorPickerRef}
              style={{
                position: "absolute",
                left: 0,
                top: "22px",
                zIndex: 50,
                background: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "10px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color}
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    background: color,
                    border: folder.color === color ? "2px solid rgba(255,255,255,0.7)" : "2px solid transparent",
                    cursor: "pointer",
                    transition: "transform 0.15s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onClick={() => {
                    changeFolderColor(folder.id, color);
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {editing ? (
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={() => {
              if (editName.trim()) renameFolder(folder.id, editName.trim());
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (editName.trim()) renameFolder(folder.id, editName.trim());
                setEditing(false);
              }
              if (e.key === "Escape") setEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-white/5 border border-brand-500/30 rounded px-1 py-0 text-[13px] text-white outline-none"
          />
        ) : (
          <span
            className={[
              "text-[13px] font-medium truncate flex-1 transition-colors",
              isOver ? "text-brand-300" : "text-gray-100",
            ].join(" ")}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
          >
            {folder.name}
            {isOver && (
              <span className="ml-1.5 text-[10px] text-brand-400 font-normal">
                {t("draggingHint")}
              </span>
            )}
          </span>
        )}

        <span className="text-[10px] text-gray-500 px-1.5 py-0.5 rounded-full bg-white/5 flex-shrink-0">
          {totalCount}
        </span>

        <div
          className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity items-center"
          onMouseLeave={() => setConfirmingDelete(false)}
        >
          {!confirmingDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
              className="w-4 h-4 rounded flex items-center justify-center text-[8px] hover:bg-white/10 text-gray-500"
              title={t("folderRenameTitle")}
            >
              ✎
            </button>
          )}
          {confirmingDelete ? (
            <>
              <span className="text-[9px] text-red-400 whitespace-nowrap">
                {t("folderDeleteConfirm")}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); removeFolder(folder.id); }}
                className="w-4 h-4 rounded flex items-center justify-center text-[8px] bg-red-500/20 text-red-400 hover:bg-red-500/40"
              >
                ✓
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmingDelete(false); }}
                className="w-4 h-4 rounded flex items-center justify-center text-[8px] hover:bg-white/10 text-gray-500"
              >
                ✕
              </button>
            </>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmingDelete(true); }}
              className="w-4 h-4 rounded flex items-center justify-center text-[8px] hover:bg-red-500/10 text-gray-500 hover:text-red-400"
              title={t("folderDeleteTitle")}
            >
              🗑
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="folder-content ml-1">
          {childFolders.map((cf) => (
            <FolderItem
              key={cf.id}
              folder={cf}
              conversations={conversations}
              allFolders={allFolders}
              level={level + 1}
              expandCommand={expandCommand}
              commandSeq={commandSeq}
            />
          ))}
          {folderConvs.map((c) => (
            <ConversationItem key={`${c.platform}:${c.id}`} conversation={c} />
          ))}
          {folderConvs.length === 0 && childFolders.length === 0 && (
            <div
              className={[
                "px-2 py-2 text-[11px] italic rounded-md transition-colors",
                isOver ? "text-brand-400" : "text-gray-600",
              ].join(" ")}
            >
              {isOver ? t("draggingHint") : t("dragHereHint")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl mb-3">
        📂
      </div>
      <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
        {message}
      </p>
    </div>
  );
}

function NoConversationsState() {
  const { t } = useTranslation();
  const platforms = [
    { icon: "⬡", name: "ChatGPT", url: "https://chatgpt.com", color: "#10a37f" },
    { icon: "◈", name: "Claude", url: "https://claude.ai", color: "#d97706" },
    { icon: "✦", name: "Gemini", url: "https://gemini.google.com", color: "#4285f4" },
    { icon: "◆", name: "DeepSeek", url: "https://chat.deepseek.com", color: "#6366f1" },
  ];

  return (
    <div className="flex flex-col items-center py-6 px-3 gap-4">
      <div className="text-center">
        <p className="text-[13px] font-medium text-gray-300 mb-1">
          {t("openTabTitle")}
        </p>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          {t("openTabDesc")}
        </p>
      </div>

      <div className="w-full space-y-1.5">
        {platforms.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/3 hover:bg-white/6 border border-white/5 hover:border-white/10 transition-all group"
          >
            <span className="text-[14px]" style={{ color: p.color }}>{p.icon}</span>
            <span className="text-[12px] text-gray-300 group-hover:text-white transition-colors flex-1">
              {p.name}
            </span>
            <span className="text-[10px] text-gray-600 group-hover:text-gray-400 transition-colors">
              {t("openLink")}
            </span>
          </a>
        ))}
      </div>

      <p className="text-[10px] text-gray-600 text-center leading-relaxed whitespace-pre-line">
        {t("openTabNote")}
      </p>
    </div>
  );
}
