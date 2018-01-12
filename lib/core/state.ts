import PathInfo from '../pathInfo';
export class SeoTitleData {
  constructor(
    public calculatedTitle: string,
    public inheritedTitle: string,
  ) {}
}

export class State {
  // --- SEO Title ---
  // the calculated title for a directory
  dirSeoTitle: { [key: string]: SeoTitleData} = {};
  // the calculated title for a file
  fileSeoTitle: { [key: string]: SeoTitleData } = {};

  // --- Title ---
  // the explicitly set title for a directory
  dirTitle: { [key: string]: string} = {};
  // the explicitly set title for a file
  fileTitle: { [key: string]: string} = {};

  // --- PathBar ---
  dirPathInfo: { [key: string]: PathInfo } = {};
  dirPathBar: { [key: string]: PathInfo[] } = {};

  // -- File list ---
  dirChildList: { [key: string]: PathInfo[] } = {};
}
