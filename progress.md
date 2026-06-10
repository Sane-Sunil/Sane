# Terminal Portfolio Progress

## CLI Modules

## Module 1 - Terminal UI Shell Setup
- Created fullscreen terminal layout (HTML + CSS)
- Built scrollable output area and fixed input line at bottom
- Implemented prompt display (`user@portfolio:/$ `)
- Added real-time input handling (typing + Enter key)
- Added responsive design (mobile + desktop breakpoints)
- Added click-to-focus on input
- Created modular JS architecture (shell, input, output, prompt modules)

Status: Completed

---

## Module 2 - Command Parser
- Created `src/core/parser.js` with `parse()` function
- Handles: command, args, flags (--), quoted strings
- Returns structured object `{ command, args, flags }` or `null` for empty input
- Integrated into terminal flow (replaced echo test)

Status: Completed

---

## Module 3 - Command Execution Engine
- Created `src/commands.js` with command registry (echo command)
- Created `src/core/executor.js` with dispatch logic
- Unknown commands show `shell: <cmd>: command not found`
- Commands receive `{ args, flags, print }` interface
- Wired executor into terminal flow (replaced JSON dump)

Status: Completed

---

## Module 4 - Basic Commands
- Created `data/portfolio.json` with about, skills, contact data
- Implemented `help` — lists available commands, supports `help <cmd>`
- Implemented `about` — shows bio, supports `about show`
- Implemented `skills` — lists skills by category, supports `skills show`
- Implemented `contact` — shows contact info, supports `contact show`
- All commands follow CLI convention: no args → usage, `--help` → docs, subcommand → action
- Executor now passes `data` and `commands` context to handlers
- Terminal fetches portfolio.json on startup

Status: Completed

---

## Module 5 - Command Restructure + New Commands
- Split monolithic `src/commands.js` into individual files in `src/commands/`
- Each command is its own file: echo, help, about, skills, contact, education, experience, projects, clear
- Added `education` command (education show)
- Added `experience` command (experience show)
- Added `projects` command (projects show)
- Added `clear` command (clears terminal output)
- Dynamic skills display loops over any category in data
- Updated portfolio.json with education, experience, and projects data
- Executor now passes `clear()` to command handlers
- Deleted old `src/commands.js`

Status: Completed

---

## Module 6 - Command History
- Created `src/core/history.js` with up/down navigation
- Up to 100 entries, no consecutive duplicates
- ArrowUp recalls previous command into input
- ArrowDown moves forward through history (empty at end)
- Wired history into input handler and terminal flow

Status: Completed

---

## Module 7 - Suggestion System / Tab Autocomplete
- Created `src/core/suggestions.js` with prefix-based command matching
- Tab key triggers autocomplete: single match → fill, multiple → show list
- Integrated into input handler via `onTab` callback
- Uses command registry for candidate list

Status: Completed

---

## Module 8 - Keyboard System
- Added Ctrl+C handler — clears input line (cancel/interrupt)
- Added Ctrl+L handler — clears terminal output
- Added fuzzy "Did you mean?" suggestions on command not found (Levenshtein + substring)
- Created Levenshtein distance utility in suggestions.js

Status: Completed

---

