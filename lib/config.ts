import * as bb from 'barbary-node';

export default class Config {
  logger: bb.Logger|undefined;
  escapeTitle: boolean = false;
  rootURL: string = '';
  forceWrite: boolean;

  constructor(
    public srcDir: string,
    public destDir: string,
    public cacheDir: string,
  ) {
    this.validateParameter(srcDir, 'srcDir');
    this.validateParameter(destDir, 'destDir');
  }

  validateParameter(value: string, name: string) {
    if (!value) {
      throw new Error(`${name} cannot be empty`);
    }
  }
}
