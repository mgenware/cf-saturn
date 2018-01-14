
import objectFromDirectory from 'fx45-node';
import * as nodepath from 'path';
import * as util from 'util';

if (process.argv.length >= 3) {
  const name = process.argv[2];
  const results = objectFromDirectory(nodepath.resolve(__dirname, '../../dist/tests/saturn/dist/' + name));
  // tslint:disable-next-line no-console
  console.log(util.inspect(results, false, null, true));
} else {
  process.exit(1);
}
