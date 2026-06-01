# Terminal Portfolio Progress

## Module 1 - Terminal UI Shell Setup
- Created fullscreen terminal layout (HTML + CSS)
- Built scrollable output area and fixed input line at bottom
- Implemented prompt display (`user@portfolio:~$ `)
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
- Fully responsive: `clamp()` font scaling, `100dvh` for mobile browser bars, max-width container for large screens, mobile breakpoint (480px), touch pointer sizing
- Ctrl+scroll to zoom terminal text (0.3x–3x, persisted to localStorage)
- Commands use dynamic key-value printing via `printObj` utility (`src/utils/print.js`) — no hardcoded template strings
- Skills command already dynamic, kept as-is
- `about show` displays profile image as colored `█` characters via `imgToAscii()` + `renderAsciiHtml()` (`src/utils/ascii.js`) — set `about.imageUrl` in portfolio.json
- `about show --img` shows profile image only (no text info)
- `about show --img | download` downloads the original image
- `download` command receives piped URL and triggers browser file download
- Pipe (`|`) support in command execution with context passing
- Every command has `--help` flag with detailed usage
- `help <command>` runs the target command with `--help` to show its docs
