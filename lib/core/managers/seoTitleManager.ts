import { State, SeoTitleData } from '../state';
import TitleManager from './titleManager';
import PathManager from './pathManager';
import { Result } from './common';
import defs from '../../defs';
import * as mfs from 'm-fs';
import Config from '../../config';
import rename from 'node-rename-path';
const trimEnd = require('lodash.trimend') as any;
const escapeHTML = require('escape-html') as any;

export default class SeoTitleManager {
  constructor(
    public config: Config,
    public state: State,
    public titleManager: TitleManager,
    public pathManager: PathManager,
  ) { }

  async updateCalculatedTitle(relFile: string): Promise<Result<SeoTitleData>> {
    const state = this.state;
    if (state.fileSeoTitle[relFile]) {
      return new Result(state.fileSeoTitle[relFile], true);
    }

    const baseDir = this.pathManager.basePath(relFile);
    const inheritedSeoTitle = (await this.updateSeoTitleForDir(baseDir)).result.inheritedTitle;
    const title = (await this.titleManager.updateFileTitleAsync(relFile)).result;
    const calcTitle = this.getCalculatedTitle(title, inheritedSeoTitle);

    // write to cache
    const seoTitleData = new SeoTitleData(calcTitle, inheritedSeoTitle);
    state.fileSeoTitle[relFile] = seoTitleData;

    // write to disk
    await this.writeFileTitleFile(relFile, calcTitle);

    return new Result(seoTitleData, false);
  }

  private async updateSeoTitleForDir(relDir: string): Promise<Result<SeoTitleData>> {
    // required for recursion termination
    if (!relDir) {
      return new Result(new SeoTitleData('', ''), false);
    }

    const state = this.state;
    const dicValue = state.dirSeoTitle[relDir];
    if (dicValue) {
      return new Result(dicValue, true);
    }

    // check if t_seo.txt exists
    const srcSeoTitleFile = this.pathManager.joinedSrcPath(relDir, defs.src.seoTitleFile);
    let inheritedSeoTitle = '';
    if (await mfs.fileExists(srcSeoTitleFile)) {
      inheritedSeoTitle = trimEnd(await mfs.readTextFileAsync(srcSeoTitleFile));
    } else {
      const baseDir = this.pathManager.basePath(relDir);
      inheritedSeoTitle = (await this.updateSeoTitleForDir(baseDir)).result.inheritedTitle;
    }

    const title = (await this.titleManager.updateDirTitleAsync(relDir, false)).result;
    const calcTitle = this.getCalculatedTitle(title, inheritedSeoTitle);
    const setTitleData = new SeoTitleData(calcTitle, inheritedSeoTitle);

    // write to cache
    state.dirSeoTitle[relDir] = setTitleData;

    // write to file
    await this.writeDirTitleFile(relDir, calcTitle);

    return new Result(setTitleData, false);
  }

  private async writeFileTitleFile(relFile: string, title: string): Promise<void> {
    // unescaped
    const unescapedFile = rename(this.pathManager.destPath(relFile), (_) => {
      return { ext: defs.dest.seoTitleExt };
    });
    await mfs.writeFileAsync(unescapedFile, title);

    // escaped
    const escapedFile = rename(this.pathManager.destPath(relFile), (_) => {
      return { ext: defs.dest.seoTitleHtmlExt };
    });
    await mfs.writeFileAsync(escapedFile, escapeHTML(title));
  }

  private async writeDirTitleFile(relDir: string, title: string): Promise<void> {
    // unescaped
    const unescapedFile = this.pathManager.joinedDestPath(relDir, defs.dest.dirSeoTitleFile);
    await mfs.writeFileAsync(unescapedFile, title);

    // escaped
    const escapedFile = this.pathManager.joinedDestPath(relDir, defs.dest.dirSeoTitleHtmlFile);
    await mfs.writeFileAsync(escapedFile, escapeHTML(title));
  }

  private getCalculatedTitle(title: string|undefined, seoTitle: string|undefined): string {
    return (title || '') + (seoTitle || '');
  }
}
