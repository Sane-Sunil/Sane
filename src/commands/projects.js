function openUrl(url) {
  if (url) window.open(url, '_blank');
}

function showHelp(print) {
  print('\n');
  print('projects -- Browse and open projects');
  print('');
  print('Usage:');
  print('  projects show                  List all projects in terminal');
  print('  projects -p <name>             Open hosted project URL');
  print('  projects -r <name>             Open repository URL');
  print('  projects -p -r <name>          Open both URLs');
  print('\n');
}

export default function projects({ args, flags, print, data }) {
  if (flags.includes('help') || args.length === 0) {
    showHelp(print);
    return;
  }

  const validFlags = ['help', 'p', 'r'];
  const unknownFlags = flags.filter(f => !validFlags.includes(f));
  if (unknownFlags.length > 0) {
    print(`projects: unrecognized flag --${unknownFlags[0]}`);
    showHelp(print);
    return;
  }

  const hasAction = flags.includes('p') || flags.includes('r');

  if (args[0] === 'show' && !hasAction) {
    data.projects.forEach(p => {
      print(`${p.name}`);
      print(`  ${p.description}`);
      print(`  Tech: ${p.tech.join(', ')}`);
      print('');
    });
    print('\n');
    return;
  }

  if (hasAction) {
    if (args.length === 0 || !args[0].trim()) {
      print('Specify a project name.');
      return;
    }

    if (args.length > 1) {
      print('Unexpected extra arguments.');
      print('Use quotes for multi-word names: -p "Project Name"');
      return;
    }

    const lower = args[0].trim().toLowerCase();
    const matches = data.projects.filter(p =>
      p.name.toLowerCase().includes(lower)
    );

    if (matches.length === 0) {
      print('No matching projects found.');
      return;
    }

    matches.forEach(p => {
      if (flags.includes('p') && flags.includes('r')) {
        print(`Opening ${p.name}...`);
        openUrl(p.hostedUrl);
        print(`Opening ${p.name} repository...`);
        openUrl(p.repoUrl);
      } else if (flags.includes('p')) {
        print(`Opening ${p.name}...`);
        openUrl(p.hostedUrl);
      } else if (flags.includes('r')) {
        print(`Opening ${p.name} repository...`);
        openUrl(p.repoUrl);
      }
    });
    return;
  }

  showHelp(print);
}
