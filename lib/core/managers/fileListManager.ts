import Config from '../../config';
import PathManager from './pathManager';
import TitleManager from './titleManager';
import { State } from '../state';
import PathInfo from '../../pathInfo';
import { Result } from './common';
import ContentGenerator from '../../contentGenerator';
import defs from '../../defs';
import PathInfoManager from './pathInfoManager';
import FsWalkManager from './fsWalkManager';
import * as mfs from 'm-fs';

export default class FileListManager {
  constructor(
    public config: Config,
    public state: State,
    public pathManager: PathManager,
    public titleManager: TitleManager,
    public pathInfoManager: PathInfoManager,
    public fsWalkManager: FsWalkManager,
    public contentGenerator: ContentGenerator,
  ) {}

  async updateFileList(relDir: string, recursive: boolean): Promise<Result<PathInfo[]>> {
    // required for recursion termination
    if (!relDir) {
      return new Result([], false);
    }

    const state = this.state;
    if (state.dirFileList[relDir]) {
      return new Result(state.dirFileList[relDir], true);
    }

    const isLeaf = await this.fsWalkManager.isLeafDirAsync(relDir);
    let fileList: PathInfo[];
    if (isLeaf) {
      const files = await this.fsWalkManager.listSubFilesAsync(relDir);
      fileList = await this.pathInfoManager.infoFromFilesAsync(files);
    } else {
      const dirs = await this.fsWalkManager.listSubDirsAsync(relDir);
      fileList = await this.pathInfoManager.infoFromDirsAsync(dirs);
    }

    // add to cache
    state.dirFileList[relDir] = fileList;

    // write to file
    const contentHtml = this.contentGenerator.generateContentHtml(fileList);
    const destFile = this.pathManager.joinedDestPath(relDir, defs.dest.dirFileListFile);
    await mfs.writeFileAsync(destFile, contentHtml);

    if (recursive) {
      const parentDir = this.pathManager.basePath(relDir);
      await this.updateFileList(parentDir, true);
    }

    return new Result(fileList, false);
  }
}
