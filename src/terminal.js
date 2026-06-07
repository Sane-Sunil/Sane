import { initShell } from './ui/shell.js';
import { createPrompt } from './ui/prompt.js';
import { createOutput } from './ui/output.js';
import { createInput } from './ui/input.js';
import { parse } from './core/parser.js';
import { createExecutor } from './core/executor.js';
import { createHistory } from './core/history.js';
import { getSuggestions, subcommands } from './core/suggestions.js';
import { commands } from './commands/index.js';

(async () => {
  const shell = initShell();
  const prompt = createPrompt();
  const output = createOutput(shell.output, shell.inputLine);
  const history = createHistory();
  const commandNames = Object.keys(commands);

  const input = createInput(shell.input, history, {
    onTab(value) {
      const trimmed = value.trim();
      const parts = trimmed.split(/\s+/);

      if (parts.length <= 1) {
        const matches = getSuggestions(trimmed, commandNames);
        if (matches.length === 0) return;
        if (matches.length === 1) {
          input.setValue(matches[0] + ' ');
        } else {
          output.print(matches.join('  '));
        }
      } else {
        const cmd = parts[0];
        const partial = parts.slice(1).join(' ');
        const subs = cmd === 'help' ? commandNames : (subcommands[cmd] || []);
        if (subs.length === 0) return;
        const matches = getSuggestions(partial, subs);
        if (matches.length === 0) return;
        if (matches.length === 1) {
          input.setValue(cmd + ' ' + matches[0] + ' ');
        } else {
          output.print(matches.join('  '));
        }
      }
    },
    onCtrlL() {
      output.clear();
    }
  });

  shell.input.disabled = true;
  shell.input.classList.add('disabled');

  shell.terminal.addEventListener('dragstart', (e) => {
    e.preventDefault();
  }, true);

  const ZOOM_KEY = 'terminal:zoom';
  let zoom = parseFloat(localStorage.getItem(ZOOM_KEY)) || 1;
  zoom = Math.max(0.3, Math.min(3, zoom));
  document.documentElement.style.setProperty('--zoom', zoom);

  document.addEventListener('wheel', (e) => {
    if (!e.ctrlKey || !e.target.closest('#terminal')) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    zoom = Math.max(0.3, Math.min(3, zoom + delta));
    document.documentElement.style.setProperty('--zoom', zoom);
    try { localStorage.setItem(ZOOM_KEY, zoom); } catch {}
  }, { passive: false });

  document.addEventListener('mouseup', (e) => {
    if (!e.target.closest('#terminal') || e.target.closest('#input-line')) return;
    if (window.getSelection().isCollapsed) {
      shell.input.focus();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      e.stopPropagation();
      const sel = window.getSelection().toString();
      if (sel) navigator.clipboard.writeText(sel);
      return;
    }

    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      e.stopPropagation();
      const value = input.getValue();
      input.clear();
      output.print(prompt.get() + value + '^C');
      return;
    }
  }, true);

  let data = {};
  try {
    const res = await fetch('./data/portfolio.json');
    data = await res.json();
  } catch {
    output.print('Warning: could not load portfolio data.');
  }

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const bootLines = [
    '[  OK  ] Initializing portfolio terminal',
    '[  OK  ] Loading configuration',
    '[  OK  ] Starting shell services',
    '[  OK  ] Printing lines for fun'
  ];

  for (const line of bootLines) {
    await sleep(60);
    output.print(line);
  }
  await sleep(150);
  output.print('');
  output.print('  Welcome to Terminal Portfolio');
  output.print("  Type 'help' to get started.");
  output.print('\n');

  shell.input.disabled = false;
  shell.input.classList.remove('disabled');
  shell.input.focus();

  const executor = createExecutor(output, data, { clearHistory: () => history.clear(), printHtml: (html) => output.printHtml(html) });

  input.onSubmit(async (value) => {
    if (!value.trim()) return;

    output.print(prompt.get() + value);

    const normalized = value.replace(/&&/g, ';').replace(/\|\|/g, ';');
    const parts = normalized.split(';').map(s => s.trim()).filter(Boolean);

    for (const part of parts) {
      if (part.includes('|')) {
        const stages = part.split('|').map(s => s.trim()).filter(Boolean);
        let captured = '';
        for (let i = 0; i < stages.length; i++) {
          const parsed = parse(stages[i]);
          if (!parsed) break;
          if (i < stages.length - 1) {
            const result = executor.execute(parsed, {
              print: (text) => { captured = text; },
              printHtml: () => {}
            });
            if (result instanceof Promise) await result;
          } else {
            const result = executor.execute(parsed, { pipe: captured });
            if (result instanceof Promise) await result;
          }
        }
      } else {
        const parsed = parse(part);
        if (parsed) {
          const result = executor.execute(parsed);
          if (result instanceof Promise) await result;
        }
      }
    }
  });
})();
