import * as nodepath from 'path';
import * as mfs from 'm-fs';
import titleExtractor from './titleExtractor';
import * as MarkdownGenerator from './markdownGenerator';
import * as bb from 'barbary';
import { PathComponent } from './eventArgs';
import ContentGenerator from './contentGenerator';
import Config from './config';
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
  ignoredFiles: { [key: string]: boolean|null } = {};

  constructor(
    public config: Config,
    public generator: ContentGenerator,
  ) { }

  async startFromFile(relFile: string) {
    this.logger.info('process-file', {
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
    const content = await mfs.readTextFileAsync(this.makeSrcPath(relFile));
    const config = JSON.parse(content) as JSONConfig;
    if (config.mode === 'jmp') {
      const gRelFile = rename(relFile, (pathObj: any) => {
        pathObj.ext = FILE_JMP_EXT;
      });
      const dest = this.makeDestPath(gRelFile);
      await mfs.writeFileAsync(dest, config.value || '/');
    } else {
      throw new Error(`Unsupported mode "${config.mode}" in JSON config file "${relFile}"`);
    }
  }

  private async processMarkdownFile(relFile: string) {
    // write content.g.html
    await this.markdownToHTML(relFile);

    // process parent dir
    const relDir = nodepath.dirname(relFile);
    const components = await this.processDir(relDir, 1);
    if (!components.length) {
      throw new Error('Internal error: components should not be empty');
    }
    const dirComponent = components[0];

    // write t.g.html
    const title = await titleExtractor.fromFile(this.makeSrcPath(relFile));
    await this.writeTitleFileForFile(relFile, title, dirComponent.tryGetAttachedName());
  }

  private async processDir(relDir: string, stackCount: number): Promise<PathComponent[]> {
    if (stackCount >= 100) {
      throw new Error('Potential infinite loop detected.');
    }
    this.logger.info('process-dir.started', {
      relDir,
    });
    // check whether the dir already exists in cache
    if (dirCache[relDir]) {
      this.logger.warning('process-dir.found-in-cache', {
        relDir,
      });
      return dirCache[relDir] as PathComponent[];
    }

    this.logger.warning('process-dir.NOT-found-in-cache', {
      relDir,
    });
    // ****** create path bar ******
    const absDir = this.makeSrcPath(relDir);
    const curComponent = await this.pathComponentFromDir(absDir);
    const reversedComponents = [curComponent];
    if (relDir !== '.') {
      this.logger.info('process-dir.NOT-root', {
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
    const destPathBarHtml = nodepath.join(this.makeDestPath(relDir), DIR_PATHBAR_HTML);
    const pathBarHtml = this.generator.generatePathBarHtml(reversedComponents.slice().reverse());
    this.logger.info('process-dir.write-pathbar', {
      relDir, destPathBarHtml,
    });
    await mfs.writeFileAsync(destPathBarHtml, pathBarHtml);

    // ****** create content.html ******
    // there are two different content.html: dir only and file only
    // check directory type
    this.logger.info('process-dir.leaf-dir-checking.started', {
      absDir,
    });
    const isLeafDir = await this.isLeafDir(absDir);
    let childComponents: PathComponent[];
    this.logger.info('process-dir.leaf-dir-checking.ended', {
      absDir, isLeafDir,
    });
    if (isLeafDir) {
      this.logger.info('process-dir.list-subfiles.started', {
        absDir,
      });
      const subfiles = await globby(nodepath.join(absDir, '*.md'));
      if (!subfiles.length) {
        throw new Error(`No files found in "${absDir}"`);
      }
      childComponents = await this.childComponentsFromFiles(subfiles);
    } else {
      this.logger.info('process-dir.list-subdirs.started', {
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
    const contentPath = nodepath.join(this.makeDestPath(relDir), DIR_CONTENT_HTML);
    this.logger.info('process-dir.write-contentHtml', {
      relDir, contentPath,
    });
    await mfs.writeFileAsync(contentPath, contentHtml);

    // ****** create t.html ******
    const title = await titleExtractor.fromDir(absDir);
    await this.writeTitleFileForDir(relDir, title, curComponent.tryGetAttachedName());

    // add it to cache, marking as processed
    dirCache[relDir] = reversedComponents;

    return reversedComponents;
  }

  private makeSrcPath(relFile: string): string {
    return nodepath.join(this.config.srcDir, relFile);
  }

  private makeDestPath(relFile: string): string {
    return nodepath.join(this.config.destDir, relFile);
  }

  /* internal methods for markdown to HTML */
  private async markdownToHTML(relFile: string) {
    this.logger.info('markdown2html-start', {
      relFile,
    });
    // read the content of file
    const content = await mfs.readTextFileAsync(this.makeSrcPath(relFile));
    // generate markdown
    const html = MarkdownGenerator.convert(content);
    // write to file
    const htmlFile = MarkdownGenerator.rename(this.makeDestPath(relFile));
    this.logger.info('markdown2html-write', {
      htmlFile,
    });
    await mfs.writeFileAsync(htmlFile, html);
  }

  /* internal methods for pathBar generation */
  private async pathComponentFromDir(dir: string): Promise<PathComponent> {
    this.logger.verbose('pathComponentFromDir', {
      dir,
    });
    const dirName = nodepath.basename(dir);
    const title = await titleExtractor.fromDir(dir);
    const component = new PathComponent(dirName, title);

    const attachedTitle = await titleExtractor.attachedTitleFromDir(dir);
    if (attachedTitle) {
      this.logger.verbose('pathComponentFromDir.found-attached-title', {
        dir, attachedTitle,
      });
      component.sourceOfAttachedName = true;
      component.attachedDisplayName = attachedTitle;
      component.attachedDisplayNameHTML = escapeHTML(attachedTitle);
    }
    return component;
  }

  private async pathComponentFromFile(file: string): Promise<PathComponent> {
    this.logger.verbose('pathComponentFromFile', {
      file,
    });
    const name = nodepath.parse(file).name;
    const title = await titleExtractor.fromFile(file);
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
  private async writeTitleFileForFile(relFile: string, title: string, attached: string) {
    const html = this.tryEscapeTitle(title + (attached || ''));
    const gRelFile = rename(relFile, (pathObj: any) => {
      pathObj.ext = FILE_TITLE_EXT;
    });
    await mfs.writeFileAsync(this.makeDestPath(gRelFile), html);
  }

  private async writeTitleFileForDir(relDir: string, title: string, attached: string) {
    const html = this.tryEscapeTitle(title + (attached || ''));
    const dest = nodepath.join(this.makeDestPath(relDir), DIR_TITLE_HTML);
    await mfs.writeFileAsync(dest, html);
  }

  private tryEscapeTitle(title: string): string {
    if (this.config.escapeTitle) {
      return escapeHTML(title);
    }
    return title;
  }

  /* internal helper methods */
  private get logger(): bb.Logger {
    return this.config.logger;
  }

  private getExtension(path: string): string {
    return nodepath.extname(path).toLowerCase();
  }
}
