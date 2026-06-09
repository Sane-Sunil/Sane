export default function ls({ args, flags, print, fs }) {
  if (flags.includes('help')) {
    print('ls -- List directory contents');
    print('');
    print('Usage:');
    print('  ls [path]');
    return;
  }
  const path = args[0] || '.';
  const entries = fs.ls(path);
  if (entries === null) {
    print(`ls: ${path}: No such directory`);
    return;
  }
  if (entries.length === 0) return;
  print(entries.join('  '));
}
