import * as mfs from 'm-fs';
import * as nodepath from 'path';
import defs from '../../defs';
import { State } from '../state';
import PathManager from './pathManager';
import { Result } from './common';
import Config from '../../config';
const escapeHTML = require('escape-html') as any;
import rename from 'node-rename-path';

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
    const file = nodepath.join(absDir, defs.src.titleFile);
    let displayTitle: string = '';
    if (await mfs.fileExists(file)) {
      displayTitle = await mfs.readTextFileAsync(file);
    } else {
      // if dir/t.txt doesn't exist, take directory name as title
      displayTitle = nodepath.basename(absDir);
    }
    return displayTitle.trim();
  }
}

export default class TitleManager {
  constructor(
    public config: Config,
    public state: State,
    public pathManager: PathManager,
  ) {}

  async updateFileTitleAsync(relFile: string): Promise<Result<string>> {
    const state = this.state;
    if (state.fileTitle[relFile]) {
      return new Result(state.fileTitle[relFile], true);
    }

    const path = this.pathManager.srcPath(relFile);
    const title = await TitleExtractor.titleFromFileAsync(path);

    // add to cache
    state.fileTitle[relFile] = title;

    // write to file
    await this.writeFileTitleFile(relFile, title);

    return new Result(title, false);
  }

  async updateDirTitleAsync(relDir: string, recursive: boolean): Promise<Result<string>> {
    // required for recursion termination
    if (!relDir) {
      return new Result('', false);
    }

    const state = this.state;
    if (state.dirTitle[relDir]) {
      return new Result(state.dirTitle[relDir], true);
    }

    const path = this.pathManager.srcPath(relDir);
    const title = await TitleExtractor.titleFromDirAsync(path);

    // add to cache
    state.dirTitle[relDir] = title;

    // write to file
    await this.writeDirTitleFile(relDir, title);

    if (recursive) {
      const parentDir = this.pathManager.basePath(relDir);
      await this.updateDirTitleAsync(parentDir, true);
    }

    return new Result(title, false);
  }

  private async writeFileTitleFile(relFile: string, title: string): Promise<void> {
    // unescaped
    const unescapedFile = rename(this.pathManager.destPath(relFile), (_) => {
      return { ext: defs.dest.titleExt };
    });
    await mfs.writeFileAsync(unescapedFile, title);

    // escaped
    const escapedFile = rename(this.pathManager.destPath(relFile), (_) => {
      return { ext: defs.dest.titleHtmlExt };
    });
    await mfs.writeFileAsync(escapedFile, escapeHTML(title));
  }

  private async writeDirTitleFile(relDir: string, title: string): Promise<void> {
    // unescaped
    const unescapedFile = this.pathManager.joinedDestPath(relDir, defs.dest.dirTitleFile);
    await mfs.writeFileAsync(unescapedFile, title);

    // escaped
    const escapedFile = this.pathManager.joinedDestPath(relDir, defs.dest.dirTitleHtmlFile);
    await mfs.writeFileAsync(escapedFile, escapeHTML(title));
  }
}
