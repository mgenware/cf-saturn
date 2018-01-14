import * as base from './helper/setup';

beforeAll(async () => {
  await base.startAsync('markdown');
});

test('main', async () => {
  const expected = { '__dir.content.g.html': '<div class="k-content"><ul><li><a href="/a">a</a></li></ul></div>',
  '__dir.path.g.html': '<a href="/.">markdown</a>',
  '__dir.t.g.html': 'markdown',
  '__dir.t.g.txt': 'markdown',
  a:
   { '__dir.content.g.html': '<div class="k-content"><ul><li><a href="/a">title &gt;&gt;&gt;&lt;&lt;&lt;</a></li></ul></div>',
     '__dir.path.g.html': '<a href="/.">markdown</a><a href="/a">a</a>',
     '__dir.t.g.html': 'a',
     '__dir.t.g.txt': 'a',
     '__dir.t_seo.g.html': 'a',
     '__dir.t_seo.g.txt': 'a',
     'a.g.html': '<h1>title &gt;&gt;&gt;&lt;&lt;&lt;</h1>\n<p><code>a</code>b &gt;&gt;&gt;</p>\n',
     'a.t.g.html': 'title &gt;&gt;&gt;&lt;&lt;&lt;',
     'a.t.g.txt': 'title >>><<<',
     'a.t_seo.g.html': 'title &gt;&gt;&gt;&lt;&lt;&lt;',
     'a.t_seo.g.txt': 'title >>><<<' } };

  await expect(base.validator.validateDirectoryAsync(base.resolve('markdown'), expected)).resolves.toBeUndefined();
});
