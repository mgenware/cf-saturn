import * as nodepath from 'path';
const escapeHTML = require('escape-html') as any;

export default class PathInfo {
  escapedURIName: string;
  unescapedURIName: string;
  escapedTitle: string;
  unescapedTitle: string;

  fullURL: string;

  constructor(name: string, title: string) {
    this.unescapedURIName = name;
    this.escapedURIName = encodeURIComponent(name);
    this.unescapedURIName = title;
    this.escapedTitle = escapeHTML(title);
    this.updateParentURL(null);
  }

  updateParentURL(parentURL: string|null) {
    if (parentURL) {
      this.fullURL = nodepath.join(parentURL, this.escapedURIName);
    } else {
      this.fullURL = '/' + this.escapedURIName;
    }
  }
}
