export function createOutput(outputEl, inputLine) {
  return {
    print(text) {
      const line = document.createElement('div');
      line.textContent = text;
      outputEl.insertBefore(line, inputLine);
      outputEl.scrollTop = outputEl.scrollHeight;
    },

    printHtml(html) {
      const line = document.createElement('div');
      line.style.whiteSpace = 'pre';
      line.style.lineHeight = '1';
      line.innerHTML = html;
      outputEl.insertBefore(line, inputLine);
      outputEl.scrollTop = outputEl.scrollHeight;
    },

    clear() {
      const children = Array.from(outputEl.children);
      children.forEach(child => {
        if (child !== inputLine) child.remove();
      });
    }
  };
}
