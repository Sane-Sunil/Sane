export default async function edit({ args, flags, print, fs }) {
  if (flags.includes('help')) {
    print('edit -- Edit file contents');
    print('');
    print('Usage:');
    print('  edit <path>');
    return;
  }
  if (args.length === 0) {
    print('edit: missing operand');
    return;
  }

  const path = args[0];

  if (!fs.exists(path)) {
    print(`edit: '${path}': No such file or directory`);
    return;
  }
  if (fs.isDir(path)) {
    print(`edit: '${path}': Is a directory`);
    return;
  }

  const initialContent = (await fs.cat(path)) || '';
  let savedContent = initialContent;

  return new Promise((resolve) => {
    const output = document.getElementById('output');
    const inputLine = document.getElementById('input-line');

    const saved = [];
    while (output.firstChild && output.firstChild !== inputLine) {
      saved.push(output.firstChild);
      output.removeChild(output.firstChild);
    }

    const prevDisplay = inputLine.style.display;
    inputLine.style.display = 'none';

    const editor = document.createElement('div');
    editor.id = 'tui-editor';
    editor.style.cssText = 'height:100%;display:flex;flex-direction:column;font-family:monospace;font-size:13px;';

    const topBar = document.createElement('div');
    topBar.style.cssText = 'background:#181825;color:#cdd6f4;padding:4px 10px;flex-shrink:0;white-space:pre;border-bottom:1px solid #313244;';
    topBar.textContent = '  FILE: ' + path;
    editor.appendChild(topBar);

    const textarea = document.createElement('textarea');
    textarea.style.cssText = [
      'width:100%;flex:1;background:#1e1e2e;color:#cdd6f4;',
      'border:none;padding:4px 10px;font-family:monospace;font-size:13px;',
      'line-height:1.6;resize:none;outline:none;box-sizing:border-box;',
      'white-space:pre;overflow-wrap:normal;overflow-x:auto;caret-color:#f5c2e7;'
    ].join('');
    textarea.value = initialContent;
    textarea.spellcheck = false;
    editor.appendChild(textarea);

    const bottomBar = document.createElement('div');
    bottomBar.style.cssText = 'background:#181825;color:#a6e3a1;padding:4px 10px;flex-shrink:0;white-space:pre;border-top:1px solid #313244;';
    bottomBar.textContent = '  INSERT';
    editor.appendChild(bottomBar);

    function updateStatus() {
      const before = textarea.value.slice(0, textarea.selectionStart);
      const ln = before.split('\n').length;
      const col = before.split('\n').pop().length + 1;
      const total = textarea.value.split('\n').length;
      topBar.textContent = '  FILE: ' + path + '  |  Lines: ' + total;
      bottomBar.textContent = '  INSERT  |  Ln ' + ln + ', Col ' + col + '  |  ^S save  |  ^Q quit';
    }

    textarea.addEventListener('keyup', updateStatus);
    textarea.addEventListener('click', updateStatus);
    textarea.addEventListener('input', updateStatus);

    textarea.addEventListener('keydown', function onTextareaKey(e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.slice(0, start) + '  ' + textarea.value.slice(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        updateStatus();
      }
    });

    let quitting = false;

    function onGlobalKey(e) {
      if (e.ctrlKey && (e.key === 'q' || e.key === 'Q')) {
        e.preventDefault();
        e.stopPropagation();
        quit();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        quit();
        return;
      }

      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        fs.write(path, textarea.value);
        savedContent = textarea.value;
        topBar.textContent = '  FILE: ' + path + '  [saved]';
        setTimeout(updateStatus, 1500);
        return;
      }
    }

    function quit() {
      if (quitting) return;
      const modified = textarea.value !== savedContent;
      if (!modified) {
        cleanup();
        resolve();
        return;
      }
      quitting = true;
      bottomBar.textContent = '  Save changes?  (y)es  (n)o  (c)ancel';
      bottomBar.style.color = '#f38ba8';
      textarea.blur();

      function onQuitKey(e2) {
        e2.preventDefault();
        e2.stopPropagation();
        const key = e2.key.toLowerCase();
        if (key === 'y') {
          fs.write(path, textarea.value);
          document.removeEventListener('keydown', onQuitKey, true);
          cleanup();
          resolve();
        } else if (key === 'n') {
          document.removeEventListener('keydown', onQuitKey, true);
          cleanup();
          resolve();
        } else if (key === 'c' || key === 'escape') {
          document.removeEventListener('keydown', onQuitKey, true);
          quitting = false;
          bottomBar.style.color = '#a6e3a1';
          updateStatus();
          textarea.focus();
        }
      }
      document.addEventListener('keydown', onQuitKey, true);
    }

    document.addEventListener('keydown', onGlobalKey, true);

    output.insertBefore(editor, inputLine);
    textarea.focus();
    updateStatus();

    function cleanup() {
      document.removeEventListener('keydown', onGlobalKey, true);
      editor.remove();
      for (const el of saved) {
        output.insertBefore(el, inputLine);
      }
      inputLine.style.display = prevDisplay;
      const field = document.getElementById('input-field');
      if (field) field.focus();
    }
  });
}
