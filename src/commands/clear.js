function showHelp(print) {
  print('\n');
  print('clear -- Clear the terminal screen');
  print('');
  print('Usage:');
  print('  clear                    Clear the terminal screen');
  print('\n');
}

export default function clear({ flags, print, clear }) {
  if (flags.includes('help')) {
    showHelp(print);
    return;
  }

  clear();
}
