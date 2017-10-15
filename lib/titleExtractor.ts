import * as mfs from 'm-fs';
import * as nodepath from 'path';

export default class TitleExtractor {
  static get TITLE_FILE(): string {
    return 't.txt';
  }

  static get ATTACHED_TITLE_FILE(): string {
    return 't_attached.txt';
  }

  static async fromFile(file: string): Promise<string> {
    const content = await mfs.readTextFileAsync(file);
    return this.fromFileContent(content, file);
  }

  static fromFileContent(content: string, logFile: string): string {
    const firstLine = content.split('\n').shift();
    if (!firstLine) {
      throw new Error(`Cannot find a valid title in file: "${logFile}"`);
    }
    let title: string = firstLine;
    title = title.substr(1);
    return title.trim();
  }

  static async fromDir(dir: string): Promise<string> {
    // check dir/t.txt
    const file = nodepath.join(dir, this.TITLE_FILE);
    let displayTitle: string = '';
    if (await mfs.fileExists(file)) {
      displayTitle = await mfs.readTextFileAsync(file);
    } else {
      // if dir/t.txt doesn't exist, take directory name as title
      displayTitle = nodepath.basename(dir);
    }
    return displayTitle;
  }

  static async attachedTitleFromDir(dir: string): Promise<string|null> {
    const file = nodepath.join(dir, this.ATTACHED_TITLE_FILE);
    if (await mfs.fileExists(file)) {
      return await mfs.readdirAsync(file);
    }
    return null;
  }
}
