import * as base from './setup';
import validator from 'fx54-node';

beforeAll(async () => {
  await base.startAsync('base');
});

test('main', async () => {
  const expected = { '__dir.content.g.html': '<div class="k-content"><ul><a href="/base/a">a</a><a href="/base/b">b</a></ul></div>',
  '__dir.path.g.html': '<a href="/base">base</a>',
  '__dir.t.g.txt': 'base',
  a:
   { '__dir.content.g.html': '<div class="k-content"><ul><a href="/base/a/a1">title of a1</a></ul></div>',
     '__dir.path.g.html': '<a href="/base">base</a><a href="/base/a">a</a>',
     '__dir.t.g.txt': 'a',
     'a1.g.html': '<h1>title of a1</h1>\n',
     'a1.t.g.txt': 'title of a1' },
  b:
   { '__dir.content.g.html': '<div class="k-content"><ul><a href="/base/b/c">c</a></ul></div>',
     '__dir.path.g.html': '<a href="/base">base</a><a href="/base/b">&lt;_+{}*(中&gt;</a>',
     '__dir.t.g.txt': '<_+{}*(中>',
     c:
      { '__dir.content.g.html': '<div class="k-content"><ul><a href="/base/b/c/c1">title of c1</a><a href="/base/b/c/c2">title of c2</a></ul></div>',
        '__dir.path.g.html': '<a href="/base">base</a><a href="/base/b">&lt;_+{}*(中&gt;</a><a href="/base/b/c">c</a>',
        '__dir.t.g.txt': 'c',
        'c1.g.html': '<h1>title of c1</h1>\n',
        'c1.t.g.txt': 'title of c1',
        'c2.g.html': '<h1>title of c2</h1>\n',
        'c2.t.g.txt': 'title of c2' } } };

  await expect(validator.validateDirectoryAsync(base.resolve('base'), expected)).resolves.toBeUndefined();
});
