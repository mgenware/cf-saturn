
import objectFromDirectory from 'fx45-node';
import * as nodepath from 'path';

if (process.argv.length >= 3) {
  const name = process.argv[2];
  const results = objectFromDirectory(nodepath.resolve(__dirname, '../../dist/tests/saturn/dist/' + name));
  // tslint:disable-next-line no-console
  console.log(results);
} else {
  process.exit(1);
}
