export default function pwd({ flags, print, fs }) {
  if (flags.includes('help')) {
    print('pwd -- Print working directory');
    print('');
    print('Usage:');
    print('  pwd');
    return;
  }
  print(fs.pwd());
}
