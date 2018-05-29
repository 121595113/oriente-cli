const fs = require('fs-extra')
const chalk = require('chalk')
const path = require('path')

const templatePath = path.resolve(__dirname, '../src/template/module/')

let rootPath = null
module.paths.forEach((item) => {
  if (fs.pathExistsSync(item)) {
    rootPath = path.resolve(item, '../')
  }
});

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