import * as nodepath from 'path';
import * as mfs from 'm-fs';
import titleExtractor from './titleExtractor';
import * as MarkdownGenerator from './markdownGenerator';
import * as bb from 'barbary';
const rename = require('node-rename-path');
const escapeHTML = require('escape-html') as any;

const ROOTPROJ = 'root.json';
const DIR_PATHBAR_HTML = '__dir.path.g.html';
const DIR_CONTENT_HTML = '__dir.content.g.html';
const DIR_TITLE_HTML = '__dir.t.g.html';
const FILE_TITLE_EXT = '.t.g.html';
const dirCache: { [key: string]: PathBarItem[]|null } = {};

export class PathComponent {
  constructor(public name: string, public displayName: string) { }
}

export class PathBarItem {
  static fromPathComponent(comp: PathComponent): PathBarItem {
    return new PathBarItem(comp.name, comp.displayName);
  }

  urlName: string;
  htmlDisplayName: string;
  fullURL: string;

  constructor(name: string, displayName: string) {
    this.urlName = encodeURIComponent(name);
    this.htmlDisplayName = escapeHTML(displayName);
    this.updateParentURL(null);
  }

  updateParentURL(parentURL: string|null) {
    if (parentURL) {
      this.fullURL = nodepath.join(parentURL, this.urlName);
    } else {
      this.fullURL = '/' + this.urlName;
    }
  }
}

class HTMLGen {
  static aRaw(nameHtml: string, hrefUrl: string): string {
    return `<a href="${hrefUrl}">${nameHtml}</a>`;
  }
  static a(content: string, href: string): string {
    return this.aRaw(escapeHTML(content), encodeURIComponent(href));
  }

  static aFromComp(comp: PathComponent): string {
    return this.a(comp.displayName, comp.name);
  }
}

export class Processor {
  ignoredFiles: { [key: string]: boolean|null } = {};

  constructor(public srcDir: string, public destDir: string, public logger: bb.Logger) {
    const ignoredFiles = [titleExtractor.TITLE_FILE, '.DS_Store', 'thumbs.db'];
    for (const file of ignoredFiles) {
      this.ignoredFiles[file] = true;
    }
  }

  async startFromFile(relFile: string) {
    this.logger.info('process-file', {
      relFile,
    });
    // write content.g.html
    await this.markdownToHTML(relFile);

    // write t.g.html
    const title = await titleExtractor.fromFile(this.makeSrcPath(relFile));
    await this.writeTitleFileForFile(relFile, title);

    const relDir = nodepath.dirname(relFile);
    await this.processDir(relDir, 1);
  }

  private async processDir(relDir: string, stackCount: number): Promise<PathBarItem[]> {
    if (stackCount >= 100) {
      throw new Error('Potential infinite loop detected.');
    }
    this.logger.info('process-dir', {
      relDir,
    });
    // check whether the dir already exists in cache
    if (dirCache[relDir]) {
      this.logger.info('process-dir.found-in-cache', {
        relDir,
      });
      return dirCache[relDir] as PathBarItem[];
    }

    this.logger.info('process-dir.NOT-found-in-cache', {
      relDir,
    });
    // ****** create path bar ******
    const absDir = this.makeSrcPath(relDir);
    const curPathBarItem = PathBarItem.fromPathComponent(await this.pathComponentFromDir(absDir));
    const reversedComponents = [curPathBarItem];
    if (relDir !== '.' && await this.isRootDir(absDir) === false) {
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

      // update PathBarItem.url
      curPathBarItem.updateParentURL(parents[0].fullURL);

      for (const p of parents) {
        reversedComponents.push(p);
      }
    }

    // save it to disk
    const destPathBarHtml = nodepath.join(this.makeDestPath(relDir), DIR_PATHBAR_HTML);
    const pathBarHtml = this.generatePathBarHtml(reversedComponents.slice().reverse());
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
      let subfiles = await mfs.listSubFiles(absDir);
      // remove ignored files
      subfiles = subfiles.filter((file) => !this.ignoredFiles[file]);
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

    // generate the content.g.html
    const contentHtml = this.generateContentHtml(childComponents);
    // write it to disk
    const contentPath = nodepath.join(this.destDir, relDir, DIR_CONTENT_HTML);
    this.logger.info('process-dir.write-contentHtml', {
      relDir, contentPath,
    });
    await mfs.writeFileAsync(contentPath, contentHtml);

    // ****** create t.html ******
    const title = await titleExtractor.fromDir(absDir);
    await this.writeTitleFileForDir(relDir, title);

    // add it to cache, marking as processed
    dirCache[relDir] = reversedComponents;

    return reversedComponents;
  }

  private async isRootDir(dir: string): Promise<boolean> {
    const rootFile = nodepath.join(dir, ROOTPROJ);
    return await mfs.fileExists(rootFile);
  }

  private makeSrcPath(relFile: string): string {
    return nodepath.join(this.srcDir, relFile);
  }

  private makeDestPath(relFile: string): string {
    return nodepath.join(this.destDir, relFile);
  }

  /* internal functions for markdown to HTML */
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

  /* internal functions for pathBar generation */
  private async pathComponentFromDir(dir: string): Promise<PathComponent> {
    this.logger.verbose('pathComponentFromDir', {
      dir,
    });
    const dirName = nodepath.basename(dir);
    const title = await titleExtractor.fromDir(dir);
    return new PathComponent(dirName, title);
  }

  private async pathComponentFromFile(file: string): Promise<PathComponent> {
    this.logger.verbose('pathComponentFromFile', {
      file,
    });
    const name = nodepath.parse(file).name;
    const title = await titleExtractor.fromFile(file);
    return new PathComponent(name, title);
  }

  private generatePathBarHtml(comps: PathBarItem[]): string {
    let res = '';
    for (const comp of comps) {
      const aHtml = HTMLGen.aRaw(comp.htmlDisplayName, comp.fullURL);
      res += aHtml;
    }
    return res;
  }

  /* internal functions for content generation */
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

  private generateContentHtml(comps: PathComponent[]): string {
    let res = '<ul>';
    for (const comp of comps) {
      const aHtml = HTMLGen.aFromComp(comp);
      res += `<li>${aHtml}</li>`;
    }
    res += '</ul>';
    return res;
  }

  private async isLeafDir(absDir: string): Promise<boolean> {
    // check if this dir is a leaf dir
    const subdirs = await mfs.listSubDirs(absDir);
    return subdirs.length === 0;
  }

  /* internal functions for title generation */
  private async writeTitleFileForFile(relFile: string, title: string) {
    const html = escapeHTML(title);
    const gRelFile = rename(relFile, (pathObj: any) => {
      pathObj.ext = FILE_TITLE_EXT;
    });
    await mfs.writeFileAsync(this.makeDestPath(gRelFile), html);
  }

  private async writeTitleFileForDir(relDir: string, title: string) {
    const html = escapeHTML(title);
    const dest = nodepath.join(this.makeDestPath(relDir), DIR_TITLE_HTML);
    await mfs.writeFileAsync(dest, html);
  }
}
