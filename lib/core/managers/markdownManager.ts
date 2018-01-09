import defs from '../../defs';
const Markdown = require('markdown-it-coldmark');
const nodeRename = require('node-rename-path');

const coldmark = new Markdown('coldmark');

export default class MarkdownManager {
  convert(content: string): string {
    return coldmark.render(content);
  }

  rename(file: string): string {
    return nodeRename(file, (pathObj: any) => {
      pathObj.ext = defs.GeneratedHTMLExt;
    });
  }
}