## Module 9 - UI Polish
- Added boot sequence with timed startup messages (60ms per line)
- Input disabled during boot, enabled after sequence completes
- Changed caret color to match prompt green (#00ff41)
- Added disabled input styling (dimmed opacity)
- Auto-focus input after boot

Status: Completed

---

## Module 10 - Input Wrapping & Terminal Flow
- Moved input line inside scrollable output area (natural terminal feel)
- Replaced `<input>` with `<textarea>` for multi-line command wrapping
- Added auto-resize to textarea (grows/shrinks with wrapped content)
- Input stays in flow: new output pushes it down, scroll follows
- `clear()` preserves input line at bottom
- Enter submits command (Shift+Enter for literal newline)
- Prompt stays top-aligned when input wraps multiple lines

Status: Completed

---

## Module 11 - Final
- History saved to localStorage (persists across refreshes)
- `clear -h` clears command history (memory + localStorage)
- Click anywhere in terminal window to focus input (real terminal behavior)
- Tab autocompletion for subcommands (`about s<Tab>` → `about show `, `help ab<Tab>` → `help about `)
- `kill` command closes the portfolio tab
- Empty-line submission is a no-op (no blank prompt printed)
- Fully responsive: `clamp()` font scaling, `100dvh`, max-width container, mobile breakpoint, touch sizing
- Ctrl+scroll to zoom terminal text (0.3x–3x, persisted to localStorage)
- Commands use dynamic key-value printing via `printObj` utility — no hardcoded template strings
- Skills command already dynamic, kept as-is
- `about show` displays profile image as colored `█` characters via `imgToAscii()` + `renderAsciiHtml()`
- `about show --img` shows profile image only (no text info)
- `about show --img | download` downloads the original image
- `download` command receives piped URL and triggers browser file download
- Pipe (`|`) support in command execution with context passing
- Every command has `--help` flag with detailed usage
- `help <command>` runs the target command with `--help` to show its docs

Status: Completed

---

## GUI Modules

## Module 1 - GUI Bootstrap & Desktop Layout
- Mode detection (gui/cli via localStorage)
- Desktop base layout (HTML + CSS)
- GUI entry via inline script in index.html (loads correct module before DOMContentLoaded)
- Desktop container with grid styling
- Taskbar with clock and "Open Terminal" button
- Gradient wallpaper (fallback)
- Fade-in animation on desktop load
- Files created: state.js, main.js, desktop/layout.js, desktop/styles.css

Status: Completed

---

## Module 2 - App System (Icons + Click Open)
- App registry (6 apps: About, Skills, Projects, Experience, Contact, Terminal)
- App icon grid rendered on desktop from registry
- Click/dblclick handler opens app overlay window
- App window system (overlay with header, close button, body container)
- Scale-in animation on window open
- Responsive icon grid
- Files created: apps/registry.js, apps/view.js

Status: Completed

---

## Module 3 - Portfolio App Views
- Shared data adapter (src/shared/dataAdapter.js) — fetches + caches portfolio.json
- About view — name, title, location, bio
- Skills view — categorized skill tags
- Projects view — project cards with tech tags + links
- Experience view — experience timeline + education
- Contact view — labeled contact info with clickable links
- All views wired to registry via `render` function
- View-specific CSS (cards, tags, contact rows, loading/error states)
- Files created: shared/dataAdapter.js, apps/about.js, apps/skills.js, apps/projects.js, apps/experience.js, apps/contact.js
- Post-polish: avatar scale-in, skill tag hover lift + colored shadow, project card hover lift, timeline dot hover effects, contact copy-to-clipboard feedback

Status: Completed

---

## Module 4 - Terminal Integration (CLI Embed)
- Terminal app on desktop opens embedded CLI inside GUI app window
- `startgui` CLI command (switches from CLI to GUI)
- RunCLI bridge (initTerminal) for safe CLI interaction
- Mode switching via GUI "Open Terminal" button
- Embedded terminal supports all CLI features: history, tab-complete, pipes, Ctrl+C/L, paste
- Terminal app in default desktop layout

Status: Completed

---

## Module 5 - Desktop Grid & Folder System
- Replaced static icon grid with draggable grid-based desktop (CSS Grid)
- Icons snap to grid cells on drop; swap positions on overlap
- Right-click context menu: New Folder on desktop, Move to Folder / Remove on apps
- Double-click folder to open window with contained app icons
- Layout (positions, folder contents) persisted to localStorage
- Files created: desktop/desktopState.js

Status: Completed

---

## Module 6 - State Persistence & Polish
- localStorage mode persistence (state.js)
- Animations (desktop fade-in, window scale-in, folder scale-in)
- Responsive polish — app-window mobile sizing, taskbar wrapping, settings tabs scroll, about sidebar stacking, folder window mobile width, experience timeline mobile layout
- Final integration review — mode switching, multi-window, drag, folders, settings, keyboard shortcuts, mobile back button
- State persistence: layout, wallpaper, theme, accent color, taskbar prefs, icon color (desktopState.js)

Status: Completed

---

## Module 7 — File Manager GUI App
- VFS structure stored in data/vfs.json (fetch with lazy init + caching)
- Directory browsing with click-to-navigate from VFS data
- Breadcrumb navigation with clickable path segments
- File preview panel — fetches content from $path on file select
- Folder preview shows children list
- /apps/ subdirectories use app icons from registry, delegate to openApp(id)
- Double-click file opens in full app window (close, minimize, maximize, drag, escape, tray)
- Local folder mapping via File System Access API (showDirectoryPicker)
- Mapped folders show local files with full preview and opening support
- File viewer handles text, images, PDF, audio, video by extension
- Mount subdirectory fix: double-slash bug in path matching for nested mounted dirs
- Files created: filemanager/vfs.js, filemanager/view.js, data/vfs.json, assets/dummy.txt
- CSS fix: misplaced `.fm-preview` responsive rules outside media query causing 100% width

Status: Completed

---

## Module 8 — Maximize State Persistence Fix
- Fixed inline `left`/`top` styles overriding CSS `.maximized` rule on restore
- Fixed `saved?.maximized !== false` defaulting new apps to maximized
- Files changed: src/gui/apps/view.js

Status: Fixed

---

## Module 9 — UI Animations & Interactive Effects
- Centered timeline dots using CSS grid + variables (--tl-pl, --tl-line-x) instead of manual pixel offsets
- Added `--i` index to Skills, Projects, and Contact templates for staggered entrance animations
- Added `slideUp` and `slideRight` keyframe animations
- Staggered entrance animations on all app views (Skills 0.03s, Projects 0.05s, Experience 0.06s, Contact 0.07s)
- Hover effects: card lift/translate, tag color shift, dot scale, window button scale, FM list item translate
- Click feedback: scale-down on buttons, copy buttons
- All animations in 0.1s–0.4s range, consistent with existing design
- Tab switch transitions: paneLeave exit animation (fade+slideUp) before new pane slides in (About, Experience, Settings)
- Custom sliding toggle switches: styled checkboxes as animated toggles with sliding knob (Settings)
- Loading shimmer: animated gradient pulse on `.app-loading` during data fetch
- Search input focus: animated border + padding expand on focus (Skills, Projects)
- Smooth scroll: `scroll-behavior: smooth` on all scrollable app bodies
- Filter button pop: `btnPop` keyframe on `.active` filter buttons (Skills, Projects)
- Shimmer hover effect: diagonal accent gradient sweep (105deg) across cards on hover using `::after` pseudo-element (Project, Experience, Contact, FM list items)
- Maximize/restore: smooth size transition via forced reflow technique (`void offsetHeight` between start/end states)
- Minimize: scale-down (0.92) + fade-out exit animation
- Close: scale-down + fade-out before element removal
- Restore from tray: `windowEnter` keyframe animation (scale-up + fade-in) on restore
- Wallpaper match theme: bidirectional toggle in Settings → Desktop → Wallpaper; light theme lightens toward white (`lightenHex 0.50`), dark theme darkens toward black (`darkenHex 0.50`), auto-updates on theme switch
- Files changed: src/gui/desktop/styles.css, src/gui/apps/skills.js, src/gui/apps/projects.js, src/gui/apps/contact.js, src/gui/apps/about.js, src/gui/apps/experience.js, src/gui/apps/settings.js

Status: Completed

---

## Module 10 — SEO & LLM Discovery
- Enhanced meta tags, OG/Twitter tags, and keywords for name/skills ranking
- Added structured data schemas (Person, WebSite, BreadcrumbList, ItemList)
- Updated sitemap.xml and fixed robots.txt with AI crawler access
- Created llms.txt for LLM consumption
- Files changed: index.html, sitemap.xml, robots.txt, llms.txt (new)

Status: Completed
