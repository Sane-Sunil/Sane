export default function tree({ args, flags, print, fs }) {
  if (flags.includes('help')) {
    print('tree -- Display directory tree');
    print('');
    print('Usage:');
    print('  tree [path]');
    return;
  }
  const path = args[0] || '.';
  const lines = fs.tree(path);
  if (!lines) {
    print(`tree: ${path}: No such directory`);
    return;
  }
  lines.forEach(l => print(l));
}
