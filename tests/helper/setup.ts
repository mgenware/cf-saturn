import * as saturn from '../../lib/main';
export { default as validator } from 'fx54-node';
import * as tmp from 'tmp';

export function resolve(name: string): string {
  return `dist/tests/saturn/dist/${name}`;
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

export async function startAsync(name: string) {
  const src = `dist/tests/data/${name}`;
  const dest = resolve(name);
  const config = new saturn.Config(src, dest, tmp.dirSync().name);
  await saturn.startAsync(config, new MyGenerator());
}
