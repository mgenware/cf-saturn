import * as base from './helper/setup';
import validator from 'fx54-node';

beforeAll(async () => {
  await base.startAsync('base');
});

test('main', async () => {
  const expected = { '__dir.content.g.html': '<div class="k-content"><ul><li><a href="/a">a</a></li><li><a href="/b">&lt;_+{}*(中&gt;</a></li></ul></div>',
  '__dir.path.g.html': '<a href="/.">base</a>',
  '__dir.t.g.html': 'base',
  '__dir.t.g.txt': 'base',
  a:
   { '__dir.content.g.html': '<div class="k-content"><ul><li><a href="/a1">title of a1 &lt;&lt;</a></li></ul></div>',
     '__dir.path.g.html': '<a href="/.">base</a><a href="/a">a</a>',
     '__dir.t.g.html': 'a',
     '__dir.t.g.txt': 'a',
     '__dir.t_seo.g.html': 'a',
     '__dir.t_seo.g.txt': 'a',
     'a1.g.html': '<h1>title of a1 &lt;&lt;</h1>\n',
     'a1.t.g.html': 'title of a1 &lt;&lt;',
     'a1.t.g.txt': 'title of a1 <<',
     'a1.t_seo.g.html': 'title of a1 &lt;&lt;',
     'a1.t_seo.g.txt': 'title of a1 <<' },
  b:
   { '__dir.content.g.html': '<div class="k-content"><ul><li><a href="/c">c</a></li></ul></div>',
     '__dir.path.g.html': '<a href="/.">base</a><a href="/a">a</a><a href="/b">&lt;_+{}*(中&gt;</a>',
     '__dir.t.g.html': '&lt;_+{}*(中&gt;',
     '__dir.t.g.txt': '<_+{}*(中>',
     '__dir.t_seo.g.html': '&lt;_+{}*(中&gt;',
     '__dir.t_seo.g.txt': '<_+{}*(中>',
     c:
      { '__dir.content.g.html': '<div class="k-content"><ul><li><a href="/c1">title of c1</a></li><li><a href="/c2">title of c2</a></li></ul></div>',
        '__dir.path.g.html': '<a href="/.">base</a><a href="/a">a</a><a href="/b">&lt;_+{}*(中&gt;</a><a href="/c">c</a>',
        '__dir.t.g.html': 'c',
        '__dir.t.g.txt': 'c',
        '__dir.t_seo.g.html': 'c',
        '__dir.t_seo.g.txt': 'c',
        'c1.g.html': '<h1>title of c1</h1>\n',
        'c1.t.g.html': 'title of c1',
        'c1.t.g.txt': 'title of c1',
        'c1.t_seo.g.html': 'title of c1',
        'c1.t_seo.g.txt': 'title of c1',
        'c2.g.html': '<h1>title of c2</h1>\n',
        'c2.t.g.html': 'title of c2',
        'c2.t.g.txt': 'title of c2',
        'c2.t_seo.g.html': 'title of c2',
        'c2.t_seo.g.txt': 'title of c2' } } };

  await expect(validator.validateDirectoryAsync(base.resolve('base'), expected)).resolves.toBeUndefined();
});
