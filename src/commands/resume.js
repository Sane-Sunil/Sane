function showHelp(print) {
  print('\n');
  print('resume -- Show or download my resume');
  print('');
  print('Usage:');
  print('  resume                    Show resume information');
  print('  resume -l                 Print resume URL (for piping to download)');
  print('  resume -l | download      Download the resume file');
  print('  resume --help             Show this help message');
  print('\n');
}

export default function resume({ args, flags, print, data }) {
  if (flags.includes('help')) {
    showHelp(print);
    return;
  }

  const url = data.resumeUrl;

  if (flags.includes('l')) {
    if (!url) {
      print('resume: no resume URL configured.');
      return;
    }
    print(url);
    return;
  }

  if (args.length === 0) {
    if (!url) {
      print('\n  No resume URL configured.');
      print('  Contact the site owner to add one.\n');
      return;
    }
    print('\n');
    print('resume -- Get my resume:');
    print('Usage:');
    print('  resume -l                      Show resume URL');
    print('  resume -l | download           Download resume');
    print('\n');
    return;
  }

  print('resume: unrecognized subcommand "' + args[0] + '"');
  showHelp(print);
}
