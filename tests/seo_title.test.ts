import * as base from './helper/setup';

beforeAll(async () => {
  await base.startAsync('seo_title');
});

test('main', async () => {
  const expected = { '__dir.content.g.html': '<div class="k-content"><ul><li><a href="/a">a</a></li></ul></div>',
  '__dir.path.g.html': '<a href="/">&lt;Root&gt;&lt;/Root&gt;</a>',
  '__dir.t.g.html': '&lt;Root&gt;&lt;/Root&gt;',
  '__dir.t.g.txt': '<Root></Root>',
  a:
   { '__dir.content.g.html': '<div class="k-content"><ul><li><a href="/a/b">b</a></li><li><a href="/a/c">&lt;dir.c&gt;&lt;/dir.c&gt;</a></li></ul></div>',
     '__dir.path.g.html': '<a href="/">&lt;Root&gt;&lt;/Root&gt;</a><a href="/a">a</a>',
     '__dir.t.g.html': 'a',
     '__dir.t.g.txt': 'a',
     '__dir.t_seo.g.html': 'a',
     '__dir.t_seo.g.txt': 'a',
     'a.g.html': '<h1>&lt;a&gt;&lt;/a&gt;</h1>\n',
     'a.t.g.html': '&lt;a&gt;&lt;/a&gt;',
     'a.t.g.txt': '<a></a>',
     'a.t_seo.g.html': '&lt;a&gt;&lt;/a&gt;',
     'a.t_seo.g.txt': '<a></a>',
     b:
      { '__dir.content.g.html': '<div class="k-content"><ul><li><a href="/a/b/b">&lt;b&gt;&lt;/b&gt;</a></li></ul></div>',
        '__dir.path.g.html': '<a href="/">&lt;Root&gt;&lt;/Root&gt;</a><a href="/a">a</a><a href="/a/b">b</a>',
        '__dir.t.g.html': 'b',
        '__dir.t.g.txt': 'b',
        '__dir.t_seo.g.html': 'b - &lt;A&gt;&lt;/A&gt;',
        '__dir.t_seo.g.txt': 'b - <A></A>',
        'b.g.html': '<h1>&lt;b&gt;&lt;/b&gt;</h1>\n',
        'b.t.g.html': '&lt;b&gt;&lt;/b&gt;',
        'b.t.g.txt': '<b></b>',
        'b.t_seo.g.html': '&lt;b&gt;&lt;/b&gt; - &lt;A&gt;&lt;/A&gt;',
        'b.t_seo.g.txt': '<b></b> - <A></A>' },
     c:
      { '__dir.content.g.html': '<div class="k-content"><ul><li><a href="/a/c/d">d</a></li></ul></div>',
        '__dir.path.g.html': '<a href="/">&lt;Root&gt;&lt;/Root&gt;</a><a href="/a">a</a><a href="/a/b">b</a><a href="/a/c">&lt;dir.c&gt;&lt;/dir.c&gt;</a>',
        '__dir.t.g.html': '&lt;dir.c&gt;&lt;/dir.c&gt;',
        '__dir.t.g.txt': '<dir.c></dir.c>',
        d:
         { '__dir.content.g.html': '<div class="k-content"><ul><li><a href="/a/c/d/e">&lt;dir.e&gt;&lt;/dir.e&gt;</a></li></ul></div>',
           '__dir.path.g.html': '<a href="/">&lt;Root&gt;&lt;/Root&gt;</a><a href="/a">a</a><a href="/a/b">b</a><a href="/a/c">&lt;dir.c&gt;&lt;/dir.c&gt;</a><a href="/a/c/d">d</a>',
           '__dir.t.g.html': 'd',
           '__dir.t.g.txt': 'd',
           '__dir.t_seo.g.html': 'd - &lt;B&gt;&lt;/B&gt;',
           '__dir.t_seo.g.txt': 'd - <B></B>',
           e:
            { '__dir.content.g.html': '<div class="k-content"><ul><li><a href="/a/c/d/e/e">&lt;e&gt;&lt;/e&gt;</a></li></ul></div>',
              '__dir.path.g.html': '<a href="/">&lt;Root&gt;&lt;/Root&gt;</a><a href="/a">a</a><a href="/a/b">b</a><a href="/a/c">&lt;dir.c&gt;&lt;/dir.c&gt;</a><a href="/a/c/d">d</a><a href="/a/c/d/e">&lt;dir.e&gt;&lt;/dir.e&gt;</a>',
              '__dir.t.g.html': '&lt;dir.e&gt;&lt;/dir.e&gt;',
              '__dir.t.g.txt': '<dir.e></dir.e>',
              '__dir.t_seo.g.html': '&lt;dir.e&gt;&lt;/dir.e&gt; - &lt;B&gt;&lt;/B&gt;',
              '__dir.t_seo.g.txt': '<dir.e></dir.e> - <B></B>',
              'e.g.html': '<h1>&lt;e&gt;&lt;/e&gt;</h1>\n',
              'e.t.g.html': '&lt;e&gt;&lt;/e&gt;',
              'e.t.g.txt': '<e></e>',
              'e.t_seo.g.html': '&lt;e&gt;&lt;/e&gt; - &lt;B&gt;&lt;/B&gt;',
              'e.t_seo.g.txt': '<e></e> - <B></B>' } } } } };

  await expect(base.validator.validateDirectoryAsync(base.resolve('seo_title'), expected)).resolves.toBeUndefined();
});
