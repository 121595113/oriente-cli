const fs = require('fs-extra')
const chalk = require('chalk')
const path = require('path')
const program = require('commander');
const download = require('download-git-repo');
const ora = require('ora');
const symbols = require('log-symbols');
const CONFIG = require('../config');

/**
 * 转换成驼峰命名法
 * @param  {string} str [description]
 * @return {string}     [description]
 */
function toCamelCase(str) {
  return (str || '').replace(/-(\w)/g, (all, letter) => {
    return letter.toUpperCase()
  })
}

exports.create = function (name, spacePath) {
  let cacheModule = CONFIG.MODULE;
  if (!program.online && fs.existsSync(cacheModule)) {
    _create(name, spacePath);
    return;
  }
  fs.existsSync(cacheModule) && fs.removeSync(cacheModule);
  const spinner = ora('正在下载模板...');
  spinner.start();
  download(CONFIG.repositoryModule, cacheModule, { clone: true }, (err) => {
    if(err){
      spinner.fail();
      console.log(symbols.error, chalk.red(err));
      return;
    }
    spinner.succeed();
    console.log(symbols.success, chalk.green('模版下载成功'));
    _create(name, spacePath);
  })
};

function _create(name, spacePath) {
  spacePath = spacePath || `${CONFIG.DIST}/pages`

  let pAll = [];
  let jsonFile

  name.split(',').forEach((curName, index) => {
    const targetPath = path.resolve(`${CONFIG.rootPath}/${CONFIG.relativePath ? CONFIG.relativePath : spacePath}/`, `${curName}`)
    jsonFile = jsonFile || path.resolve(targetPath, `../package.json`)
    pAll[index] = fs.pathExists(CONFIG.templatePath)
      .then(exists => {
        if (!exists) return Promise.reject('模板文件不存在')
        return fs.pathExists(targetPath)
      })
      .then(exists => {
        if (exists) {
          return Promise.reject(`创建失败, ${curName}已存在`)
        }
        return fs.copy(CONFIG.templatePath, targetPath)
      })
      .then(() => {
        console.log(chalk.green(`${curName}创建成功`))
        return curName
      })
      .catch(err => {
        console.error(chalk.red(err))
      });
  })

  Promise.all(pAll).then(names => {
      return fs.pathExists(jsonFile)
        .then(exists => {
          return fs.readJson(exists ? jsonFile : path.resolve(CONFIG.templatePath, '../package.json'))
            .then(packageObj => {
              return {
                type: exists ? 'new' : 'copy',
                data: packageObj
              }
            })
        })
        .then(res => {
          let isEmpty = true;
          for (let curName of names) {
            if (curName) {
              let fileName = curName.split('/')
              fileName = fileName[fileName.length - 1]
              res.data['router-mapping'][toCamelCase(fileName)] = fileName;
              isEmpty = false
              continue;
            }
          }
          return fs.writeJson(jsonFile, res.data, { spaces: 2 })
            .then(() => res.type === 'copy' ? `并创建了package.json文件，路径如下 -> ${jsonFile}` : isEmpty ? '' : '配置添加成功')
        })
    })
    .then(msg => {
      if (msg) console.log(chalk.green(msg))
    })
    .catch(err => {
      console.error(chalk.red(err))
    })
}

exports.remove = function (name, spacePath) {
  spacePath = spacePath || `${CONFIG.DIST}/pages`

  name.split(',').forEach(curName => {
    const targetPath = path.resolve(`${CONFIG.rootPath}/${CONFIG.relativePath ? CONFIG.relativePath : spacePath}/`, `${curName}`)
    const jsonFile = path.resolve(targetPath, `../package.json`)
    fs.pathExists(targetPath)
      .then(exists => {
        return exists ? fs.remove(targetPath) : Promise.reject('模块不存在')
      })
      .then(() => {
        console.log(chalk.green(`${curName}移除成功`))
        return fs.readJson(jsonFile)
      })
      .then(packageObj => {
        if (packageObj) {
          let fileName = curName.split('/')
          fileName = fileName[fileName.length - 1]
          delete packageObj['router-mapping'][toCamelCase(fileName)]
          return fs.writeJson(jsonFile, packageObj, { spaces: 2 })
        }
      })
      .catch(err => {
        console.log(chalk.red(err))
      })
  })
}