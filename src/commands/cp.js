export default function cp({ args, flags, print, fs }) {
  if (flags.includes('help')) {
    print('cp -- Copy files and directories');
    print('');
    print('Usage:');
    print('  cp <source> <destination>');
    return;
  }
  if (args.length < 2) {
    print('cp: missing file operand');
    return;
  }
  if (!fs.exists(args[0])) {
    print(`cp: cannot stat '${args[0]}': No such file or directory`);
    return;
  }
  if (!fs.cp(args[0], args[1])) {
    print(`cp: cannot copy '${args[0]}' to '${args[1]}': File exists`);
  }
}
