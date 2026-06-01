import { printObj } from '../utils/print.js';
import { imgToAscii, renderAsciiHtml } from '../utils/ascii.js';

function showHelp(print) {
  print('\n');
  print('about -- Show information about me');
  print('');
  print('Usage:');
  print('  about show                  Show information about me');
  print('  about show --img            Display profile image');
  print('  about -l --img              Output image URL');
  print('  about -l --img | download   Download original image');
  print('\n');
}

export default async function about({ args, flags, print, printHtml, data, pipe }) {
  const validFlags = ['help', 'img', 'l'];
  const unknownFlags = flags.filter(f => !validFlags.includes(f));
  if (unknownFlags.length > 0) {
    print(`about: unrecognized flag --${unknownFlags[0]}`);
    showHelp(print);
    return;
  }

  if (flags.includes('l')) {
    if (flags.includes('img')) {
      print(data.about.imageUrl || '');
    } else {
      print('about: specify --img to list the image URL.');
    }
    return;
  }

  if (flags.includes('help') || args.length === 0) {
    showHelp(print);
    return;
  }

  if (args[0] === 'show') {
    if (args.length > 1) {
      print(`about: unrecognized subcommand "${args[1]}"`);
      showHelp(print);
      return;
    }

    if (flags.includes('img')) {
      if (pipe !== undefined) {
        print(data.about.imageUrl || '');
        return;
      }
      if (data.about.imageUrl) {
        print('');
        try {
          const ascii = await imgToAscii(data.about.imageUrl);
          renderAsciiHtml(ascii).forEach(line => printHtml(line));
          print('');
        } catch {
          print('  (could not load profile image)');
          print('');
        }
      } else {
        print('  No image URL configured.');
      }
      return;
    }

    print('');
    if (data.about.imageUrl) {
      try {
        const ascii = await imgToAscii(data.about.imageUrl);
        renderAsciiHtml(ascii).forEach(line => printHtml(line));
        print('');
      } catch {
        print('  (could not load profile image)');
        print('');
      }
    }
    printObj(print, data.about, { skip: ['bio', 'imageUrl'], para: ['bio'] });
  } else {
    print(`about: unrecognized subcommand "${args[0]}"`);
    showHelp(print);
  }
}
