import * as mfs from 'm-fs';
import PathManager from './pathManager';
import * as nodepath from 'path';

export default class FsWalkManager {
  constructor(
    public pathManager: PathManager,
  ) {}

  async listSubFilesAsync(relDir: string): Promise<string[]> {
    const srcDir = this.pathManager.srcPath(relDir);
    return await mfs.listSubFiles(srcDir).then((res) => {
      return res.map((name) => nodepath.join(relDir, name));
    });
  }

  async listSubDirsAsync(relDir: string): Promise<string[]> {
    const srcDir = this.pathManager.srcPath(relDir);
    return await mfs.listSubDirs(srcDir).then((res) => {
      return res.map((name) => nodepath.join(relDir, name));
    });
  }
}