import * as nodepath from 'path';
const escapeHTML = require('escape-html') as any;

export class PathComponent {
  urlName: string;
  displayNameHTML: string;
  rawName: string;

  fullURL: string;

  sourceOfAttachedName: boolean;
  attachedDisplayName: string;
  attachedDisplayNameHTML: string;

  constructor(name: string, public displayName: string) {
    this.rawName = name;
    this.urlName = encodeURIComponent(name);
    this.displayNameHTML = escapeHTML(displayName);
    this.updateParentURL(null);
  }

  updateParentURL(parentURL: string|null) {
    if (parentURL) {
      this.fullURL = nodepath.join(parentURL, this.urlName);
    } else {
      this.fullURL = '/' + this.urlName;
    }
  }

  tryGetAttachedName(): string {
    if (!this.sourceOfAttachedName) {
      return this.attachedDisplayName;
    }
    return '';
  }
}
