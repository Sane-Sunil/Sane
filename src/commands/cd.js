export default function cd({ args, flags, print, fs }) {
  if (flags.includes('help')) {
    print('cd -- Change current directory');
    print('');
    print('Usage:');
    print('  cd [path]');
    return;
  }
  const path = args[0];
  if (!fs.cd(path)) {
    print(`cd: ${path || ''}: No such directory`);
  }
}
