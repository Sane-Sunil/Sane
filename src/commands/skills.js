function showHelp(print) {
  print('\n');
  print('skills -- List my technical skills');
  print('');
  print('Usage:');
  print('  skills show                  List all skills in terminal');
  print('\n');
}

export default function skills({ args, flags, print, data }) {
  if (flags.includes('help') || args.length === 0) {
    showHelp(print);
    return;
  }

  const unknownFlags = flags.filter(f => f !== 'help');
  if (unknownFlags.length > 0) {
    print(`skills: unrecognized flag --${unknownFlags[0]}`);
    showHelp(print);
    return;
  }

  if (args[0] === 'show') {
    if (args.length > 1) {
      print(`skills: unrecognized subcommand "${args[1]}"`);
      showHelp(print);
      return;
    }
    const s = data.skills;
    print('\n');
    for (const [category, items] of Object.entries(s)) {
      print(`${category.charAt(0).toUpperCase() + category.slice(1)}:`);
      items.forEach(item => print(`  ${item}`));
      print('');
    }
  } else {
    print(`skills: unrecognized subcommand "${args[0]}"`);
    showHelp(print);
  }
}
