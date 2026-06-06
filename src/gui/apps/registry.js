import { renderAbout } from './about.js';
import { renderSkills } from './skills.js';
import { renderProjects } from './projects.js';
import { renderExperience } from './experience.js';
import { renderContact } from './contact.js';
import { renderSettings, initSettings } from './settings.js';
import { renderResume } from './resume.js';
import { renderFileManager, initFileManager } from './filemanager/view.js';

export const apps = [
  { id: 'about', name: 'About', icon: '👤', color: '#4fc3f7', render: renderAbout },
  { id: 'skills', name: 'Skills', icon: '🛠️', color: '#81c784', render: renderSkills },
  { id: 'projects', name: 'Projects', icon: '🚀', color: '#ffb74d', render: renderProjects },
  { id: 'experience', name: 'Experience', icon: '💼', color: '#ba68c8', render: renderExperience },
  { id: 'contact', name: 'Contact', icon: '📧', color: '#e57373', render: renderContact },
  { id: 'settings', name: 'Settings', icon: '⚙️', color: '#888888', render: renderSettings, init: initSettings },
  { id: 'resume', name: 'Resume', icon: '📄', color: '#e57373', render: renderResume },
  { id: 'filemanager', name: 'File Manager', icon: '🗂️', color: '#78909c', render: renderFileManager, init: initFileManager },
  { id: 'file-viewer', name: 'File Viewer', icon: '📄', color: '#78909c' },
];
