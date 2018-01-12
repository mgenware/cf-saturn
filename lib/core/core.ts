import ContentGenerator from '../contentGenerator';
import Config from '../config';
import { State } from './state';
// managers
import TitleManager from './managers/titleManager';
import MarkdownManager from './managers/markdownManager';
import PathManager from './managers/pathManager';
import SeoTitleManager from './managers/seoTitleManager';
import PathBarManager from './managers/pathBarManager';

export class Processor {
  titleManager: TitleManager;
  markdownManager: MarkdownManager;
  pathManager: PathManager;
  seoTitleManager: SeoTitleManager;
  pathBarManager: PathBarManager;

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
    this.pathBarManager = new PathBarManager(config, state, this.pathManager, this.titleManager, contentGenerator);
  }

  async startFromFile(relFile: string) {
    const relDir = this.pathManager.basePath(relFile);

    await this.markdownManager.convertFileAsync(relFile);
    await this.titleManager.updateFileTitleAsync(relFile);
    await this.titleManager.updateDirTitleAsync(relDir, true);
    await this.seoTitleManager.updateCalculatedTitle(relFile);
    await this.pathBarManager.updatePathBar(relDir);
  }
}
