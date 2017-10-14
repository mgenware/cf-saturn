import * as nodepath from 'path';
import * as mfs from './mfs';
import titleExtractor from './titleExtractor';
import * as MarkdownGenerator from './markdownGenerator';
import * as bb from 'barbary';
const escapeHTML = require('escape-html') as any;

const ROOTPROJ = 'root.json';
const PATHBAR_HTML = 'pathBar.g.html';
const CONTENT_HTML = 'content.g.html';
const dirCache: { [key: string]: PathComponent[]|null } = {};

export class PathComponent {
  constructor(public name: string, public displayName: string) { }
}

class HTMLGen {
  static aRaw(nameHtml: string, hrefUrl: string): string {
    return `<a href="${hrefUrl}">${nameHtml}</a>`;
  }
  static a(name: string, href: string): string {
    return this.aRaw(escapeHTML(name), encodeURIComponent(href));
  }

  static aFromComp(comp: PathComponent): string {
    return this.a(comp.name, comp.displayName);
  }
}

export class Processor {
  constructor(public srcDir: string, public destDir: string, public logger: bb.Logger) {
  }

  async startFromFile(relFile: string) {
    this.logger.info('process-file', {
      relFile,
    });
    await this.markdownToHTML(relFile);

    const relDir = nodepath.dirname(relFile);
    await this.processDir(relDir, 1);
  }

  private async processDir(relDir: string, stackCount: number): Promise<PathComponent[]> {
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
      return dirCache[relDir] as PathComponent[];
    }

    this.logger.info('process-dir.NOT-found-in-cache', {
      relDir,
    });
    // ****** create path bar ******
    const absDir = this.makeSrcPath(relDir);
    const dirComponent = await this.pathComponentFromDir(absDir);
    const reversedComponents = [dirComponent];
    if (relDir !== '.' && await this.isRootDir(absDir) === false) {
      this.logger.info('process-dir.NOT-root', {
        relDir,
      });
      // not a root directory, find all paths components upward
      const parentRelDir = nodepath.dirname(relDir);
      const parents = await this.processDir(parentRelDir, stackCount + 1);
      for (const p of parents) {
        reversedComponents.push(p);
      }
    }

    // save it to disk
    const destPathBarHtml = nodepath.join(this.makeDestPath(relDir), PATHBAR_HTML);
    const pathBarHtml = this.generatePathBarHtml(reversedComponents.slice().reverse());
    this.logger.info('process-dir.write-pathbar', {
      relDir, destPathBarHtml,
    });
    await mfs.writeFileAsync(destPathBarHtml, pathBarHtml);

    // ****** create content.html ******
    // there are two different content.html: dir only and file only
    // check directory type
    const subPaths = await mfs.listSubPaths(absDir);
    this.logger.info('process-dir.listSubPaths', {
      absDir, subPaths,
    });
    if (!subPaths.length) {
      throw new Error(`No subPaths found in directory "${absDir}"`);
    }

    const isLeafDir = await this.isLeafDir(absDir);
    let childComponents: PathComponent[];
    this.logger.info('process-dir.listSubPaths.isFile', {
      absDir, isLeafDir,
    });
    if (isLeafDir) {
      childComponents = await this.childComponentsFromDirs(subPaths);
    } else {
      childComponents = await this.childComponentsFromFiles(subPaths);
    }

    // generate the content.g.html
    const contentHtml = this.generateContentHtml(childComponents);
    // write it to disk
    const contentPath = nodepath.join(this.destDir, relDir, CONTENT_HTML);
    this.logger.info('process-dir.write-contentHtml', {
      relDir, contentPath,
    });
    await mfs.writeFileAsync(contentPath, contentHtml);

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

  private generatePathBarHtml(comps: PathComponent[]): string {
    let res = '';
    for (const comp of comps) {
      const aHtml = HTMLGen.a(comp.displayName, comp.name);
      res += aHtml;
    }
    return '';
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
    let subdirs = await mfs.listSubDirs(absDir);
    return subdirs.length === 0;
  }
}
