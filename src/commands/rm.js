export default function rm({ args, flags, print, fs }) {
  const recursive = flags.some(f => f.includes('r'));
  const force = flags.some(f => f.includes('f'));

  if (flags.includes('help')) {
    print('rm -- Remove files or directories');
    print('');
    print('Usage:');
    print('  rm [-rf] <path>');
    return;
  }
  if (args.length === 0) {
    print('rm: missing operand');
    return;
  }
  for (const path of args) {
    if (!fs.exists(path)) {
      if (force) continue;
      print(`rm: cannot remove '${path}': No such file or directory`);
    } else if (fs.isDir(path)) {
      if (recursive) {
        if (!fs.rmtree(path)) {
          print(`rm: cannot remove '${path}': Operation not permitted`);
        }
      } else {
        print(`rm: cannot remove '${path}': Is a directory`);
      }
    } else if (!fs.rm(path)) {
      print(`rm: cannot remove '${path}': Operation not permitted`);
    }
  }
}
