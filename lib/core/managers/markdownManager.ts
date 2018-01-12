import defs from '../../defs';
import rename from 'node-rename-path';
import * as mfs from 'm-fs';
import PathManager from './pathManager';
const Markdown = require('markdown-it-coldmark');
const coldmark = new Markdown('coldmark');

export default class MarkdownManager {
  constructor(
    public pathManager: PathManager,
  ) {}

  async convertFileAsync(relFile: string): Promise<void> {
    // read the content of file
    const content = await mfs.readTextFileAsync(this.pathManager.srcPath(relFile));
    // generate markdown
    const html = this.convert(content);
    // write to file
    const htmlFile = this.rename(this.pathManager.destPath(relFile));
    await mfs.writeFileAsync(htmlFile, html);
  }

  private convert(content: string): string {
    return coldmark.render(content);
  }

  private rename(file: string): string {
    return rename(file, (_) => {
      return { ext: defs.dest.contentExt };
    });
  }
}
