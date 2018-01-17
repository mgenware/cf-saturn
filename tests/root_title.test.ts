import * as base from './helper/setup';

beforeAll(async () => {
  await base.startAsync('root_title');
});

test('main', async () => {
  const expected = { '__dir.content.g.html': '<div class="k-content"><ul><li><a href="/a">a</a></li></ul></div>',
  '__dir.path.g.html': '<a href="/">&lt;TITLE&gt;</a>',
  '__dir.t.g.html': '&lt;TITLE&gt;',
  '__dir.t.g.txt': '<TITLE>',
  a:
   { '__dir.content.g.html': '<div class="k-content"><ul><li><a href="/a/a">title</a></li></ul></div>',
     '__dir.path.g.html': '<a href="/">&lt;TITLE&gt;</a><a href="/a">a</a>',
     '__dir.t.g.html': 'a',
     '__dir.t.g.txt': 'a',
     '__dir.t_seo.g.html': 'a',
     '__dir.t_seo.g.txt': 'a',
     'a.g.html': '<h1>title</h1>\n',
     'a.t.g.html': 'title',
     'a.t.g.txt': 'title',
     'a.t_seo.g.html': 'title',
     'a.t_seo.g.txt': 'title' } };

  await expect(base.validator.validateDirectoryAsync(base.resolve('root_title'), expected)).resolves.toBeUndefined();
});
