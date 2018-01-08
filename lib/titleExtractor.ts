import * as mfs from 'm-fs';
import * as nodepath from 'path';
import * as defs from 'defs';
const trimEnd = require('lodash.trimend') as any;

export default class TitleExtractor {
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
    const file = nodepath.join(dir, defs.TitleFile);
    let displayTitle: string = '';
    if (await mfs.fileExists(file)) {
      displayTitle = await mfs.readTextFileAsync(file);
    } else {
      // if dir/t.txt doesn't exist, take directory name as title
      displayTitle = nodepath.basename(dir);
    }
    return displayTitle.trim();
  }

  static async attachedTitleFromDir(dir: string): Promise<string|null> {
    const file = nodepath.join(dir, defs.AttachedTitleFile);
    if (await mfs.fileExists(file)) {
      const title = await mfs.readTextFileAsync(file);
      return trimEnd(title);
    }
    return null;
  }
}
