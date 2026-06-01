import { printObj } from '../utils/print.js';

function showHelp(print) {
  print('\n');
  print('experience -- Show work experience');
  print('');
  print('Usage:');
  print('  experience show                  Show work experience');
  print('\n');
}

export default function experience({ args, flags, print, data }) {
  if (flags.includes('help') || args.length === 0) {
    showHelp(print);
    return;
  }

  const unknownFlags = flags.filter(f => f !== 'help');
  if (unknownFlags.length > 0) {
    print(`experience: unrecognized flag --${unknownFlags[0]}`);
    showHelp(print);
    return;
  }

  if (args[0] === 'show') {
    if (args.length > 1) {
      print(`experience: unrecognized subcommand "${args[1]}"`);
      showHelp(print);
      return;
    }
    data.experience.forEach(e => {
      print(`${e.role} at ${e.company}`);
      printObj(print, e, { skip: ['role', 'company'], indent: 2 });
      print('');
    });
  } else {
    print(`experience: unrecognized subcommand "${args[0]}"`);
    showHelp(print);
  }
}
