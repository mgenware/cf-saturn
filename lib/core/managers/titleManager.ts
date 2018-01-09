import * as mfs from 'm-fs';
import * as nodepath from 'path';
import defs from '../../defs';
import { State } from '../state';
import PathManager from './pathManager';
const trimEnd = require('lodash.trimend') as any;

class TitleExtractor {
  static async titleFromFileAsync(absFile: string): Promise<string> {
    const content = await mfs.readTextFileAsync(absFile);
    return await this.titleFromFileContentAsync(content, absFile);
  }

  static async titleFromFileContentAsync(content: string, logFile: string): Promise<string> {
    const firstLine = content.split('\n').shift();
    if (!firstLine) {
      throw new Error(`Cannot find a valid title in file: "${logFile}"`);
    }
    let title: string = firstLine;
    title = title.substr(1);
    return title.trim();
  }

  static async titleFromDirAsync(absDir: string): Promise<string> {
    // check dir/t.txt
    const file = nodepath.join(absDir, defs.TitleFile);
    let displayTitle: string = '';
    if (await mfs.fileExists(file)) {
      displayTitle = await mfs.readTextFileAsync(file);
    } else {
      // if dir/t.txt doesn't exist, take directory name as title
      displayTitle = nodepath.basename(absDir);
    }
    return displayTitle.trim();
  }

  static async attachedTitleFromDirAsync(absDir: string): Promise<string|null> {
    const file = nodepath.join(absDir, defs.AttachedTitleFile);
    if (await mfs.fileExists(file)) {
      const title = await mfs.readTextFileAsync(file);
      return trimEnd(title);
    }
    return null;
  }
}

export default class TitleManager {
  constructor(
    public state: State,
    public pathManager: PathManager,
  ) {}

  async titleFromFileAsync(relFile: string): Promise<string> {
    const state = this.state;
    if (state.fileTitle[relFile]) {
      return state.fileTitle[relFile];
    }

    const path = this.pathManager.srcPath(relFile);
    return TitleExtractor.titleFromFileAsync(path);
  }

  async titleFromDirAsync(relDir: string): Promise<string> {
    const state = this.state;
    if (state.dirTitle[relDir]) {
      return state.dirTitle[relDir];
    }

    const path = this.pathManager.srcPath(relDir);
    return await TitleExtractor.titleFromDirAsync(path);
  }

  async attachedTitleFromDirAsync(relDir: string): Promise<string|null> {
    const state = this.state;
    if (state.attachedDirTitle[relDir]) {
      return state.attachedDirTitle[relDir];
    }

    const path = this.pathManager.srcPath(relDir);
    return await TitleExtractor.attachedTitleFromDirAsync(path);
  }
}
