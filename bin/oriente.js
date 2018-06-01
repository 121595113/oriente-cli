#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk')
const utils = require('./utils');

process.title = 'oriente';

if (process.argv.length <= 2) {
  console.log(chalk.green('$ oriente --help'))
  console.log(' or')
  console.log(chalk.green('$ oriente -h'))
  console.log('Check the details')
}

program
  .version(require('../package').version)
  .usage('<command> [options]')
  .option('--namespace [value]', '设置插件命名空间', '')
  .option('--config [boolean]', '是否更新配置文件', 'true')
  .option('--type [value]', '命名空间创建方式clobbers|merges', 'clobbers')

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

program
  .command('remove <name> [path]')
  .description('移除已有的业务模块')
  .alias('r')
  .action(function (name, path) {
    utils.remove(name, path);
  })
  .on('--help', () => {
    console.log('  Examples:');
    console.log();
    console.log('    $ oriente remove module1');
    console.log('    $ oriente remove module2,module2');
    console.log();
  });

program
  .command('plugin <method> <name>')
  .description('插件添加|删除操作')
  .action((method, name) => {
    if(method === 'add') {
      utils.pluginAdd(name, program.namespace, program.type, program.config === 'true')
    }
    if(method === 'remove') {
      utils.pluginRemove(name, program.config !== 'true')
    }
  })
  .on('--help', () => {
    console.log('  Examples:');
    console.log();
    console.log('    $ oriente plugin add example-plugin [--config false]');
    console.log('    $ oriente plugin remove example-plugin [--config false]');
    console.log();
  });

program.parse(process.argv);
