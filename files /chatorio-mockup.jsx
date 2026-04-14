import { useState } from "react";

const platforms = {
  chatgpt: { name: "ChatGPT", color: "#10a37f", icon: "⬡" },
  claude: { name: "Claude", color: "#d97706", icon: "◈" },
  gemini: { name: "Gemini", color: "#4285f4", icon: "✦" },
  deepseek: { name: "DeepSeek", color: "#6366f1", icon: "◆" },
};

const folderColors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const mockFolders = [
  {
    id: 1, name: "Proyecto Chatorio", color: "#10b981", expanded: true,
    chats: [
      { id: 101, title: "Arquitectura WXT + React", platform: "claude", pinned: true, time: "Hace 2h" },
      { id: 102, title: "Content script para ChatGPT DOM", platform: "chatgpt", pinned: false, time: "Hace 5h" },
      { id: 103, title: "Manifest V3 permisos", platform: "gemini", pinned: false, time: "Ayer" },
    ],
    subfolders: [
      {
        id: 11, name: "UI/UX", color: "#3b82f6", expanded: false,
        chats: [
          { id: 111, title: "Diseño side panel", platform: "claude", pinned: false, time: "Hace 3d" },
        ]
      }
    ]
  },
  {
    id: 2, name: "Marketing & Distribución", color: "#f59e0b", expanded: false,
    chats: [
      { id: 201, title: "Copy Chrome Web Store", platform: "chatgpt", pinned: false, time: "Hace 1d" },
      { id: 202, title: "Estrategia Reddit r/ChatGPT", platform: "claude", pinned: true, time: "Hace 2d" },
      { id: 203, title: "LinkedIn hooks library", platform: "deepseek", pinned: false, time: "Hace 3d" },
    ],
    subfolders: []
  },
  {
    id: 3, name: "Trabajo ESW", color: "#8b5cf6", expanded: false,
    chats: [
      { id: 301, title: "Azure DevOps pipeline fix", platform: "chatgpt", pinned: false, time: "Hace 4h" },
      { id: 302, title: "ArgoCD sync issues", platform: "claude", pinned: false, time: "Ayer" },
    ],
    subfolders: []
  },
  {
    id: 4, name: "Bitcoin & Crypto", color: "#ef4444", expanded: false,
    chats: [
      { id: 401, title: "MVRV Z-Score analysis", platform: "chatgpt", pinned: false, time: "Hace 1sem" },
    ],
    subfolders: []
  },
];

const mockPrompts = [
  { id: 1, name: "Code Review", text: "Revisa este código y sugiere mejoras...", platform: "all" },
  { id: 2, name: "Blog Post ES", text: "Escribe un artículo en español sobre {tema}...", platform: "all" },
  { id: 3, name: "Debug Error", text: "Tengo este error: {error}. Stack: {stack}...", platform: "chatgpt" },
  { id: 4, name: "SQL Query", text: "Genera una query SQL para {descripción}...", platform: "all" },
];

