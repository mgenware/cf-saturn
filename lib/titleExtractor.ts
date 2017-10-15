import * as mfs from 'm-fs';
import * as nodepath from 'path';

const DIR_TITLE_FILE = 't.txt';

export default class TitleExtractor {
  static get TITLE_FILE(): string {
    return DIR_TITLE_FILE;
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
    const tTxt = nodepath.join(dir, DIR_TITLE_FILE);
    let displayTitle: string = '';
    if (await mfs.fileExists(tTxt)) {
      displayTitle = await mfs.readFileAsync(tTxt, 'utf8');
    } else {
      // if dir/t.txt doesn't exist, take directory name as title
      displayTitle = nodepath.basename(dir);
    }
    return displayTitle;
  }
}
