function showHelp(print) {
  print('\n');
  print('kill -- Close the terminal tab');
  print('');
  print('Usage:');
  print('  kill                       Close the current browser tab');
  print('  kill --help                Show this help message');
  print('\n');
}

export default function kill({ args, flags, print, clear, embedded }) {
  if (flags.includes('help')) {
    showHelp(print);
    return;
  }

  if (embedded) {
    print('Closing terminal...');
    const app = document.querySelector('.app-overlay[data-app="terminal"]');
    if (app) {
      const closeBtn = app.querySelector('.app-window-close');
      if (closeBtn) closeBtn.click();
    }
    return;
  }

  window.close();

  if (!window.closed) {
    print('');
    print('  ╔══════════════════════════════════════╗');
    print('  ║  This browser blocks auto-close.     ║');
    print('  ║  Press Ctrl+W to close this tab.     ║');
    print('  ╚══════════════════════════════════════╝');
  }
}
