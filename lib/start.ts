import * as nodepath from 'path';
import { startCustomModeAsync } from 'fx43';
import * as core from './core/core';
import * as bluebird from 'bluebird';
import defs from './defs';
import Config from './config';
import ContentGenerator from './contentGenerator';

export async function startAsync(config: Config, generator: ContentGenerator) {
  if (!config) {
    throw new Error('config cannot be empty');
  }
  if (!generator) {
    throw new Error('generator cannot be empty');
  }

  let {srcDir, destDir, cacheDir} = config;
  const logger = config.logger;
  srcDir = nodepath.resolve(srcDir);
  destDir = nodepath.resolve(destDir);
  cacheDir = nodepath.resolve(cacheDir);

  if (logger) {
    logger.logInfo('main-started', {
      srcDir, destDir, cacheDir,
    });
  }

  const processor = new core.Processor(config, generator);
  // only changed files will be processed
  const files = await startCustomModeAsync(srcDir, cacheDir, config.forceWrite,
  defs.system.fileFilter,
  defs.system.dirFilter);

  if (logger) {
    logger.logInfo('changed-files', {
      files,
    });
  }
  return await bluebird.mapSeries(files, (relFile) => {
    return processor.startFromFile(relFile);
  });
}
