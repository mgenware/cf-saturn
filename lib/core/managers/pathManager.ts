import Config from '../../config';
import * as nodepath from 'path';

export default class PathManager {
  constructor(public config: Config) {}

  srcPath(relFile: string): string {
    return nodepath.join(this.config.srcDir, relFile);
  }

  destPath(relFile: string): string {
    return nodepath.join(this.config.destDir, relFile);
  }

  joinedSrcPath(path1: string, path2: string): string {
    return nodepath.join(this.srcPath(path1), path2);
  }

  joinedDestPath(path1: string, path2: string): string {
    return nodepath.join(this.destPath(path1), path2);
  }

  basePath(relPath: string): string {
    if (!relPath || relPath === '.') {
      return '';
    }
    return nodepath.dirname(relPath);
  }

  url(url: string): string {
    return nodepath.join(this.config.rootURL, url);
  }

  name(path: string): string {
    return nodepath.basename(path);
  }
}
