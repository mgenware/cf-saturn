import * as nodepath from 'path';
import * as mfs from 'm-fs';
import TitleManager from './managers/titleManager';
import MarkdownManager from './managers/markdownManager';
import PathManager from './managers/pathManager';
import { PathComponent } from '../eventArgs';
import ContentGenerator from '../contentGenerator';
import Config from '../config';
import State from './state';
import * as globby from 'globby';
const rename = require('node-rename-path');
const escapeHTML = require('escape-html') as any;

const DIR_PATHBAR_HTML = '__dir.path.g.html';
const DIR_CONTENT_HTML = '__dir.content.g.html';
const DIR_TITLE_HTML = '__dir.t.g.txt';
const FILE_TITLE_EXT = '.t.g.txt';
const FILE_JMP_EXT = '.jmp.g.txt';
const dirCache: { [key: string]: PathComponent[]|null } = {};

class JSONConfig {
  mode: string;
  value: string;
}

export class Processor {
  titleManager: TitleManager;
  markdownManager: MarkdownManager;
  pathManager: PathManager;

  state: State;

  constructor(
    public config: Config,
    public generator: ContentGenerator,
  ) {
    this.titleManager = new TitleManager();
    this.markdownManager = new MarkdownManager();
    this.pathManager = new PathManager(config);

    this.state = new State(config);
  }

  async startFromFile(relFile: string) {
    this.logInfo('process-file', {
      relFile,
    });

    const ext = this.getExtension(relFile);
    if (ext === '.md') {
      await this.processMarkdownFile(relFile);
    } else {
      await this.processJsonFile(relFile);
    }
  }

  private async processJsonFile(relFile: string) {
    const content = await mfs.readTextFileAsync(this.pathManager.getSrcPath(relFile));
    const config = JSON.parse(content) as JSONConfig;
    if (config.mode === 'jmp') {
      const gRelFile = rename(relFile, (pathObj: any) => {
        pathObj.ext = FILE_JMP_EXT;
      });
      const dest = this.pathManager.getDestPath(gRelFile);
      await mfs.writeFileAsync(dest, config.value || '/');
    } else {
      throw new Error(`Unsupported mode "${config.mode}" in JSON config file "${relFile}"`);
    }
  }

  private async processDir(relDir: string, stackCount: number): Promise<PathComponent[]> {
    if (stackCount >= 100) {
      throw new Error('Possible infinite loop detected.');
    }
    this.logInfo('process-dir.started', {
      relDir,
    });
    // check whether the dir already exists in cache
    if (dirCache[relDir]) {
      this.logWarning('process-dir.found-in-cache', {
        relDir,
      });
      return dirCache[relDir] as PathComponent[];
    }

    this.logWarning('process-dir.NOT-found-in-cache', {
      relDir,
    });
    // ****** create path bar ******
    const absDir = this.pathManager.getSrcPath(relDir);
    const curComponent = await this.pathComponentFromDir(absDir);
    const reversedComponents = [curComponent];
    if (relDir !== '.') {
      this.logInfo('process-dir.NOT-root', {
        relDir,
      });
      // not a root directory, find all paths components upward
      const parentRelDir = nodepath.dirname(relDir);
      const parents = await this.processDir(parentRelDir, stackCount + 1);

      // make sure parents are not empty
      if (!parents.length) {
        throw new Error(`${relDir} is not a root dir, but got an empty PathBarItem array from parents.`);
      }

      // update fullURL
      const prevComponent = parents[0];
      curComponent.updateParentURL(parents[0].fullURL);
      // update attachedTitle
      if (!curComponent.attachedDisplayName) {
        curComponent.attachedDisplayName = prevComponent.attachedDisplayName;
        curComponent.attachedDisplayNameHTML = prevComponent.attachedDisplayNameHTML;
      }

      for (const p of parents) {
        reversedComponents.push(p);
      }
    }

    // save it to disk
    const destPathBarHtml = nodepath.join(this.pathManager.getDestPath(relDir), DIR_PATHBAR_HTML);
    const pathBarHtml = this.generator.generatePathBarHtml(reversedComponents.slice().reverse());
    this.logInfo('process-dir.write-pathbar', {
      relDir, destPathBarHtml,
    });
    await mfs.writeFileAsync(destPathBarHtml, pathBarHtml);

    // ****** create content.html ******
    // there are two different content.html: dir only and file only
    // check directory type
    this.logInfo('process-dir.leaf-dir-checking.started', {
      absDir,
    });
    const isLeafDir = await this.isLeafDir(absDir);
    let childComponents: PathComponent[];
    this.logInfo('process-dir.leaf-dir-checking.ended', {
      absDir, isLeafDir,
    });
    if (isLeafDir) {
      this.logInfo('process-dir.list-subfiles.started', {
        absDir,
      });
      const subfiles = await globby(nodepath.join(absDir, '*.md'));
      if (!subfiles.length) {
        throw new Error(`No files found in "${absDir}"`);
      }
      childComponents = await this.childComponentsFromFiles(subfiles);
    } else {
      this.logInfo('process-dir.list-subdirs.started', {
        absDir,
      });
      const subdirs = await mfs.listSubDirs(absDir);
      childComponents = await this.childComponentsFromDirs(subdirs);
      if (!subdirs.length) {
        throw new Error(`No dirs found in "${absDir}"`);
      }
    }

    // update children's fullURL
    for (const comp of childComponents) {
      comp.updateParentURL(curComponent.fullURL);
    }

    // generate the content.g.html
    const contentHtml = this.generator.generateContentHtml(childComponents);
    // write it to disk
    const contentPath = nodepath.join(this.pathManager.getDestPath(relDir), DIR_CONTENT_HTML);
    this.logInfo('process-dir.write-contentHtml', {
      relDir, contentPath,
    });
    await mfs.writeFileAsync(contentPath, contentHtml);

    // ****** create t.html ******
    const title = await this.titleManager.getFromDirAsync(absDir);
    await this.writeTitleFileForDir(relDir, title, curComponent.tryGetAttachedName());

    // add it to cache, marking as processed
    dirCache[relDir] = reversedComponents;

    return reversedComponents;
  }

