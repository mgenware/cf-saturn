import * as base from './helper/setup';

const NAME = 'underscore_md_file';

beforeAll(async () => {
  await base.startAsync(NAME);
});

test('main', async () => {
  const expected = { '__dir.content.g.html': '<div class="k-content"><ul><li><a href="/b">b</a></li></ul></div>',
  '__dir.path.g.html': '<a href="/">underscore_md_file</a>',
  '__dir.t.g.html': 'underscore_md_file',
  '__dir.t.g.txt': 'underscore_md_file',
  'a.g.html': '<h1>t</h1>\n',
  'a.t.g.html': 't',
  'a.t.g.txt': 't',
  'a.t_seo.g.html': 't',
  'a.t_seo.g.txt': 't',
  b:
   { '__dir.content.g.html': '<div class="k-content"><ul><li><a href="/b/b">t</a></li></ul></div>',
     '__dir.path.g.html': '<a href="/">underscore_md_file</a><a href="/b">b</a>',
     '__dir.t.g.html': 'b',
     '__dir.t.g.txt': 'b',
     '__dir.t_seo.g.html': 'b',
     '__dir.t_seo.g.txt': 'b',
     'b.g.html': '<h1>t</h1>\n',
     'b.t.g.html': 't',
     'b.t.g.txt': 't',
     'b.t_seo.g.html': 't',
     'b.t_seo.g.txt': 't' } };

  await expect(base.validator.validateDirectoryAsync(base.resolve(NAME), expected)).resolves.toBeUndefined();
});
