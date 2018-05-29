# oriente使用说明

## 安装

全局安装

```bash
$ npm i oriente -g
```

当前项目安装

```bash
$ npm i oriente -D
```

## 使用

1、使用全局方法

```bash
$ oriente <command> [option]
# 如
$ oriente create main-page
```

2、使用项目中方法

```bash
$ node node_modules/.bin/oriente <command> [option]
```

嫌每次写node_modules麻烦，也可以使用`npm scripts`功能，package.json中配置

```json
{
	"scripts": {
		"oriente": "node node_modules/.bin/oriente"
	}
}
```

然后终端执行

```bash
$ npm run oriente -- <command> [option]
```

## 查看当前版本

```bash
$ oriente -V
```

## 查使用详情

```bash
$ oriente --help
```

## 新增特性

### command

- remove