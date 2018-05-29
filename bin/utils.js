const fs = require('fs-extra')
const chalk = require('chalk')
const path = require('path')

function getRootPath(_rootpath) {
  while (_rootpath && !fs.pathExistsSync(path.resolve(_rootpath, 'node_modules'))) {
    _rootpath = path.resolve(_rootpath, '../')
  }
  return _rootpath;
}

const templatePath = path.resolve(__dirname, '../src/template/module/')
const rootPath = getRootPath(process.cwd())


exports.create = function (name, spacePath) {
  spacePath = spacePath || 'src/pages'
  const relativePath = path.relative(`${rootPath}`, process.cwd());

  name.split(',').forEach((curName) => {
    const targetPath = path.resolve(`${rootPath}/${relativePath ? relativePath : spacePath}/`, `${curName}`)
    fs.pathExists(templatePath, (err, exists) => {
      if (err) return console.error(err)
      if (!exists) return
      fs.pathExists(targetPath, (err, exists) => {
        if (err) return console.error(err)
        if (exists) return console.log(chalk.red(`${curName}已存在`))
        fs.copy(templatePath, targetPath)
          .then(() => {
            console.log(chalk.green(`${curName}创建成功`))
          })
          .catch(err => {
            console.log(chalk.red(`${curName}创建失败`))
          })
      })
    })
  })
};

exports.remove = function (name, spacePath) {
  spacePath = spacePath || 'src/pages'
  const relativePath = path.relative(`${rootPath}`, process.cwd());

  name.split(',').forEach((curName) => {
    const targetPath = path.resolve(`${rootPath}/${relativePath ? relativePath : spacePath}/`, `${curName}`)
    fs.pathExists(targetPath, (err, exists) => {
      if (err) return console.error(err)
      if (exists) {
        fs.remove(targetPath, err => {
          if (err) return console.error(err);
          console.log(chalk.green(`${curName}移除成功`))
        });
      }
    })
  })
}
