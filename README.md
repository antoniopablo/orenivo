# 🗂️ Orenivo

**Organize your AI chats: Folders, Search & Prompts for ChatGPT, Claude, Gemini & DeepSeek**

The only Chrome extension that organizes all your AI conversations in one place.

## ✨ Features

- 📁 **Folders & Subfolders** — Color-coded, drag & drop
- 🔍 **Title Search** — Find any conversation by title across supported platforms
- ⚡ **Prompt Manager** — Save & reuse templates with variables
- 🌐 **4 Platforms** — ChatGPT, Claude, Gemini, DeepSeek
- 📌 **Pins** — Quick access to your most important chats
- 📤 **Export & Import** — Backup and restore your data as JSON

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development (loads extension in Chrome)
npm run dev

# Build for production
npm run build

# Create .zip for Chrome Web Store submission
npm run zip
```

### Load in Chrome (development)

1. Run `npm run dev`
2. Open `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `.output/chrome-mv3` directory
6. Open ChatGPT or Claude — click the Orenivo icon to open the side panel

## 🏗️ Architecture

```
orenivo/
├── entrypoints/
│   ├── background.ts          # Service worker — message routing, side panel
│   ├── content.ts             # Content script — runs on AI platforms
│   └── sidepanel/             # React app — the main UI
│       ├── index.html
│       ├── main.tsx
│       └── App.tsx
├── components/                # React components
│   ├── Header.tsx
│   ├── SearchBar.tsx
│   ├── PlatformFilter.tsx
│   ├── TabBar.tsx
│   ├── FolderList.tsx
│   ├── ConversationItem.tsx
│   ├── PlatformBadge.tsx
│   └── StatusBar.tsx
├── lib/
│   ├── types.ts               # TypeScript types & constants
│   ├── storage.ts             # chrome.storage.local abstraction
│   ├── store/index.ts         # Zustand state management
│   └── platforms/             # Platform adapters (one per AI service)
│       ├── adapter.ts         # Interface + helpers
│       ├── chatgpt.ts         # ChatGPT DOM adapter
│       ├── claude.ts          # Claude DOM adapter
│       └── index.ts           # Platform registry
├── assets/
│   └── styles.css             # Tailwind + custom styles
└── public/
    └── icons/                 # Extension icons (16,32,48,128 PNG)
```

### How it works

1. **Content script** loads on ChatGPT/Claude/Gemini/DeepSeek
2. **Platform adapter** reads conversation list from the DOM using `MutationObserver`
3. Conversations are sent via `chrome.runtime.sendMessage` to the **background service worker**
4. Background forwards to the **side panel** React app
5. **Zustand store** manages UI state, **chrome.storage.local** persists data
6. When the user creates folders/pins, changes are saved to storage
7. Conversation metadata (titles, folders, pins) persists across sessions

### Current scope

- All data is stored locally in `chrome.storage.local`
- Orenivo reads conversation titles and related metadata needed to organize your chat list
- Orenivo does not read message content
- There is currently no account system, payment flow, or cloud sync in the shipped extension

### Adding a new platform

1. Create `lib/platforms/newplatform.ts` implementing `PlatformAdapter`
2. Add selectors for the platform's conversation list DOM
3. Register in `lib/platforms/index.ts`
4. Add host permission in `wxt.config.ts`

## 📝 Tech Stack

- **WXT** — Chrome extension framework (Manifest V3)
- **React 18** — UI framework
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **Zustand** — State management
- **chrome.storage.local** — Persistent local storage

## 📄 License

**Source Available — Non-Commercial**

Copyright © 2026 Antonio García López. All rights reserved.

This source code is made available for **learning and educational purposes only**.

You may read and study this code. You may **not**:
- Use this code, in whole or in part, in a commercial product or service
- Redistribute or sublicense this code
- Create competing products based on this code

For commercial licensing inquiries: support@orenivo.ai

## 🙋 Support

- Website: [orenivo.vercel.app](https://orenivo.vercel.app)
- Email: support@orenivo.ai

---

Made with ☕ from Spain
