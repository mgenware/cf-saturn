import Config from '../../config';
import * as nodepath from 'path';
import PathManager from './pathManager';
import TitleManager from './titleManager';
import { State } from '../state';
import PathComponent from 'pathComponent';

export default class PathBarManager {
  constructor(
    public state: State,
    public config: Config,
    public pathManager: PathManager,
    public titleManager: TitleManager,
  ) {}

  async pathBar(relDir: string): Promise<PathComponent[]> {
    // required for recursion termination
    if (!relDir) {
      return [];
    }

    const state = this.state;
    if (state.dirPathBar[relDir]) {
      return state.dirPathBar[relDir];
    }

    const paths = await this.pathBar(this.pathManager.basePath(relDir));
    paths.push(await this.componentFromDir(relDir));

    state.dirPathBar[relDir] = paths;
    return paths;
  }

  private async componentFromDir(relDir: string): Promise<PathComponent> {
    const state = this.state;
    if (state.dirPathComponent[relDir]) {
      return state.dirPathComponent[relDir];
    }

    const name = this.pathManager.name(relDir);
    const title = await this.titleManager.titleFromDirAsync(relDir);

    const component = new PathComponent(name, title);
    state.dirPathComponent[relDir] = component;
    return component;
  }
}
