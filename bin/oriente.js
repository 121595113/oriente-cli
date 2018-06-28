#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const program = require('commander');
const chalk = require('chalk');
const utils = require('./handler/index');
const inquirer = require('inquirer');

const symbols = require('log-symbols');

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
  .option('--online', '从远程库更新')

// 初始化项目
program
  .command('init <name>')
  .action(name => {
    if (fs.existsSync(name)) {
      console.log(symbols.error, chalk.red(`${name}已存在`));
      return;
    }
    inquirer.prompt([
    {
      name: 'name',
      message: `name`,
      default: name
    },
    {
      name: 'description',
      message: '请输入项目描述'
    },
    {
      name: 'author',
      message: '请输入作者名称'
    },
    {
      name: 'version',
      message: '请输入初始版本号',
      default: '0.0.1'
    }
    ]).then((answers) => {
     utils.init(answers, name);
    });
});

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
    if (method === 'add') {
      inquirer.prompt([
        {
          name: 'namespace',
          message: '插件的命名空间',
          default: 'cordova.plugins'
        },
        {
          type: 'list',
          name: 'type',
          message: '命名空间创建方式',
          choices: ['clobbers', 'merges'],
          default: 'clobbers'
        },
        {
          type: 'confirm',
          name: 'config',
          message: '同步更新配置文件？',
          default: true
        }
      ]).then(answers => {
        utils.pluginAdd(name, answers.namespace, answers.type, answers.config)
      })
    }
    if (method === 'remove') {
      inquirer.prompt([
        {
          type: 'confirm',
          name: 'config',
          message: '删除配置文件中相关的信息？',
          default: true
        }
      ]).then(answers => {
        utils.pluginRemove(name, answers.config)
      });
    }
  })
  .on('--help', () => {
    console.log('  Examples:');
    console.log();
    console.log('    $ oriente plugin add example-plugin');
    console.log('    $ oriente plugin remove example-plugin');
    console.log();
  });

program.parse(process.argv);
