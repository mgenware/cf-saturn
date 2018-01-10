import Config from '../../config';
import * as nodepath from 'path';
import PathManager from './pathManager';
import TitleManager from './titleManager';
import { State } from '../state';
import PathComponent from 'pathComponent';
import { Result } from './common';

export default class PathBarManager {
  constructor(
    public state: State,
    public config: Config,
    public pathManager: PathManager,
    public titleManager: TitleManager,
  ) {}

  async pathBar(relDir: string): Promise<Result<PathComponent[]>> {
    // required for recursion termination
    if (!relDir) {
      return new Result([], false);
    }

    const state = this.state;
    if (state.dirPathBar[relDir]) {
      return new Result(state.dirPathBar[relDir], true);
    }

    const paths = (await this.pathBar(this.pathManager.basePath(relDir))).result;
    paths.push((await this.componentFromDir(relDir)).result);

    state.dirPathBar[relDir] = paths;
    return new Result(paths, false);
  }

  private async componentFromDir(relDir: string): Promise<Result<PathComponent>> {
    const state = this.state;
    if (state.dirPathComponent[relDir]) {
      return new Result(state.dirPathComponent[relDir], true);
    }

    const name = this.pathManager.name(relDir);
    const title = await this.titleManager.titleFromDirAsync(relDir);

    const component = new PathComponent(name, title);
    state.dirPathComponent[relDir] = component;
    return new Result(component, false);
  }
}
