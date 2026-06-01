import { commands } from '../commands/index.js';
import { findSimilar } from './suggestions.js';

export function createExecutor(output, data, extra = {}) {
  return {
    execute(parsed, ctxOverrides = {}) {
      const { command, args, flags } = parsed;
      const handler = commands[command];

      if (!handler) {
        output.print(`shell: ${command}: command not found`);
        const similar = findSimilar(command, Object.keys(commands));
        if (similar.length > 0) {
          output.print(`Did you mean?  ${similar.join(', ')}`);
        }
        return;
      }

      return handler({ args, flags, print: (text) => output.print(text), clear: () => output.clear(), data, commands, ...extra, ...ctxOverrides });
    }
  };
}
