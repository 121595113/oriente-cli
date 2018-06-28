const fs = require('fs-extra')
const path = require('path');
const ora = require('ora');
const program = require('commander');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const symbols = require('log-symbols');
const chalk = require('chalk');
const CONFIG = require('../config');

exports.init = function (answers, name) {
  let cacheTemplate = CONFIG.TEMPLATE;
  if (!program.online && fs.existsSync(cacheTemplate)) {
    fs.copySync(cacheTemplate, name);
    _init(answers, name);
    return;
  }
  const spinner = ora('正在下载模板...');
  spinner.start();
  download(CONFIG.repositoryMaster, name, { clone: true }, (err) => {
    if (err) {
      spinner.fail();
      console.log(symbols.error, chalk.red(err));
    } else {
      spinner.succeed();
      fs.copySync(name, cacheTemplate);
      _init(answers, name);
    }
  })
}

function _init(answers, name) {
  const meta = {
    name: answers.name || name,
    description: answers.description,
    author: answers.author,
    version: answers.version || '0.0.1'
  }
  const fileName = `${name}/package.json`;
  if (fs.existsSync(fileName)) {
    const content = fs.readFileSync(fileName).toString();
    const result = handlebars.compile(content)(meta);
    fs.writeFileSync(fileName, result);
  }
  console.log(symbols.success, chalk.green('项目初始化完成'));
}