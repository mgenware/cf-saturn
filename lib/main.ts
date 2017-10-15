export * from './start';
export * from './eventArgs';
export { default as ContentGenerator } from './contentGenerator';
export * from 'barbary';
export { default as Config } from './config';

/* tslint:disable:no-console */
process.on('unhandledRejection', (err) => {
  console.log('Caught unhandledRejection');
  console.log(err);
});
