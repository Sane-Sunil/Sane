import { parse } from '../../core/parser.js';
import { createExecutor } from '../../core/executor.js';
import { createHistory } from '../../core/history.js';
import { getSuggestions, subcommands } from '../../core/suggestions.js';
import { commands } from '../../commands/index.js';
export function renderTerminal() {
  return `
    <div class="term-app-layout">
      <div class="term-app-output" id="term-app-output"></div>
      <div class="term-app-input-line" id="term-app-input-line">
        <span class="term-app-prompt">sane@portfolio:$ </span>
        <textarea class="term-app-field" id="term-app-field" spellcheck="false" rows="1"></textarea>
      </div>
    </div>
  `;
}

export function initTerminal(body, data) {
  const outputEl = body.querySelector('#term-app-output');
  const inputEl = body.querySelector('#term-app-field');
  const promptEl = body.querySelector('.term-app-prompt');
  const inputLine = body.querySelector('#term-app-input-line');

  const history = createHistory();
  const commandNames = Object.keys(commands);

  const print = (text) => {
    const line = document.createElement('div');
    line.textContent = text;
    outputEl.insertBefore(line, inputLine);
    outputEl.scrollTop = outputEl.scrollHeight;
  };

  const printHtml = (html) => {
    const line = document.createElement('div');
    line.style.whiteSpace = 'pre';
    line.style.lineHeight = '1';
    line.innerHTML = html;
    outputEl.insertBefore(line, inputLine);
    outputEl.scrollTop = outputEl.scrollHeight;
  };

  const clear = () => {
    const children = Array.from(outputEl.children);
    children.forEach(child => {
      if (child !== inputLine) child.remove();
    });
  };

  const executor = createExecutor(
    { print, printHtml, clear },
    data || {},
    { clearHistory: () => history.clear(), printHtml, embedded: true }
  );

  function autoResize() {
    inputEl.style.height = 'auto';
    inputEl.style.height = inputEl.scrollHeight + 'px';
  }

  inputEl.addEventListener('input', autoResize);

  async function handleSubmit(value) {
    if (!value.trim()) return;

    print(promptEl.textContent + value);

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
  }

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const value = inputEl.value;
      history.add(value.trim());
      handleSubmit(value);
      inputEl.value = '';
      autoResize();
      inputEl.scrollIntoView({ block: 'nearest' });
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const cmd = history.up();
      inputEl.value = cmd || '';
      autoResize();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const cmd = history.down();
      inputEl.value = cmd !== null ? cmd : '';
      autoResize();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const trimmed = inputEl.value.trim();
      const parts = trimmed.split(/\s+/);

      if (parts.length <= 1) {
        const matches = getSuggestions(trimmed, commandNames);
        if (matches.length === 0) return;
        if (matches.length === 1) {
          inputEl.value = matches[0] + ' ';
        } else {
          print(matches.join('  '));
        }
      } else {
        const cmd = parts[0];
        const partial = parts.slice(1).join(' ');
        const subs = cmd === 'help' ? commandNames : (subcommands[cmd] || []);
        if (subs.length === 0) return;
        const matches = getSuggestions(partial, subs);
        if (matches.length === 0) return;
        if (matches.length === 1) {
          inputEl.value = cmd + ' ' + matches[0] + ' ';
        } else {
          print(matches.join('  '));
        }
      }
      autoResize();
      return;
    }

    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      const value = inputEl.value;
      inputEl.value = '';
      autoResize();
      if (value) print(promptEl.textContent + value + '^C');
      return;
    }

    if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      clear();
      return;
    }
  });

  inputEl.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;
    inputEl.value = inputEl.value.substring(0, start) + text + inputEl.value.substring(end);
    inputEl.selectionStart = inputEl.selectionEnd = start + text.length;
    autoResize();
  });

  print('Welcome to Terminal Portfolio (embedded)');
  print("Type 'help' to get started.");

  inputEl.focus();
}
