import * as mfs from 'm-fs';
import PathManager from './pathManager';

export default class CopyManager {
  constructor(
    public pathManager: PathManager,
  ) {}

  async copyFileAsync(relFile: string): Promise<void> {
    const src = this.pathManager.srcPath(relFile);
    const dest = this.pathManager.destPath(relFile);
    const content = await mfs.readTextFileAsync(src);

    await mfs.writeFileAsync(dest, content);
  }
}
