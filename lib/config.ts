import * as bb from 'barbary';

export default class Config {
  logger: bb.Logger;
  escapeTitle: boolean = false;

  constructor(
    public srcDir: string,
    public glob: string,
    public destDir: string,
    public cacheDir: string|null,
  ) {
    this.validateParameter(srcDir, 'srcDir');
    this.validateParameter(glob, 'glob');
    this.validateParameter(destDir, 'destDir');
  }

  validateParameter(value: string, name: string) {
    if (!value) {
      throw new Error(`${name} cannot be empty`);
    }
  }
}
