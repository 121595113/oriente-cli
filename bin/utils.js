const fs = require('fs-extra')
const chalk = require('chalk')
const path = require('path')
const acorn = require('acorn')
const escodegen = require('escodegen')
const plugin = require('./plugin')

const dist = 'test'

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
  spacePath = spacePath || `${dist}/pages`

  let pAll = [];
  let jsonFile

  name.split(',').forEach((curName, index) => {
    const targetPath = path.resolve(`${rootPath}/${relativePath ? relativePath : spacePath}/`, `${curName}`)
    jsonFile = jsonFile || path.resolve(targetPath, `../package.json`)
    pAll[index] = fs.pathExists(templatePath)
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
        return curName
      })
      .catch(err => {
        console.error(chalk.red(err))
      });
  })

  Promise.all(pAll).then(names => {
      return fs.pathExists(jsonFile)
        .then(exists => {
          return fs.readJson(exists ? jsonFile : path.resolve(templatePath, '../package.json'))
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

};

exports.remove = function (name, spacePath) {
  spacePath = spacePath || `${dist}/pages`

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

exports.pluginAdd = function (name, nameSpace, type, config) {
  const pluginDir = path.resolve(rootPath, `${dist}/plugins/cordova-plugin-${name}`)
  const cordovaPlugins = path.resolve(rootPath, `${dist}/cordova_plugins.js`)
  let createFile = fs.pathExists(pluginDir)
    .then(exists => {
      if (exists) return Promise.reject('插件已存在')
      return fs.readFile(path.resolve(__dirname, '../src/template/plugin/plugin_template.js'), 'utf8')
    })
    .then(data => {
      let estree = acorn.parse(data)
      let estreeArg = estree.body[0].expression.arguments[0]
      estreeArg.value = `cordova-plugin-${name}.${plugin.lastName(name)}`
      estreeArg.raw = `"cordova-plugin-${name}.${plugin.lastName(name)}"`

      return fs.outputFile(path.resolve(pluginDir, `./www/${name}.js`), escodegen.generate(estree), 'utf8')
    })
    .then(() => {
      return '文件创建成功'
    });

  let editConfig = !config ? Promise.resolve() : fs.pathExists(cordovaPlugins)
    .then(exists => {
      return fs.readFile(exists ? cordovaPlugins : path.resolve(__dirname, '../src/template/plugin/cordova_plugins.js'), 'utf8')
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
          if (propertie.value.value === `cordova-plugin-${name}.${plugin.lastName(name)}` && propertie.key.value === 'id') {
            return Promise.reject('配置已存在')
          }
        }
      }
      estree.body[0].expression.arguments[1].body.body[0].expression.right.elements.push(plugin.setItem(name, nameSpace, type))

      return fs.outputFile(cordovaPlugins, escodegen.generate(estree, { comment: true }), 'utf8')
        .then(() => {
          return '配置添加完成'
        })
    });
  Promise.all([createFile, editConfig])
    .then(msgs => {
      for (let msg of msgs) {
        if (msg) console.log(chalk.green(msg))
      }
    })
    .catch(err => {
      console.log(chalk.red(err))
    })
}

exports.pluginRemove = function (name, config) {
  const pluginDir = path.resolve(rootPath, `${dist}/plugins/cordova-plugin-${name}`)
  const cordovaPlugins = path.resolve(rootPath, `${dist}/cordova_plugins.js`)
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
          if (propertie.value.value === `cordova-plugin-${name}.${plugin.lastName(name)}` && propertie.key.value === 'id') {
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
