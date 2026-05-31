import { initShell } from './ui/shell.js';
import { createPrompt } from './ui/prompt.js';
import { createOutput } from './ui/output.js';
import { createInput } from './ui/input.js';
import { parse } from './core/parser.js';
import { createExecutor } from './core/executor.js';
import { createHistory } from './core/history.js';
import { getSuggestions } from './core/suggestions.js';
import { commands } from './commands/index.js';

document.addEventListener('DOMContentLoaded', async () => {
  const shell = initShell();
  const prompt = createPrompt();
  const output = createOutput(shell.output, shell.inputLine);
  const history = createHistory();
  const commandNames = Object.keys(commands);

  const input = createInput(shell.input, history, {
    onTab(value) {
      const matches = getSuggestions(value.trim(), commandNames);
      if (matches.length === 0) return;
      if (matches.length === 1) {
        input.setValue(matches[0] + ' ');
      } else {
        output.print(matches.join('  '));
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

  shell.terminal.addEventListener('click', (e) => {
    if (!window.getSelection().isCollapsed) return;
    shell.input.focus();
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
    '[  OK  ] Initializing kernel modules',
    '[  OK  ] Loading configuration',
    '[  OK  ] Mounting portfolio data',
    '[  OK  ] Starting shell services'
  ];

  for (const line of bootLines) {
    await sleep(60);
    output.print(line);
  }
  await sleep(150);
  output.print('');
  output.print('  Welcome to Terminal Portfolio');
  output.print("  Type 'help' to get started.");
  output.print('');

  shell.input.disabled = false;
  shell.input.classList.remove('disabled');
  shell.input.focus();

  const executor = createExecutor(output, data);

  input.onSubmit((value) => {
    output.print(prompt.get() + value);

    const normalized = value.replace(/&&/g, ';').replace(/\|\|/g, ';');
    const parts = normalized.split(';').map(s => s.trim()).filter(Boolean);

    parts.forEach(part => {
      const parsed = parse(part);
      if (parsed) executor.execute(parsed);
    });
  });
});
