export default function mkdir({ args, flags, print, fs }) {
  if (flags.includes('help')) {
    print('mkdir -- Create directories');
    print('');
    print('Usage:');
    print('  mkdir <path>');
    return;
  }
  if (args.length === 0) {
    print('mkdir: missing operand');
    return;
  }
  for (const path of args) {
    if (!fs.mkdir(path)) {
      print(`mkdir: cannot create directory '${path}': File exists`);
    }
  }
}
