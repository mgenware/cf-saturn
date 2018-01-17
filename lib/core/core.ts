import ContentGenerator from '../contentGenerator';
import Config from '../config';
import { State } from './state';
import * as nodepath from 'path';
// managers
import TitleManager from './managers/titleManager';
import MarkdownManager from './managers/markdownManager';
import PathManager from './managers/pathManager';
import SeoTitleManager from './managers/seoTitleManager';
import PathBarManager from './managers/pathBarManager';
import FileListManager from './managers/fileListManager';
import FsWalkManager from './managers/fsWalkManager';
import PathInfoManager from './managers/pathInfoManager';
import CopyManager from './managers/copyManager';

export class Processor {
  titleManager: TitleManager;
  markdownManager: MarkdownManager;
  pathManager: PathManager;
  seoTitleManager: SeoTitleManager;
  pathBarManager: PathBarManager;
  pathInfoManager: PathInfoManager;
  fileListManager: FileListManager;
  fsWalkManager: FsWalkManager;
  copyManager: CopyManager;

  state: State;

  constructor(
    public config: Config,
    public contentGenerator: ContentGenerator,
  ) {
    const state = new State();
    this.state = state;

    this.pathManager = new PathManager(config);
    this.titleManager = new TitleManager(config, state, this.pathManager);
    this.markdownManager = new MarkdownManager(this.pathManager);
    this.seoTitleManager = new SeoTitleManager(config, state, this.titleManager, this.pathManager);
    this.fsWalkManager = new FsWalkManager(this.pathManager);

    this.pathInfoManager = new PathInfoManager(config, state, this.pathManager, this.titleManager);
    this.pathBarManager = new PathBarManager(config, state, this.pathManager, this.titleManager, this.pathInfoManager
      , contentGenerator);
    this.fileListManager = new FileListManager(config, state, this.pathManager, this.titleManager, this.pathInfoManager, this.fsWalkManager, contentGenerator);
    this.copyManager = new CopyManager(this.pathManager);
  }

  async startFromFile(relFile: string): Promise<void> {
    const ext = nodepath.extname(relFile).toLowerCase();

    switch (ext) {
      case '.md': {
        await this.processMdFile(relFile);
        break;
      }

      case '.json': {
        await this.processJsonFile(relFile);
        break;
      }

      default: {
        throw new Error(`Unsupported file type: ${ext}`);
      }
    }
  }

  private async processMdFile(relFile: string): Promise<void> {
    const relDir = this.pathManager.basePath(relFile);

    await this.markdownManager.convertFileAsync(relFile);
    await this.titleManager.updateFileTitleAsync(relFile);
    await this.titleManager.updateDirTitleAsync(relDir, true);
    await this.seoTitleManager.updateCalculatedTitle(relFile);
    await this.pathBarManager.updatePathBar(relDir);
    await this.fileListManager.updateFileList(relDir, true);
  }

  private async processJsonFile(relFile: string): Promise<void> {
    await this.copyManager.copyFileAsync(relFile);
  }
}
