import * as base from './helper/setup';

beforeAll(async () => {
  await base.startAsync('attached_title');
});

test('main', async () => {
  const expected = { '__dir.content.g.html': '<div class="k-content"><ul><a href="/root_title/a">a</a></ul></div>',
  '__dir.path.g.html': '<a href="/root_title">&lt;TITLE&gt;</a>',
  '__dir.t.g.txt': '<TITLE>'};

  await expect(base.validator.validateDirectoryAsync(base.resolve('attached_title'), expected)).resolves.toBeUndefined();
});
