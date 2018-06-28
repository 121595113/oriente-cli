const fs = require('fs-extra')
const chalk = require('chalk')
const path = require('path')
const acorn = require('acorn')
const program = require('commander');
const escodegen = require('escodegen')
const download = require('download-git-repo');
const plugin = require('../template/plugin')
const utils = require('../utils')
const ora = require('ora');
const symbols = require('log-symbols');
const CONFIG = require('../config');

let cachePlugin = CONFIG.PLUGIN;

exports.pluginAdd = function (name, nameSpace, type, config) {
  const pluginDir = path.resolve(CONFIG.rootPath, `${CONFIG.DIST}/plugins/cordova-plugin-${name}`)
  const cordovaPlugins = path.resolve(CONFIG.rootPath, `${CONFIG.DIST}/cordova_plugins.js`)
  let createFile = fs.pathExists(pluginDir)
    .then(exists => {
      if (exists) return Promise.reject('插件已存在')
      return new Promise((resolve, reject) => {
        if (!program.online && fs.existsSync(cachePlugin)) {
          return resolve(fs.readFile(path.resolve(cachePlugin, './plugin_template.js'), 'utf8'))
        }
        fs.existsSync(cachePlugin) && fs.removeSync(cachePlugin);
        const spinner = ora('正在下载模板...');
        spinner.start();
        download(CONFIG.repositoryPlugin, cachePlugin, { clone: true }, (err) => {
          if(err){
            spinner.fail();
            console.log(symbols.error, chalk.red(err));
            reject(err);
          }
          spinner.succeed();
          console.log(symbols.success, chalk.green('模版下载成功'));
          resolve(fs.readFile(path.resolve(cachePlugin, './plugin_template.js'), 'utf8'))
        })
      })
    })
    .then(data => {
      let estree = acorn.parse(data)
      let estreeArg = estree.body[0].expression.arguments[0]
      estreeArg.value = `cordova-plugin-${name}.${utils.lastName(name)}`
      estreeArg.raw = `"cordova-plugin-${name}.${utils.lastName(name)}"`

      return fs.outputFile(path.resolve(pluginDir, `./www/${name}.js`), escodegen.generate(estree), 'utf8')
    })
    .then(() => {
      console.log(symbols.success, chalk.green('文件创建成功'));
    })
    .catch(err => {
      console.log(symbols.error, chalk.red(err));
    })

    // 修改配置
    config && createFile.then(() => {
      return fs.pathExists(cordovaPlugins);
    })
    .then(exists => {
      if (exists) {
        return fs.readFile(cordovaPlugins)
      }
      return fs.readFile(path.resolve(cachePlugin, './cordova_plugins.js'), 'utf8');
    })
    .then(data => {
      let comments = []
      let tokens = []
      let estree = acorn.parse(data, {
        ranges: true,
        onComment: comments,
        onToken: tokens
      })
      escodegen.attachComments(estree, comments, tokens)

      let elements = estree.body[0].expression.arguments[1].body.body[0].expression.right.elements;
      for (let item of elements) {
        let properties = item.properties
        for (let propertie of properties) {
          if (propertie.value.value === `cordova-plugin-${name}.${utils.lastName(name)}` && propertie.key.value === 'id') {
            return Promise.reject('配置已存在')
          }
        }
      }
      estree.body[0].expression.arguments[1].body.body[0].expression.right.elements.push(plugin.setItem(name, nameSpace, type))

      return fs.outputFile(cordovaPlugins, escodegen.generate(estree, { comment: true }), 'utf8')
        .then(() => {
          return '配置添加完成'
        })
    })
    .then(msg => {
      console.log(symbols.success, chalk.green(msg));
    })
    .catch(err => {
      console.log(symbols.error, chalk.red(err));
    });
}

exports.pluginRemove = function (name, config) {
  const pluginDir = path.resolve(CONFIG.rootPath, `${CONFIG.DIST}/plugins/cordova-plugin-${name}`)
  const cordovaPlugins = path.resolve(CONFIG.rootPath, `${CONFIG.DIST}/cordova_plugins.js`)
  let reomveFile = fs.pathExists(pluginDir)
    .then(exists => {
      return exists ? fs.remove(pluginDir).then(() => '插件移除成功') : Promise.reject('要移除问插件不存在')
    })

  let editConfig = config ? Promise.resolve() : fs.pathExists(cordovaPlugins)
    .then(exists => {
      return fs.readFile(cordovaPlugins)
    })
    .then(data => {
      let estree = acorn.parse(data)

      let elements = estree.body[0].expression.arguments[1].body.body[0].expression.right.elements;
      for (let i = 0; i < elements.length; i++) {
        let properties = elements[i].properties
        for (let propertie of properties) {
          if (propertie.value.value === `cordova-plugin-${name}.${utils.lastName(name)}` && propertie.key.value === 'id') {
            elements.splice(i, 1)
            return fs.outputFile(cordovaPlugins, escodegen.generate(estree), 'utf8')
              .then(() => '配置移除成功')
          }
        }
      }
    });

  Promise.all([reomveFile, editConfig])
    .then(msgs => {
      for (let msg of msgs) {
        if (msg) console.log(chalk.green(msg))
      }
    })
    .catch(err => {
      console.log(chalk.red(err))
    })
}


