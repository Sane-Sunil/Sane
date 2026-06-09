export function createPrompt(fs) {
  const username = 'sane';
  const hostname = 'portfolio';

  return {
    get() {
      const dir = fs ? fs.getPrompt() : '~';
      return `${username}@${hostname}:$ `;
    }
  };
}
