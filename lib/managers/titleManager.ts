import * as mfs from 'm-fs';
import * as nodepath from 'path';
import defs from '../defs';
const trimEnd = require('lodash.trimend') as any;

export class TitleManager {
  async getFromFileAsync(file: string): Promise<string> {
    const content = await mfs.readTextFileAsync(file);
    return await this.getFromFileContentAsync(content, file);
  }

  async getFromFileContentAsync(content: string, logFile: string): Promise<string> {
    const firstLine = content.split('\n').shift();
    if (!firstLine) {
      throw new Error(`Cannot find a valid title in file: "${logFile}"`);
    }
    let title: string = firstLine;
    title = title.substr(1);
    return title.trim();
  }

  async getFromDirAsync(dir: string): Promise<string> {
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

  async getAttachedTitleFromDirAsync(dir: string): Promise<string|null> {
    const file = nodepath.join(dir, defs.AttachedTitleFile);
    if (await mfs.fileExists(file)) {
      const title = await mfs.readTextFileAsync(file);
      return trimEnd(title);
    }
    return null;
  }
}

export default new TitleManager();
