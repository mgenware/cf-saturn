import Config from '../../config';
import PathManager from './pathManager';
import TitleManager from './titleManager';
import { State } from '../state';
import PathInfo from '../../pathInfo';
import { Result } from './common';
import ContentGenerator from '../../contentGenerator';
import defs from '../../defs';
import PathInfoManager from './pathInfoManager';
import * as mfs from 'm-fs';

export default class PathBarManager {
  constructor(
    public config: Config,
    public state: State,
    public pathManager: PathManager,
    public titleManager: TitleManager,
    public pathInfoManager: PathInfoManager,
    public contentGenerator: ContentGenerator,
  ) {}

  async updatePathBar(relDir: string): Promise<Result<PathInfo[]>> {
    // required for recursion termination
    if (!relDir) {
      return new Result([], false);
    }

    const state = this.state;
    if (state.dirPathBar[relDir]) {
      return new Result(state.dirPathBar[relDir], true);
    }

    const parentDir = this.pathManager.basePath(relDir);
    const paths = (await this.updatePathBar(parentDir)).result;
    paths.push((await this.pathInfoManager.infoFromDir(relDir)).result);

    // add to cache
    state.dirPathBar[relDir] = paths;

    // write to file
    const contentHtml = this.contentGenerator.generatePathBarHtml(paths);
    const destFile = this.pathManager.joinedDestPath(relDir, defs.dest.dirPathBarFile);
    await mfs.writeFileAsync(destFile, contentHtml);

    return new Result(paths, false);
  }
}