  /* internal methods for markdown to HTML */


  /* internal methods for pathBar generation */
  private async pathComponentFromDir(dir: string): Promise<PathComponent> {
    this.logVerbose('pathComponentFromDir', {
      dir,
    });
    const dirName = nodepath.basename(dir);
    const title = await this.titleManager.getFromDirAsync(dir);
    const component = new PathComponent(dirName, title);

    const attachedTitle = await this.titleManager.getAttachedTitleFromDirAsync(dir);
    if (attachedTitle) {
      this.logVerbose('pathComponentFromDir.found-attached-title', {
        dir, attachedTitle,
      });
      component.sourceOfAttachedName = true;
      component.attachedDisplayName = attachedTitle;
      component.attachedDisplayNameHTML = escapeHTML(attachedTitle);
    }
    return component;
  }

  private async pathComponentFromFile(file: string): Promise<PathComponent> {
    this.logVerbose('pathComponentFromFile', {
      file,
    });
    const name = nodepath.parse(file).name;
    const title = await this.titleManager.getFromFileAsync(file);
    return new PathComponent(name, title);
  }

  /* internal methods for content generation */
  private async childComponentsFromDirs(dirs: string[]): Promise<PathComponent[]> {
    return await Promise.all(dirs.map(async (d) => {
      return await this.pathComponentFromDir(d);
    }));
  }

  private async childComponentsFromFiles(files: string[]): Promise<PathComponent[]> {
    return await Promise.all(files.map(async (file) => {
      return await this.pathComponentFromFile(file);
    }));
  }

  private async isLeafDir(absDir: string): Promise<boolean> {
    // check if this dir is a leaf dir
    const subdirs = await mfs.listSubDirs(absDir);
    return subdirs.length === 0;
  }

  /* internal methods for title generation */


  private async writeTitleFileForDir(relDir: string, title: string, attached: string) {
    const html = this.tryEscapeTitle(title + (attached || ''));
    const dest = nodepath.join(this.pathManager.getDestPath(relDir), DIR_TITLE_HTML);
    await mfs.writeFileAsync(dest, html);
  }

  private tryEscapeTitle(title: string): string {
    if (this.config.escapeTitle) {
      return escapeHTML(title);
    }
    return title;
  }

  /* internal helper methods */

  private getExtension(path: string): string {
    return nodepath.extname(path).toLowerCase();
  }

  private logInfo(category: string, data: any) {
    if (this.config.logger) {
      this.config.logger.logInfo(category, data);
    }
  }

  private logVerbose(category: string, data: any) {
    if (this.config.logger) {
      this.config.logger.logVerbose(category, data);
    }
  }

  private logWarning(category: string, data: any) {
    if (this.config.logger) {
      this.config.logger.logWarning(category, data);
    }
  }
}
