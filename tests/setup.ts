import * as nodepath from 'path';
import * as saturn from '../lib/main';

export function resolve(path: string = ''): string {
  return `dist/tests/saturn/dist/${path}`;
}

class MyGenerator extends saturn.ContentGenerator {
  generatePathBarHtml(items: saturn.PathComponent[]): string {
    let html = '';
    for (const item of items) {
      html += this.makeATag(item.displayNameHTML, item.fullURL);
    }
    return html;
  }

  generateContentHtml(items: saturn.PathComponent[]): string {
    let html = '<div class="k-content"><ul>';
    for (const item of items) {
      html += this.makeATag(item.displayNameHTML, item.fullURL);
    }
    html += '</ul></div>';
    return html;
  }

  makeATag(rawContent: string, rawHref: string): string {
    return `<a href="${rawHref}">${rawContent}</a>`;
  }
}

const src = 'dist/tests/data';
const dest = nodepath.join(src, '../saturn/dist');
const cache = nodepath.join(src, '../saturn/cache');
const config = new saturn.Config(src, dest, cache);

(async () => {
  await saturn.startAsync(config, new MyGenerator());
})();
