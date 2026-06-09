import echo from './echo.js';
import help from './help.js';
import about from './about.js';
import skills from './skills.js';
import contact from './contact.js';
import education from './education.js';
import experience from './experience.js';
import projects from './projects.js';
import clear from './clear.js';
import kill from './kill.js';
import download from './download.js';
import resume from './resume.js';
import startgui from './startgui.js';
import ls from './ls.js';
import cd from './cd.js';
import pwd from './pwd.js';
import mkdir from './mkdir.js';
import rmdir from './rmdir.js';
import newCmd from './new.js';
import rm from './rm.js';
import cp from './cp.js';
import mv from './mv.js';
import cat from './cat.js';
import tree from './tree.js';
import edit from './edit.js';

export const commands = {
  echo,
  help,
  about,
  skills,
  contact,
  education,
  experience,
  projects,
  clear,
  kill,
  download,
  resume,
  startgui,
  ls,
  cd,
  pwd,
  mkdir,
  rmdir,
  new: newCmd,
  rm,
  cp,
  mv,
  cat,
  tree,
  edit,
};
