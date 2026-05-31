export function createInput(inputEl, history, callbacks = {}) {
  let submitCallback = null;

  function autoResize() {
    inputEl.style.height = 'auto';
    inputEl.style.height = inputEl.scrollHeight + 'px';
  }

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const value = inputEl.value;
      history.add(value.trim());
      if (submitCallback) submitCallback(value);
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
      if (callbacks.onTab) callbacks.onTab(inputEl.value);
      return;
    }

    if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      if (callbacks.onCtrlL) callbacks.onCtrlL();
      return;
    }
  });

  inputEl.addEventListener('input', autoResize);

  inputEl.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;
    inputEl.value = inputEl.value.substring(0, start) + text + inputEl.value.substring(end);
    inputEl.selectionStart = inputEl.selectionEnd = start + text.length;
    autoResize();
  });

  return {
    onSubmit(callback) { submitCallback = callback; },
    focus() { inputEl.focus(); },
    getValue() { return inputEl.value; },
    setValue(val) { inputEl.value = val; autoResize(); },
    clear() { inputEl.value = ''; autoResize(); }
  };
}
