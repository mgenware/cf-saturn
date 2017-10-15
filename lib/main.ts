import * as nodepath from 'path';
import * as fx43 from 'fx43';
import * as core from './core';
import * as bb from 'barbary';

export async function start(srcDir: string, glob: string, destDir: string, cacheDir: string, logger: bb.Logger) {
  srcDir = nodepath.resolve(srcDir);
  destDir = nodepath.resolve(destDir);
  cacheDir = nodepath.resolve(cacheDir);
  logger.info('main-started', {
    srcDir, destDir, cacheDir,
  });

  const processor = new core.Processor(srcDir, destDir, logger);
  // only changed file will be processed
  const files = await fx43.start(srcDir, glob, cacheDir, true);
  logger.info('changed-files', {
    files,
  });
  return await Promise.all(files.map(async (relFile) => {
    await processor.startFromFile(relFile);
  }));
}
