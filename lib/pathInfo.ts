import * as nodepath from 'path';
const escapeHTML = require('escape-html') as any;

export default class PathInfo {
  static newInfo(name: string, title: string, parent: PathInfo): PathInfo {
    const ret = new PathInfo(name, title);
    ret.url = nodepath.join(parent.url, ret.escapedURIName);
    return ret;
  }

  static newRootInfo(rootURL: string) {
    const ret = new PathInfo('', '');
    ret.url = rootURL;
    return ret;
  }

  escapedURIName: string;
  unescapedURIName: string;
  escapedTitle: string;
  unescapedTitle: string;
  url: string;

  private constructor(name: string, title: string) {
    this.unescapedURIName = name;
    this.escapedURIName = encodeURIComponent(name);
    this.unescapedURIName = title;
    this.escapedTitle = escapeHTML(title);
  }
}
