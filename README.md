# lcy-cli

lcy-cli 是一个命令行界面 (CLI) 工具，旨在简化和自动化常见的开发任务。

## 功能

- 易于使用的命令
- 自动化重复任务
- 可定制和可扩展

## 安装

要安装 lcy-cli，请运行以下命令：
```sh
npm install -g lcy-cli
```

## 使用方法

安装完成后，您可以使用 `lcy-cli` 命令。以下是一些常见的命令和配置项：

### 创建项目

```sh
lcy-cli create <project-name>
```
此命令将初始化一个新的项目，并可选在模板，
模板仓库可使用:
    lcy-cli config set <source> <platform>
    lcy-cli config set <owner> <user>
    配置。

### 创建仓库

仓库可选平台有github、gitee、gitlab。在以上平台中创建<仓库模板组织>,在该组织下创建模板仓库提交模板即可
