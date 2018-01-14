import * as base from './helper/setup';

beforeAll(async () => {
  await base.startAsync('seo_title_flat');
});

test('main', async () => {
  const expected = { '__dir.content.g.html': '<div class="k-content"><ul><li><a href="/a">&lt;a&gt;</a></li><li><a href="/b">&lt;b&gt;</a></li></ul></div>',
  '__dir.path.g.html': '<a href="/.">&lt;TITLE&gt;</a>',
  '__dir.t.g.html': '&lt;TITLE&gt;',
  '__dir.t.g.txt': '<TITLE>',
  'a.g.html': '<h1>&lt;a&gt;</h1>\n',
  'a.t.g.html': '&lt;a&gt;',
  'a.t.g.txt': '<a>',
  'a.t_seo.g.html': '&lt;a&gt;',
  'a.t_seo.g.txt': '<a>',
  'b.g.html': '<h1>&lt;b&gt;</h1>\n',
  'b.t.g.html': '&lt;b&gt;',
  'b.t.g.txt': '<b>',
  'b.t_seo.g.html': '&lt;b&gt;',
  'b.t_seo.g.txt': '<b>' };

  await expect(base.validator.validateDirectoryAsync(base.resolve('seo_title_flat'), expected)).resolves.toBeUndefined();
});
