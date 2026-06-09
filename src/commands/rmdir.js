export default function rmdir({ args, flags, print, fs }) {
  if (flags.includes('help')) {
    print('rmdir -- Remove empty directories');
    print('');
    print('Usage:');
    print('  rmdir <path>');
    return;
  }
  if (args.length === 0) {
    print('rmdir: missing operand');
    return;
  }
  for (const path of args) {
    if (!fs.exists(path)) {
      print(`rmdir: failed to remove '${path}': No such file or directory`);
    } else if (!fs.isDir(path)) {
      print(`rmdir: failed to remove '${path}': Not a directory`);
    } else if (!fs.rmdir(path)) {
      print(`rmdir: failed to remove '${path}': Directory not empty`);
    }
  }
}
