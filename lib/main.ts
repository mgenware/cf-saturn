export * from './start';
export { default as PathComponent } from './pathComponent';
export { default as ContentGenerator } from './contentGenerator';
export * from 'barbary-node';
export { default as Config } from './config';

/* tslint:disable:no-console */
process.on('unhandledRejection', (err) => {
  console.log('Caught unhandledRejection');
  console.log(err);
});
