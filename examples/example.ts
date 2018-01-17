import * as nodepath from 'path';
import * as saturn from '../lib/main';

class MyGenerator extends saturn.ContentGenerator {
  generatePathBarHtml(items: saturn.PathInfo[]): string {
    let html = '';
    for (const item of items) {
      html += this.makeATag(item.escapedTitle, item.url);
    }
    return html;
  }

  generateContentHtml(items: saturn.PathInfo[]): string {
    let html = '<div class="k-content"><ul>';
    for (const item of items) {
      html += this.makeATag(item.escapedTitle, item.url);
    }
    html += '</ul></div>';
    return html;
  }

  makeATag(rawContent: string, rawHref: string): string {
    return `<a href="${rawHref}">${rawContent}</a>`;
  }
}

const src = './data/root';
const dest = nodepath.join(src, '../saturn/dist');
const cache = nodepath.join(src, '../saturn/cache');
const config = new saturn.Config(src, dest, cache, '/my-library');
config.forceWrite = true;

config.logger = new saturn.Logger(new saturn.ConsoleProvider({ showColor: true }), null);

(async () => {
  saturn.startAsync(config, new MyGenerator());
})();
