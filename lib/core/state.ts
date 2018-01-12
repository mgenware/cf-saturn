import PathComponent from '../pathComponent';
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
  dirPathComponent: { [key: string]: PathComponent } = {};
  dirPathBar: { [key: string]: PathComponent[] } = {};
}
