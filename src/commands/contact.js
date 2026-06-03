import { printObj } from '../utils/print.js';

const MSG = {
  CONTACT_INFO: 'Contact Information',
  USAGE: '\ncontact -- Show contact information\n\nUsage:\n  contact show                  Show contact information\n\n',
};

function printHelp(print) {
  print('\n');
  print(MSG.USAGE);
  print('\n');
}

export default function contact({ args, flags, print, data }) {
  // Show help if help flag or no args
  if (flags.includes('help') || args.length === 0) {
    printHelp(print);
    return;
  }

  // Validate flags
  const unknownFlags = flags.filter(flag => flag !== 'help');
  if (unknownFlags.length > 0) {
    print(`contact: unrecognized flag --${unknownFlags[0]}`);
    printHelp(print);
    return;
  }

  // Handle subcommands
  const subcommand = args[0];
  if (subcommand === 'show') {
    if (args.length > 1) {
      print(`contact: unrecognized subcommand "${args[1]}"`);
      printHelp(print);
      return;
    }
    print(MSG.CONTACT_INFO);
    printObj(print, data.contact);
    print('\n');
    return;
  }

  // Unknown subcommand
  print(`contact: unrecognized subcommand "${subcommand}"`);
  printHelp(print);
}