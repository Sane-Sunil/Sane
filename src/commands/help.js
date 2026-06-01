function showHelp(print) {
  print('\n');
  print('help -- Show available commands');
  print('');
  print('Usage:');
  print('  help                    Show this help message');
  print('  help <command>          Show help for a specific command');
  print('\n');
}

export default async function help({ args, flags, print, commands, data }) {
  if (flags.includes('help')) {
    showHelp(print);
    return;
  }

  if (args.length > 0) {
    const target = args[0];
    if (commands[target]) {
      await commands[target]({ args: [], flags: ['help'], print, data, commands });
    } else {
      print(`shell: help: ${target}: no such command`);
    }
    return;
  }

  print('\n');
  print('Available commands:');
  print('');
  print('  about       Show information about me');
  print('  skills      List my technical skills');
  print('  experience  Show work experience');
  print('  education   Show educational background');
  print('  projects    Browse and open projects');
  print('  contact     Show contact information');
  print('  clear       Clear the terminal screen');
  print('  download    Download a file from a URL');
  print('  help        Show this help message');
  print('  echo        Echo back input');
  print('  kill        Close the portfolio tab');
  print('\n');

  print('Shortcuts:');
  print('  Ctrl+C         Cancel current input');
  print('  Ctrl+Shift+C   Copy selected text');
  print('  Ctrl+L         Clear the terminal screen');
  print('  Tab            Auto-complete commands');
  print('\n');
}
