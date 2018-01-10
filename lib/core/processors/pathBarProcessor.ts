import IProcessor from './IProcessor';
import {State} from '../state';
import TitleManager from '../managers/titleManager';
import PathManager from '../managers/pathManager';
import PathBarManager from '../managers/pathBarManager';
import Config from 'config';
import defs from 'defs';
import * as mfs from 'm-fs';
import * as nodepath from 'path';

export default class PathBarProcessor implements IProcessor {
  constructor(
    public config: Config,
    public pathBarManager: PathBarManager,
    public pathManager: PathManager,
  ) {
  }

  async process(relFile: string, state: State): Promise<void> {
    const relDir = this.pathManager.basePath(relFile);
    const pathBarResult = await this.pathBarManager.pathBar(relDir);

    if (pathBarResult.isCached) {
      return;
    }
    const pathBarHTML = state.contentGenerator.generatePathBarHtml(pathBarResult.result);
    const pathBarFile = this.pathManager.joinedDestPath(relDir, defs.GeneratedPathBarFile);
    await mfs.writeFileAsync(pathBarFile, pathBarHTML);
  }
}
