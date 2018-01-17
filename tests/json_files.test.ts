import * as base from './helper/setup';

const NAME = 'json_files';

beforeAll(async () => {
  await base.startAsync(NAME);
});

test('main', async () => {
  const expected = { 'root.json': '{\n  "id": 1\n}',
  a: { b: { 'b.json': '123' } } };

  await expect(base.validator.validateDirectoryAsync(base.resolve(NAME), expected)).resolves.toBeUndefined();
});
