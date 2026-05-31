function showHelp(print) {
  print('\n');
  print('education -- Show educational background');
  print('');
  print('Usage:');
  print('  education show                  Show educational background');
  print('\n');
}

export default function education({ args, flags, print, data }) {
  if (flags.includes('help') || args.length === 0) {
    showHelp(print);
    return;
  }

  const unknownFlags = flags.filter(f => f !== 'help');
  if (unknownFlags.length > 0) {
    print(`education: unrecognized flag --${unknownFlags[0]}`);
    showHelp(print);
    return;
  }

  if (args[0] === 'show') {
    if (args.length > 1) {
      print(`education: unrecognized subcommand "${args[1]}"`);
      showHelp(print);
      return;
    }
    data.education.forEach(e => {
      print(`${e.degree}`);
      print(`  School: ${e.school}`);
      print(`  Year:   ${e.year}`);
      print('\n');
    });
  } else {
    print(`education: unrecognized subcommand "${args[0]}"`);
    showHelp(print);
  }
}
