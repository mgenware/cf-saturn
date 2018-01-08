
import objectFromDirectory from 'fx45-node';

if (process.argv.length >= 3) {
  const name = process.argv[2];
  const results = objectFromDirectory('./saturn/dist/' + name);
  // tslint:disable-next-line no-console
  console.log(results);
} else {
  process.exit(1);
}
