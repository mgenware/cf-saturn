const Remarkable = require('remarkable');
const nodeRename = require('node-rename-path');

const md = new Remarkable({
  html:         false,        // Enable HTML tags in source
  xhtmlOut:     true,        // Use '/' to close single tags (<br />)
  breaks:       true,        // Convert '\n' in paragraphs into <br>
  langPrefix:   'lang-',  // CSS language prefix for fenced blocks
  linkify:      true,        // Autoconvert URL-like text to links
});

export function convert(content: string): string {
  return md.render(content);
}

export function rename(file: string): string {
  return nodeRename(file, (pathObj: any) => {
    pathObj.ext = 'g.html';
  });
}
