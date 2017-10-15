import * as nodepath from 'path';
import * as saturn from '../lib/main';

class MyGenerator extends saturn.ContentGenerator {
  generatePathBarHtml(items: saturn.PathBarItem[]): string {
    throw new Error(`Not implemented yet: ${items}`);
  }

  generateContentHtml(comps: saturn.PathComponent[]): string {
    throw new Error(`Not implemented yet: ${comps}`);
  }
}

const src = './data/root';
const glob = '**/*.md';
const dest = nodepath.join(src, '../saturn/dist');
const cache = nodepath.join(src, '../saturn/cache');
const config = new saturn.Config(src, glob, dest, cache);
config.logger = new saturn.Logger(new saturn.ConsoleProvider({ showColor: true }), null);

saturn.start(config, new MyGenerator());
