function showHelp(print) {
  print('\n');
  print('echo -- Echo back input');
  print('');
  print('Usage:');
  print('  echo <text>                  Print the provided text back to the terminal');
  print('\n');
}

export default function echo({ args, flags, print }) {
  if (flags.includes('help')) {
    showHelp(print);
    return;
  }

  print(args.join(' '));
}
