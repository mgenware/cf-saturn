import {PathBarItem, PathComponent} from './eventArgs';

export default class ContentGenerator {
  generatePathBarHtml(items: PathBarItem[]): string {
    throw new Error(`Not implemented yet: ${items}`);
  }

  generateContentHtml(comps: PathComponent[]): string {
    throw new Error(`Not implemented yet: ${comps}`);
  }
}
