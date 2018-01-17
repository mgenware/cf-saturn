import * as bb from 'barbary-node';
import * as nodepath from 'path';

export default class Config {
  logger: bb.Logger|undefined;
  forceWrite: boolean     = false;

  constructor(
    public srcDir: string,
    public destDir: string,
    public cacheDir: string,
    public rootURL: string = '/',
  ) {
    this.validateParameter(srcDir, 'srcDir');
    this.validateParameter(destDir, 'destDir');

    this.srcDir = nodepath.resolve(this.srcDir);
    this.destDir = nodepath.resolve(this.destDir);
    this.cacheDir = nodepath.resolve(this.cacheDir);
  }

  validateParameter(value: string, name: string) {
    if (!value) {
      throw new Error(`${name} cannot be empty`);
    }
  }
}
