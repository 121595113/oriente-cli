const fs = require('fs-extra')
const chalk = require('chalk')
const path = require('path')

/**
 * 获取项目根目录
 * @param  {string} _rootpath 要查询的路径
 * @return {sting}           [description]
 */
function getRootPath(_rootpath) {
  while (_rootpath && !fs.pathExistsSync(path.resolve(_rootpath, 'node_modules'))) {
    _rootpath = path.resolve(_rootpath, '../')
  }
  return _rootpath;
}

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

const templatePath = path.resolve(__dirname, '../src/template/module/')
const rootPath = getRootPath(process.cwd())
const relativePath = path.relative(`${rootPath}`, process.cwd());

exports.create = function (name, spacePath) {
  spacePath = spacePath || 'test/pages'

  name.split(',').forEach(curName => {
    const targetPath = path.resolve(`${rootPath}/${relativePath ? relativePath : spacePath}/`, `${curName}`)
    const jsonFile = path.resolve(targetPath, `../package.json`)
    fs.pathExists(templatePath)
      .then(exists => {
        if (!exists) return Promise.reject('模板文件不存在')
        return fs.pathExists(targetPath)
      })
      .then(exists => {
        if (exists) {
          return Promise.reject(`创建失败, ${curName}已存在`)
        }
        return fs.copy(templatePath, targetPath)
      })
      .then(() => {
        console.log(chalk.green(`${curName}创建成功`))
        return fs.pathExists(jsonFile)
      })
      .then(exists => {
        return fs.readJson(exists ? jsonFile : path.resolve(templatePath, '../package.json'))
      })
      .then(packageObj => {
        if (packageObj) {
          let fileName = curName.split('/')
          fileName = fileName[fileName.length - 1]
          packageObj['router-mapping'][toCamelCase(fileName)] = fileName;
          return fs.writeJson(jsonFile, packageObj, { spaces: 2 })
        }
        console.log(`并创建了package.json文件，路径如下 -> ${jsonFile}`)
      })
      .catch(err => {
        console.error(chalk.red(err))
      })
  })
};

exports.remove = function (name, spacePath) {
  spacePath = spacePath || 'test/pages'

  name.split(',').forEach(curName => {
    const targetPath = path.resolve(`${rootPath}/${relativePath ? relativePath : spacePath}/`, `${curName}`)
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
