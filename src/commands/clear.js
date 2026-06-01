function showHelp(print) {
  print('\n');
  print('clear -- Clear the terminal screen');
  print('');
  print('Usage:');
  print('  clear                     Clear the terminal screen');
  print('  clear -h                  Clear command history from localStorage');
  print('\n');
}

export default function clear({ flags, print, clear, clearHistory }) {
  if (flags.includes('help')) {
    showHelp(print);
    return;
  }

  if (flags.includes('h')) {
    if (typeof clearHistory === 'function') clearHistory();
    print('Command history cleared.');
    return;
  }

  clear();
}
