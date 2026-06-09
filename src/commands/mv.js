export default function mv({ args, flags, print, fs }) {
  if (flags.includes('help')) {
    print('mv -- Move/rename files and directories');
    print('');
    print('Usage:');
    print('  mv <source> <destination>');
    return;
  }
  if (args.length < 2) {
    print('mv: missing file operand');
    return;
  }
  if (!fs.exists(args[0])) {
    print(`mv: cannot stat '${args[0]}': No such file or directory`);
    return;
  }
  if (!fs.mv(args[0], args[1])) {
    print(`mv: cannot move '${args[0]}' to '${args[1]}': File exists`);
  }
}
