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

  async startFromFile(file: string) {
    await this.markdownToHTML(file);

    const dir = nodepath.dirname(file);
    await this.processDir(dir);
  }

  private async processDir(dir: string): Promise<PathComponent[]> {
    // check whether the dir already exists in cache
    if (dirCache[dir]) {
      return dirCache[dir] as PathComponent[];
    }

    // ****** create path bar ******
    const dirComponent = await this.pathComponentFromDir(dir);
    const reversedComponents = [dirComponent];
    if (await this.isRootDir(dir) === false) {
      // not a root directory, find all paths components upward
      const parentDir = nodepath.dirname(dir);
      const parents = await this.processDir(parentDir);
      for (const p of parents) {
        reversedComponents.push(p);
      }
    }

    // save it to disk
    const relDir = nodepath.relative(this.srcDir, dir);
    const destPathBarHtml = nodepath.join(this.destDir, relDir, PATHBAR_HTML);
    const pathBarHtml = this.generatePathBarHtml(reversedComponents.slice().reverse());
    await mfs.writeFileAsync(destPathBarHtml, pathBarHtml);

    // ****** create content.html ******
    // there are two different content.html: dir only and file only
    // check directory type
    const subPaths = await mfs.listSubPaths(dir);
    if (!subPaths.length) {
      throw new Error(`No subPaths found in directory "${dir}"`);
    }
    const isFile = await mfs.fileExists(subPaths[0]);
    let childComponents: PathComponent[];
    if (isFile) {
      childComponents = await this.childComponentsFromDirs(subPaths);
    } else {
      childComponents = await this.childComponentsFromFiles(subPaths);
    }

    // generate the content.g.html
    const contentHtml = this.generateContentHtml(childComponents);
    // write it to disk
    const contentPath = nodepath.join(this.destDir, relDir, CONTENT_HTML);
    await mfs.writeFileAsync(contentPath, contentHtml);

    // add it to cache, marking as processed
    dirCache[dir] = reversedComponents;

    return reversedComponents;
  }

  private async isRootDir(dir: string): Promise<boolean> {
    const rootFile = nodepath.join(dir, ROOTPROJ);
    return await mfs.fileExists(rootFile);
  }

  /* internal functions for markdown to HTML */
  private async markdownToHTML(file: string) {
      // read the content of file
      const content = await mfs.readTextFileAsync(file);
      // generate markdown
      const html = MarkdownGenerator.convert(content);
      // write to file
      const htmlFile = MarkdownGenerator.rename(nodepath.join(this.destDir, nodepath.relative(this.srcDir, file)));
      await mfs.writeFileAsync(htmlFile, html);
  }

  /* internal functions for pathBar generation */
  private async pathComponentFromDir(dir: string): Promise<PathComponent> {
    const dirName = nodepath.basename(dir);
    const title = await titleExtractor.fromDir(dir);
    return new PathComponent(dirName, title);
  }

  private async pathComponentFromFile(file: string): Promise<PathComponent> {
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
}
