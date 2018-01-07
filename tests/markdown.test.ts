import * as base from './setup';
import validator from 'fx54-node';

test('markdown', async () => {
  await expect(validator.validateDirectoryAsync(base.resolve('markdown'), {
    'a.html': '<h1>title</h1>',
  }));
});
