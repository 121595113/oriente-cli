const path = require('path');
const utils = require('./utils');

exports.repositoryMaster = 'https://github.com:121595113/oriente-template#master';
exports.repositoryModule = 'https://github.com:121595113/oriente-template#module';
exports.repositoryPlugin = 'https://github.com:121595113/oriente-template#plugin';
exports.TEMPLATE = path.resolve(__dirname, '../.cache/template/');
exports.MODULE = path.resolve(__dirname, '../.cache/module/');
exports.PLUGIN = path.resolve(__dirname, '../.cache/plugin/');

exports.DIST = 'src'

const templatePath = path.resolve(__dirname, '../.cache/module/pages/')
const rootPath = utils.getRootPath(process.cwd())
const relativePath = path.relative(`${rootPath}`, process.cwd());

exports.templatePath = templatePath;
exports.rootPath = rootPath;
exports.relativePath = relativePath;