export default async function cat({ args, flags, print, fs }) {
  if (flags.includes('help')) {
    print('cat -- Print file contents');
    print('');
    print('Usage:');
    print('  cat <path>');
    return;
  }
  if (args.length === 0) {
    print('cat: missing operand');
    return;
  }
  for (const path of args) {
    if (!fs.exists(path)) {
      print(`cat: ${path}: No such file or directory`);
    } else if (fs.isDir(path)) {
      print(`cat: ${path}: Is a directory`);
    } else {
      const content = await fs.cat(path);
      print(content === null ? `cat: ${path}: Unable to read file` : content);
    }
  }
}
