# ═══════════════════════════════════════════════════════════════
# ORENIVO — REDDIT POSTS
# Listos para copiar y pegar. UN post por subreddit.
# IMPORTANTE: no publiques todos el mismo día.
# Espacia 2-3 días entre cada uno.
# ═══════════════════════════════════════════════════════════════


## ──── r/ChatGPT (4M+ miembros) ────
## Publicar: Semana 1 del lanzamiento

**Título:** I built a free Chrome extension to organize ChatGPT conversations into folders (also works with Claude, Gemini, and DeepSeek)

**Cuerpo:**

I have 200+ ChatGPT conversations and finding anything is a nightmare. "New conversation", "Help me with this", "Untitled" — scrolling forever.

ChatGPT's "Projects" feature helps a bit but it's limited. And if you also use Claude or Gemini? Zero organization across platforms.

So I built Orenivo — a Chrome extension that adds a side panel with:

- **Folders & subfolders** with custom colors
- **Search** across your conversation titles
- **Pin** important chats to the top
- **Prompt Manager** — save and reuse your best prompts
- Works on **ChatGPT + Claude + Gemini + DeepSeek**

No account needed. Your data stays in your browser.

I'm a solo developer from Spain, built this in about 4 weeks. Would love your feedback — what's the #1 feature you'd want in something like this?

Link in comments.


## ──── r/ClaudeAI (200K+ miembros) ────
## Publicar: 3 días después de r/ChatGPT

**Título:** Made a free Chrome extension that organizes Claude conversations into folders (also supports ChatGPT, Gemini, DeepSeek)

**Cuerpo:**

One thing that frustrates me about Claude's web interface: zero conversation organization. No folders, no search, no way to pin important chats.

I use Claude daily for coding and writing, and I was spending actual minutes just scrolling through my chat history trying to find things.

So I built Orenivo — a side panel extension that adds folders, search, and pins to Claude (and ChatGPT, Gemini, DeepSeek too). 

It reads your conversation titles from the sidebar and lets you organize them however you want. It does NOT read your conversation content — just titles and related metadata for organization.

Current version: local-first, no account required, export/import built in.

Solo dev, built from Spain. Feedback welcome — especially from fellow Claude power users.

Link in first comment.


## ──── r/SideProject (500K+ miembros) ────
## Publicar: Semana 1 (este subreddit permite self-promotion)

**Título:** I spent 4 weeks building a Chrome extension to organize AI chats. Here's what I learned.

**Cuerpo:**

**The idea:** An extension that organizes ChatGPT, Claude, Gemini, and DeepSeek conversations with folders, search, and prompt templates.

**Why:** I have 200+ conversations across 3 platforms and can't find anything. ChatGPT "Projects" is limited. Claude has nothing. No extension covers all 4 platforms.

**The build (4 weeks, 5-10h/week):**
- Stack: WXT + React + TypeScript + Tailwind + Zustand
- Used Chrome Side Panel API instead of DOM injection (more resilient)
- Platform adapter pattern — each AI site has its own adapter. When ChatGPT changes their DOM, I only update one file.
- chrome.storage.local for persistent local storage

**Stats so far:**
- Total cost: €5 (Chrome Web Store fee)
- Hosting: €0
- Lines of code: ~3,000

**What I'd do differently:**
- Should have started capturing emails from day 0
- Should have posted "building in public" content earlier
- The Side Panel API is amazing but underdocumented

**Current version:** free, local-first, no account required

Link in comments. Roast me, feedback welcome.


## ──── r/productivity (2M+ miembros) ────
## Publicar: Semana 2

**Título:** If you use ChatGPT/Claude daily, this free tool might save you ~45 minutes per week

**Cuerpo:**

I tracked how much time I waste scrolling through AI conversations looking for specific chats. The answer: about 45 minutes per week.

The problem is simple: ChatGPT, Claude, Gemini — none of them let you organize conversations into folders. If you're a daily user with 100+ conversations, finding anything becomes painful.

I built a Chrome extension called Orenivo that adds a side panel with:

- Folders and subfolders (color-coded)
- Instant search across all conversations
- Pin your most important chats
- Works across ChatGPT, Claude, Gemini, and DeepSeek from one panel

It's free for basic use (5 folders). No account needed. Your data stays in your browser.

Has anyone else dealt with this problem? Curious if it's just me or if this is a common pain point.


## ──── r/webdev o r/programming ────
## Publicar: Semana 2-3 (SOLO si haces open source)

**Título:** I open-sourced a Chrome extension for organizing AI chats — here's the architecture

**Cuerpo:**

Just open-sourced Orenivo, a Chrome extension that organizes conversations across ChatGPT, Claude, Gemini, and DeepSeek.

Sharing because the architecture might be useful for anyone building multi-site Chrome extensions:

**Key decisions:**

1. **Side Panel API over content script injection.** Instead of modifying ChatGPT's DOM (which breaks every time they update), I render a completely independent React app in Chrome's native Side Panel. Content scripts only read data.

2. **Platform adapter pattern.** Each AI site has an adapter implementing a common interface: `getConversations()`, `observeChanges()`. When ChatGPT updates their sidebar DOM, I update one file with new CSS selectors. Claude, Gemini, DeepSeek each have their own adapter.

3. **Fallback selector chains.** Instead of `querySelector('.exact-class')`, each adapter has an array of selectors ordered most-specific → most-generic. Makes the extension resilient to minor DOM changes.

4. **MutationObserver with debounce** for watching conversation list changes (AI platforms use SPAs with dynamic content).

**Stack:** WXT (not Plasmo — smaller bundles, active maintenance) + React 18 + TypeScript + Tailwind + Zustand + chrome.storage.local.

GitHub link in comments. PRs welcome, especially for Gemini/DeepSeek adapter improvements.


## ──── r/InternetIsBeautiful (17M miembros) ────
## Publicar: Semana 3 (bar alto, solo si ya tienes tracción)
## NOTA: Lee las reglas antes, solo aceptan herramientas/webs útiles

**Título:** Orenivo — A free tool that organizes your ChatGPT, Claude, Gemini and DeepSeek conversations into folders

**Cuerpo:**

[Solo el link a tu landing page o Chrome Web Store]


# ═══════════════════════════════════════════════════════════════
# REGLAS DE ORO PARA REDDIT
# ═══════════════════════════════════════════════════════════════
#
# 1. NUNCA pongas el link en el cuerpo del post. Siempre en un comentario.
#    "Link in comments" o "Link in first comment"
#
# 2. Construye karma ANTES de postear (2-3 semanas de comentarios útiles)
#
# 3. Publica martes-jueves, 8-10 AM hora Este (14-16h España)
#
# 4. Responde a TODOS los comentarios, especialmente los críticos
#
# 5. NO cruces posts el mismo día. Espacia 2-3 días mínimo.
#
# 6. Si un post no despega en 2 horas, no lo borres. Reddit penaliza.
#
# 7. Tono: nunca "mira mi producto". Siempre "construí esto, feedback?"
#
# 8. La regla 9:1: por cada post propio, 9 comentarios de valor en otros posts
#
# ═══════════════════════════════════════════════════════════════
