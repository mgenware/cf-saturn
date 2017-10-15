import * as nodepath from 'path';
const escapeHTML = require('escape-html') as any;

export class PathComponent {
  urlName: string;
  htmlDisplayName: string;
  fullURL: string;

  constructor(public name: string, public displayName: string) {
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
