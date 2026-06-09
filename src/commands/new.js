export default function newCmd({ args, flags, print, fs }) {
  if (flags.includes('help')) {
    print('new -- Create empty files');
    print('');
    print('Usage:');
    print('  new <path>');
    return;
  }
  if (args.length === 0) {
    print('new: missing operand');
    return;
  }
  for (const path of args) {
    if (fs.exists(path)) {
      print(`new: cannot create '${path}': File exists`);
    } else if (!fs.newFile(path)) {
      print(`new: cannot create '${path}': No such parent directory`);
    }
  }
}
