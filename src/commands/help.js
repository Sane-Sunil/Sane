function showHelp(print) {
  print('\n');
  print('help -- Show available commands');
  print('');
  print('Usage:');
  print('  help                    Show this help message');
  print('  help <command>          Show help for a specific command');
  print('\n');
}

export default function help({ args, flags, print, commands }) {
  if (flags.includes('help')) {
    showHelp(print);
    return;
  }

  if (args.length > 0) {
    const target = args[0];
    if (commands[target]) {
      print(`See: ${target} --help`);
    } else {
      print(`shell: help: ${target}: no such command`);
    }
    return;
  }

  print('Available commands:');
  print('');
  print('  about       Show information about me');
  print('  skills      List my technical skills');
  print('  experience  Show work experience');
  print('  education   Show educational background');
  print('  projects    Show my projects');
  print('  contact     Show contact information');
  print('  clear       Clear the terminal screen');
  print('  help        Show this help message');
  print('  echo        Echo back input');
}
