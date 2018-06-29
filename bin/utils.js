const path = require('path');
const fs = require('fs-extra');
/**
 * 获取项目根目录
 * @param  {string} _rootpath 要查询的路径
 * @return {sting}           [description]
 */
exports.getRootPath = function(_rootpath) {
  while (_rootpath && (!fs.pathExistsSync(path.resolve(_rootpath, 'node_modules')) || !fs.pathExistsSync(path.resolve(_rootpath, 'package.json')))) {
    _rootpath = path.resolve(_rootpath, '../')
  }
  return _rootpath;
}

exports.lastName = function (name) {
  return name.substr(name.lastIndexOf('-') + 1 || 0)
}