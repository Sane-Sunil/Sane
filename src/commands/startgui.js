import { switchToGui } from '../gui/state.js';

function showHelp(print) {
  print('\n');
  print('startgui -- Switch to GUI mode');
  print('');
  print('Usage:');
  print('  startgui                   Switch to graphical interface');
  print('\n');
}

export default function startgui({ args, flags, print }) {
  if (flags.includes('help')) {
    showHelp(print);
    return;
  }
  print('Switching to GUI mode...');
  switchToGui();
}
