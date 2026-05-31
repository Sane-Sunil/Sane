export function createPrompt() {
  const username = 'user';
  const hostname = 'portfolio';

  return {
    get() {
      return `${username}@${hostname}:~$ `;
    }
  };
}
