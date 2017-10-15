import * as nodepath from 'path';
import * as fx43 from 'fx43';
import * as core from './core';
import * as bb from 'barbary';
import ContentGenerator from './contentGenerator';

export class Config {
  logger: bb.Logger;

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

export async function start(config: Config, generator: ContentGenerator) {
  if (!config) {
    throw new Error('config cannot be empty');
  }
  if (!generator) {
    throw new Error('generator cannot be empty');
  }

  let {srcDir, destDir, cacheDir} = config;
  const {logger, glob} = config;
  srcDir = nodepath.resolve(srcDir);
  destDir = nodepath.resolve(destDir);
  cacheDir = nodepath.resolve(cacheDir);
  config.logger.info('main-started', {
    srcDir, destDir, cacheDir,
  });

  const processor = new core.Processor(srcDir, destDir, logger, generator);
  // only changed files will be processed
  const files = await fx43.start(srcDir, glob, cacheDir, true);
  logger.info('changed-files', {
    files,
  });
  return await Promise.all(files.map(async (relFile) => {
    await processor.startFromFile(relFile);
  }));
}
