function showHelp(print) {
  print('\n');
  print('about -- Show information about me');
  print('');
  print('Usage:');
  print('  about show                  Show information about me');
  print('\n');
}

export default function about({ args, flags, print, data }) {
  if (flags.includes('help') || args.length === 0) {
    showHelp(print);
    return;
  }

  const unknownFlags = flags.filter(f => f !== 'help');
  if (unknownFlags.length > 0) {
    print(`about: unrecognized flag --${unknownFlags[0]}`);
    showHelp(print);
    return;
  }

  if (args[0] === 'show') {
    if (args.length > 1) {
      print(`about: unrecognized subcommand "${args[1]}"`);
      showHelp(print);
      return;
    }
    const a = data.about;
    print(`Name:     ${a.name}`);
    print(`Title:    ${a.title}`);
    print(`Location: ${a.location}`);
    print('\n');
    print(a.bio);
  } else {
    print(`about: unrecognized subcommand "${args[0]}"`);
    showHelp(print);
  }
}
