const Markdown = require('markdown-it-coldmark');
const nodeRename = require('node-rename-path');

const coldmark = new Markdown('coldmark');
export function convert(content: string): string {
  return coldmark.render(content);
}

export function rename(file: string): string {
  return nodeRename(file, (pathObj: any) => {
    pathObj.ext = '.g.html';
  });
}
