import * as mfs from 'm-fs';
import PathManager from './pathManager';
import * as nodepath from 'path';
import defs from '../../defs';

export default class FsWalkManager {
  constructor(
    public pathManager: PathManager,
  ) {}

  async listSubFilesAsync(relDir: string): Promise<string[]> {
    const srcDir = this.pathManager.srcPath(relDir);

    return (await mfs.listSubFiles(srcDir)).filter(defs.system.fileFilter).map((file) => {
      return nodepath.join(relDir, file);
    });
  }

  async listSubDirsAsync(relDir: string): Promise<string[]> {
    const srcDir = this.pathManager.srcPath(relDir);
    return (await mfs.listSubDirs(srcDir)).filter(defs.system.dirFilter).map((dir) => {
      return nodepath.join(relDir, dir);
    });
  }

  async isLeafDirAsync(relDir: string): Promise<boolean> {
    const srcDir = this.pathManager.srcPath(relDir);
    // check if this directory is a leaf directory
    const subDirs = await mfs.listSubDirs(srcDir);
    return subDirs.length === 0;
  }

}
