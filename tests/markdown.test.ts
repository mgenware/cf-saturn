import * as base from './setup';

beforeAll(async () => {
  await base.startAsync('markdown');
});

test('main', async () => {
  await expect(base.validator.validateDirectoryAsync(base.resolve('markdown/a/'), {
    'a.g.html': '<h1>title</h1>\n<p><code>a</code>b</p>\n',
  })).resolves.toBeUndefined();
});
