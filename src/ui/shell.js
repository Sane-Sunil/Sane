export function initShell() {
  const terminal = document.getElementById('terminal');

  const output = document.createElement('div');
  output.id = 'output';

  const inputLine = document.createElement('div');
  inputLine.id = 'input-line';

  const prompt = document.createElement('span');
  prompt.className = 'prompt';
  prompt.textContent = 'sane@portfolio:$ ';

  const input = document.createElement('textarea');
  input.id = 'input-field';
  input.spellcheck = false;
  input.rows = 1;

  inputLine.appendChild(prompt);
  inputLine.appendChild(input);
  output.appendChild(inputLine);
  terminal.appendChild(output);

  return { terminal, output, input, inputLine };
}
