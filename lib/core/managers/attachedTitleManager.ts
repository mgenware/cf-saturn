import { State } from '../state';
import TitleManager from './titleManager';
import PathManager from './pathManager';

export default class AttachedTitleManager {
  constructor(
    public state: State,
    public titleManager: TitleManager,
    public pathManager: PathManager,
  ) { }

  async calculatedTitleForFileAsync(relFile: string): Promise<string> {
    const state = this.state;
    if (state.calculatedFileTitle[relFile]) {
      return state.calculatedFileTitle[relFile];
    }

    const title = await this.titleManager.titleFromFileAsync(relFile);
    const attachedTitle = await this.attachedTitleForDirAsync(this.pathManager.basePath(relFile));

    const calc = (title || '') + (attachedTitle || '');
    state.calculatedFileTitle[relFile] = calc;
    return calc;
  }

  private async attachedTitleForDirAsync(dir: string): Promise<string> {
    const state = this.state;
    if (state.calculatedDirTitle[dir] !== undefined && state.calculatedDirTitle[dir] !== null) {
      return state.calculatedDirTitle[dir] as string;
    }

    const res = await this.attachedTitleByForceAsync(dir);
    state.calculatedDirTitle[dir] = res;
    return res;
  }

  private async attachedTitleByForceAsync(relDir: string): Promise<string> {
    // required for recursion termination
    if (!relDir) {
      return '';
    }

    const attachedTitle = await this.titleManager.attachedTitleFromDirAsync(relDir);
    if (attachedTitle !== null) {
      return attachedTitle;
    }

    // no t_attached.txt found, search through parents
    const res = await this.attachedTitleForDirAsync(this.pathManager.basePath(relDir));
    return res;
  }
}
