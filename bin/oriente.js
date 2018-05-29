#!/usr/bin/env node

const program = require('commander');
const utils = require('./utils');

process.title = 'oriente';

program
  .version(require('../package').version)
  .usage('<command> [options]')

program
  .command('create <name> [path]')
  .description('创建新的业务模块')
  .alias('c')
  .action(function (name, path) {
    utils.create(name, path);
  })
  .on('--help', () => {
    console.log('  Examples:');
    console.log();
    console.log('    $ oriente create module1');
    console.log('    $ oriente create module2,module2');
    console.log();
  });
program.parse(process.argv);
