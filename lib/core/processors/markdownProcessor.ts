import IProcessor from './IProcessor';
import {State} from '../state';
import MarkdownManager from '../managers/markdownManager';
import PathManager from '../managers/pathManager';
import * as mfs from 'm-fs';

export default class MarkdownProcessor implements IProcessor {
  constructor(
    public markdownManager: MarkdownManager,
    public pathManager: PathManager,
  ) {
  }

  async process(relFile: string, _: State): Promise<void> {
    await this.markdownToHTMLAsync(relFile);
  }

  private async markdownToHTMLAsync(relFile: string) {
    // read the content of file
    const content = await mfs.readTextFileAsync(this.pathManager.srcPath(relFile));
    // generate markdown
    const html = this.markdownManager.convert(content);
    // write to file
    const htmlFile = this.markdownManager.rename(this.pathManager.destPath(relFile));
    await mfs.writeFileAsync(htmlFile, html);
  }
}
