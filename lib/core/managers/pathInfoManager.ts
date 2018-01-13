import PathManager from './pathManager';
import TitleManager from './titleManager';
import { State } from '../state';
import PathInfo from '../../pathInfo';
import { Result } from './common';

export default class PathInfoManager {
  constructor(
    public state: State,
    public pathManager: PathManager,
    public titleManager: TitleManager,
  ) {}

  async infoFromFile(relFile: string): Promise<Result<PathInfo>> {
    const state = this.state;
    if (state.filePathInfo[relFile]) {
      return new Result(state.filePathInfo[relFile], true);
    }

    const name = this.pathManager.name(relFile);
    const title = (await this.titleManager.updateFileTitleAsync(relFile)).result;

    // add to cache
    const component = new PathInfo(name, title);
    state.filePathInfo[relFile] = component;

    return new Result(component, false);
  }

  async infoFromDir(relDir: string): Promise<Result<PathInfo>> {
    const state = this.state;
    if (state.dirPathInfo[relDir]) {
      return new Result(state.dirPathInfo[relDir], true);
    }

    const name = this.pathManager.name(relDir);
    const title = (await this.titleManager.updateDirTitleAsync(relDir, false)).result;

    // add to cache
    const component = new PathInfo(name, title);
    state.dirPathInfo[relDir] = component;

    return new Result(component, false);
  }

  async infoFromFiles(relFiles: string[]): Promise<PathInfo[]> {
    return await Promise.all(relFiles.map(async (d) => {
      return (await this.infoFromFile(d)).result;
    }));
  }

  async infoFromDirs(relDirs: string[]): Promise<PathInfo[]> {
    return await Promise.all(relDirs.map(async (d) => {
      return (await this.infoFromDir(d)).result;
    }));
  }
}
