import IProcessor from './IProcessor';
import {State} from '../state';
import PathManager from '../managers/pathManager';
import * as mfs from 'm-fs';
import * as nodepath from 'path';
import AttachedTitleManager from 'core/managers/attachedTitleManager';
import defs from 'defs';
import Config from 'config';
const escapeHTML = require('escape-html') as any;
const rename = require('node-rename-path');

export default class FileTitleProcessor implements IProcessor {
  constructor(
    public config: Config,
    public attachedTitleManager: AttachedTitleManager,
    public pathManager: PathManager,
  ) {
  }

  async process(relFile: string, state: State): Promise<void> {
    const title = await this.attachedTitleManager.calculatedTitleForFileAsync(relFile);
    await this.writeTitleFileForFileAsync(relFile, title);
  }

  private async writeTitleFileForFileAsync(relFile: string, title: string) {
    const html = this.tryEscapeTitle(title);
    const gRelFile = rename(relFile, (pathObj: any) => {
      pathObj.ext = defs.GeneratedTitleExt;
    });
    await mfs.writeFileAsync(this.pathManager.destPath(gRelFile), html);
  }

  private tryEscapeTitle(title: string): string {
    if (this.config.escapeTitle) {
      return escapeHTML(title);
    }
    return title;
  }
}