const PlatformBadge = ({ platform, size = "sm" }) => {
  const p = platforms[platform];
  const s = size === "sm" ? "w-4 h-4 text-[8px]" : "w-5 h-5 text-[10px]";
  return (
    <span className={`${s} rounded flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ background: p.color }}>
      {p.icon}
    </span>
  );
};

const ChatItem = ({ chat, dragging }) => (
  <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer group transition-all duration-150
    ${dragging ? "bg-emerald-500/10 border border-emerald-500/30 border-dashed" : "hover:bg-white/5"}`}>
    <PlatformBadge platform={chat.platform} />
    <span className="text-[13px] text-gray-200 truncate flex-1">{chat.title}</span>
    {chat.pinned && <span className="text-amber-400 text-[10px]">📌</span>}
    <span className="text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{chat.time}</span>
  </div>
);

const FolderItem = ({ folder, level = 0, onToggle }) => {
  const [expanded, setExpanded] = useState(folder.expanded);
  return (
    <div style={{ paddingLeft: level * 12 }}>
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer hover:bg-white/5 group"
        onClick={() => setExpanded(!expanded)}>
        <span className="text-gray-400 text-[10px] w-3 transition-transform duration-200"
          style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
        <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: folder.color }} />
        <span className="text-[13px] text-gray-100 font-medium truncate flex-1">{folder.name}</span>
        <span className="text-[10px] text-gray-500 px-1.5 py-0.5 rounded-full bg-white/5">
          {folder.chats.length + (folder.subfolders?.reduce((a, sf) => a + sf.chats.length, 0) || 0)}
        </span>
      </div>
      {expanded && (
        <div className="ml-1">
          {folder.subfolders?.map(sf => (
            <FolderItem key={sf.id} folder={sf} level={level + 1} />
          ))}
          {folder.chats.map(chat => (
            <ChatItem key={chat.id} chat={chat} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ChatorioMockup() {
  const [activeTab, setActiveTab] = useState("folders");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [view, setView] = useState("sidepanel");
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center py-8 px-4"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      
      {/* Header */}
      <div className="text-center mb-8 max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" opacity="0.9"/>
              <rect x="3" y="13" width="7" height="8" rx="1.5" fill="white" opacity="0.6"/>
              <rect x="13" y="3" width="8" height="5" rx="1.5" fill="white" opacity="0.7"/>
              <rect x="13" y="11" width="8" height="4" rx="1.5" fill="white" opacity="0.5"/>
              <rect x="13" y="18" width="8" height="3" rx="1.5" fill="white" opacity="0.4"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span style={{ color: "#10b981" }}>Chat</span>ario
          </h1>
        </div>
        <p className="text-gray-400 text-sm">
          Organiza tus conversaciones de ChatGPT, Claude, Gemini y DeepSeek en un solo lugar
        </p>

        {/* View Toggle */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[
            { id: "sidepanel", label: "Side Panel" },
            { id: "prompts", label: "Prompt Manager" },
            { id: "pricing", label: "Pricing" },
          ].map(v => (
            <button key={v.id}
              onClick={() => setView(v.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                ${view === v.id
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-gray-500 hover:text-gray-300 border border-transparent"}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Side Panel View */}
      {view === "sidepanel" && (
        <div className="flex gap-4 max-w-5xl w-full items-start">
          {/* Fake browser bg */}
          <div className="flex-1 rounded-xl border border-white/5 bg-[#111118] p-6 min-h-[560px] relative overflow-hidden">
            <div className="absolute top-3 left-4 flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <div className="mt-6 flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg mb-6">
              <span className="text-gray-500 text-xs">🔒</span>
              <span className="text-gray-400 text-xs">chat.openai.com</span>
            </div>
            <div className="space-y-3 opacity-30">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 bg-white/10 rounded-full" style={{ width: `${40 + Math.random() * 50}%` }} />
                    <div className="h-2.5 bg-white/8 rounded-full" style={{ width: `${30 + Math.random() * 40}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 bg-white/5 rounded-lg px-3 py-3">
              <div className="h-2.5 bg-white/10 rounded-full flex-1" />
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm">↑</div>
            </div>
          </div>

          {/* Chatorio Side Panel */}
          <div className="w-[320px] rounded-xl border border-emerald-500/20 bg-[#0d0d14] overflow-hidden flex-shrink-0"
            style={{ boxShadow: "0 0 40px rgba(16, 185, 129, 0.05)" }}>
            
            {/* Panel Header */}
            <div className="px-3 pt-3 pb-2 border-b border-white/5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" opacity="0.9"/>
                      <rect x="3" y="13" width="7" height="8" rx="1.5" fill="white" opacity="0.6"/>
                      <rect x="13" y="3" width="8" height="5" rx="1.5" fill="white" opacity="0.7"/>
                      <rect x="13" y="11" width="8" height="4" rx="1.5" fill="white" opacity="0.5"/>
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-white">Chatorio</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">PRO</span>
                </div>
                <div className="flex gap-1">
                  <button className="w-6 h-6 rounded-md hover:bg-white/5 flex items-center justify-center text-gray-500 text-xs">⚙</button>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-2">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar conversaciones..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-emerald-500/30 transition-colors"
                />
              </div>

              {/* Platform Filter */}
              <div className="flex gap-1">
                <button onClick={() => setSelectedPlatform("all")}
                  className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all
                    ${selectedPlatform === "all" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}>
                  Todas
                </button>
                {Object.entries(platforms).map(([key, p]) => (
                  <button key={key} onClick={() => setSelectedPlatform(key)}
                    className={`px-1.5 py-1 rounded-md text-[10px] transition-all flex items-center gap-1
                      ${selectedPlatform === key ? "bg-white/10" : "hover:bg-white/5"}`}
                    style={{ color: selectedPlatform === key ? p.color : "#6b7280" }}>
                    {p.icon} {p.name.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5">
              {[
                { id: "folders", icon: "📁", label: "Carpetas" },
                { id: "recent", icon: "🕐", label: "Recientes" },
                { id: "pinned", icon: "📌", label: "Fijados" },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 text-[11px] font-medium transition-all border-b-2
                    ${activeTab === tab.id
                      ? "text-emerald-400 border-emerald-500"
                      : "text-gray-500 border-transparent hover:text-gray-300"}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Folder Content */}
            <div className="px-2 py-2 space-y-0.5 max-h-[360px] overflow-y-auto"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#1f1f2e transparent" }}>
              
              {/* New Folder Button */}
              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] text-emerald-400 hover:bg-emerald-500/10 transition-colors mb-1">
                <span className="w-5 h-5 rounded-md border border-dashed border-emerald-500/40 flex items-center justify-center text-[10px]">+</span>
                Nueva carpeta
              </button>

              {mockFolders.map(folder => (
                <FolderItem key={folder.id} folder={folder} />
              ))}

              {/* Unfiled section */}
              <div className="mt-3 pt-2 border-t border-white/5">
                <div className="px-2 py-1 text-[10px] text-gray-600 uppercase tracking-wider font-medium">Sin clasificar (23)</div>
                {[
                  { id: 501, title: "Quick Python question", platform: "chatgpt", time: "Hace 3d" },
                  { id: 502, title: "Traducción email inglés", platform: "deepseek", time: "Hace 5d" },
                  { id: 503, title: "Ideas nombre dominio", platform: "claude", time: "Hace 1sem" },
                ].map(chat => (
                  <ChatItem key={chat.id} chat={{ ...chat, pinned: false }} />
                ))}
                <div className="px-2 py-1 text-[10px] text-gray-600 cursor-pointer hover:text-gray-400">
                  + 20 conversaciones más...
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="px-3 py-2 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-gray-500">Sincronizado</span>
              </div>
              <div className="flex gap-2 text-[10px] text-gray-500">
                <span>4 plataformas</span>
                <span>·</span>
                <span>47 chats</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Manager View */}
      {view === "prompts" && (
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-emerald-500/20 bg-[#0d0d14] overflow-hidden"
            style={{ boxShadow: "0 0 40px rgba(16, 185, 129, 0.05)" }}>
            <div className="px-4 pt-4 pb-3 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">Prompt Manager</h3>
              <p className="text-[11px] text-gray-500">Guarda y reutiliza tus mejores prompts con un clic</p>
            </div>

            <div className="p-3 space-y-2">
              {mockPrompts.map(prompt => (
                <div key={prompt.id}
                  className="p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-emerald-500/20 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">⚡</span>
                      <span className="text-[13px] font-medium text-gray-200">{prompt.name}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-medium">
                        Usar
                      </button>
                      <button className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-gray-400">✎</button>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed truncate">{prompt.text}</p>
                  {prompt.text.includes("{") && (
                    <div className="flex gap-1.5 mt-2">
                      {prompt.text.match(/\{(\w+)\}/g)?.map((v, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/10 text-amber-400 font-mono">
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <button className="w-full py-2.5 rounded-lg border border-dashed border-emerald-500/30 text-emerald-400 text-xs hover:bg-emerald-500/5 transition-colors">
                + Nuevo Prompt Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing View */}
      {view === "pricing" && (
        <div className="w-full max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Free */}
            <div className="rounded-xl border border-white/10 bg-[#0d0d14] p-5">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Free</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-white">€0</span>
                <span className="text-gray-500 text-sm">/siempre</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {["5 carpetas", "ChatGPT + Claude", "Búsqueda por título", "5 prompts guardados", "14 días trial Pro"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-gray-400">
                    <span className="text-emerald-500 text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-2 rounded-lg bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 transition-colors">
                Instalar gratis
              </button>
            </div>

            {/* Pro - Featured */}
            <div className="rounded-xl border border-emerald-500/30 bg-[#0d0d14] p-5 relative"
              style={{ boxShadow: "0 0 30px rgba(16, 185, 129, 0.08)" }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-[10px] text-white font-semibold uppercase tracking-wider">
                Popular
              </div>
              <div className="text-xs text-emerald-400 font-medium uppercase tracking-wider mb-2">Pro</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-white">€6.49</span>
                <span className="text-gray-500 text-sm">/mes</span>
              </div>
              <div className="text-[11px] text-gray-500 mb-4">o €49/año (ahorra 31%)</div>
              <ul className="space-y-2.5 mb-6">
                {[
                  "Carpetas ilimitadas",
                  "4 plataformas (GPT, Claude, Gemini, DeepSeek)",
                  "Búsqueda full-text",
                  "Prompts ilimitados con variables",
                  "Subcarpetas + colores",
                  "Sync multi-dispositivo",
                  "Export / Backup",
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-gray-300">
                    <span className="text-emerald-500 text-xs mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                Empezar con Pro
              </button>
            </div>

            {/* Lifetime */}
            <div className="rounded-xl border border-amber-500/20 bg-[#0d0d14] p-5 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-[10px] text-black font-semibold uppercase tracking-wider">
                Limitado
              </div>
              <div className="text-xs text-amber-400 font-medium uppercase tracking-wider mb-2">Lifetime</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-white">€89</span>
                <span className="text-gray-500 text-sm">pago único</span>
              </div>
              <div className="text-[11px] text-amber-400/70 mb-4">Solo 200 unidades disponibles</div>
              <ul className="space-y-2.5 mb-6">
                {[
                  "Todo lo de Pro",
                  "Acceso de por vida",
                  "Todas las futuras actualizaciones",
                  "Soporte prioritario",
                  "Badge Early Supporter",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-gray-300">
                    <span className="text-amber-500 text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-2.5 rounded-lg bg-amber-500/15 text-amber-400 text-sm font-semibold hover:bg-amber-500/25 transition-colors border border-amber-500/20">
                Conseguir Lifetime
              </button>
              <div className="mt-2 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500/60" style={{ width: "15%" }} />
              </div>
              <div className="text-[10px] text-gray-600 mt-1 text-center">170 de 200 restantes</div>
            </div>
          </div>
        </div>
      )}

      {/* Supported Platforms */}
      <div className="flex items-center gap-6 mt-10">
        <span className="text-[11px] text-gray-600 uppercase tracking-wider">Compatible con</span>
        {Object.entries(platforms).map(([key, p]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="text-sm" style={{ color: p.color }}>{p.icon}</span>
            <span className="text-xs text-gray-500">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
