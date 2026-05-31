function showHelp(print) {
  print('\n');
  print('contact -- Show contact information');
  print('');
  print('Usage:');
  print('  contact show                  Show contact information');
  print('\n');
}

export default function contact({ args, flags, print, data }) {
  if (flags.includes('help') || args.length === 0) {
    showHelp(print);
    return;
  }

  const unknownFlags = flags.filter(f => f !== 'help');
  if (unknownFlags.length > 0) {
    print(`contact: unrecognized flag --${unknownFlags[0]}`);
    showHelp(print);
    return;
  }

  if (args[0] === 'show') {
    if (args.length > 1) {
      print(`contact: unrecognized subcommand "${args[1]}"`);
      showHelp(print);
      return;
    }
    const c = data.contact;
    print(`Email:    ${c.email}`);
    print(`GitHub:   ${c.github}`);
    print(`LinkedIn: ${c.linkedin}`);
    print('\n');
  } else {
    print(`contact: unrecognized subcommand "${args[0]}"`);
    showHelp(print);
  }
}
