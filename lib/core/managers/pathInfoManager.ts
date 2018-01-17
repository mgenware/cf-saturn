import PathManager from './pathManager';
import TitleManager from './titleManager';
import { State } from '../state';
import PathInfo from '../../pathInfo';
import Config from '../../config';
import { Result } from './common';

export default class PathInfoManager {
  constructor(
    public config: Config,
    public state: State,
    public pathManager: PathManager,
    public titleManager: TitleManager,
  ) {}

  async infoFromFileAsync(relFile: string): Promise<Result<PathInfo>> {
    const state = this.state;
    if (state.filePathInfo[relFile]) {
      return new Result(state.filePathInfo[relFile], true);
    }

    const name = this.pathManager.nameWithoutExt(relFile);
    const title = (await this.titleManager.updateFileTitleAsync(relFile)).result;

    // add to cache
    const parentDir = this.pathManager.basePath(relFile);
    const parentInfo = (await this.infoFromDirAsync(parentDir)).result;
    const component = PathInfo.newInfo(name, title, parentInfo);
    state.filePathInfo[relFile] = component;

    return new Result(component, false);
  }

  async infoFromDirAsync(relDir: string): Promise<Result<PathInfo>> {
    const state = this.state;
    if (state.dirPathInfo[relDir]) {
      return new Result(state.dirPathInfo[relDir], true);
    }

    const name = this.pathManager.name(relDir);
    const title = (await this.titleManager.updateDirTitleAsync(relDir, false)).result;

    // add to cache
    const parentDir = this.pathManager.basePath(relDir);
    let parentInfo: PathInfo|null = null;
    if (parentDir) {
      parentInfo = (await this.infoFromDirAsync(parentDir)).result;
    } else {
      parentInfo = PathInfo.newRootInfo(this.config.rootURL);
    }
    const component = PathInfo.newInfo(name, title, parentInfo);
    state.dirPathInfo[relDir] = component;

    return new Result(component, false);
  }

  async infoFromFilesAsync(relFiles: string[]): Promise<PathInfo[]> {
    return await Promise.all(relFiles.map(async (d) => {
      return (await this.infoFromFileAsync(d)).result;
    }));
  }

  async infoFromDirsAsync(relDirs: string[]): Promise<PathInfo[]> {
    return await Promise.all(relDirs.map(async (d) => {
      return (await this.infoFromDirAsync(d)).result;
    }));
  }
}
