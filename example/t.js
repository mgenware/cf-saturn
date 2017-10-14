const main = require('..');
const bb = require('barbary');

const src = './data/root';
const cache = './data/saturn/cache';
const dest = './data/saturn/dist';
main.start(src, '**/*.md', dest, cache, new bb.Logger(new bb.ConsoleProvider({ showColor: true })));