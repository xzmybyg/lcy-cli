const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const inquirer = require("inquirer");

const { fnLoading } = require("../util/common.js");
const { fetchReopLists, getTagLists, downTemplate } = require("../util/api.js");
const { downloadDependency } = require("../util/downloadDependency.js");
const { dependenciesMap } = require("../util/constants.js");
const { getConfig } = require("../util/api.js");

module.exports = async (argv, options) => {
  const [projectName] = argv;
  let { template, directory, force } = options;

  // 检查当前目录是否存在项目名
  prjectPath = path.join(process.cwd(), projectName);
  if (fs.existsSync(prjectPath)) {
    if (force) {
      fs.rmSync(projectName, { recursive: true });
    } else {
      const { isCover } = await inquirer.prompt({
        name: "isCover",
        type: "confirm",
        message: "当前目录已存在，是否覆盖？",
      });
      if (!isCover) {
        console.log("已取消操作");
        return;
      }
      fs.rmSync(projectName, { recursive: true });
    }
  }
  let templates;
  try {
    // 获取模板列表
    templates = await fnLoading(fetchReopLists, "链接远程仓库")();
    templates = templates.map((item) => item.name);

    if (!template) {
      const { template: _template } = await inquirer.prompt({
        name: "template",
        type: "list",
        message: "请选择一个模板",
        choices: templates,
      });
      template = _template;
    } else if (!templates.includes(template)) {
      console.log("模板不存在");
      return;
    }
  } catch (err) {
    console.log("获取模板列表失败");
    return;
  }

  // 获取版本信息
  let tags = [];
  try {
    tags = await fnLoading(getTagLists, "正在获取版本信息...")(template);
    tags = tags.map((item) => item.name);
  } catch (err) {
    console.log("获取版本信息失败，使用默认版本 master");
  }

  let tag;
  if (tags.length > 0) {
    const tagPrompt = await inquirer.prompt({
      name: "tag",
      type: "list",
      message: "请选择一个版本",
      choices: tags,
    });
    tag = tagPrompt.tag;
  } else {
    console.log("没有可用的版本，使用默认版本 master");
    tag = "master";
  }

  // 重试下载模板
  const { maxRetries = 1 } = await getConfig();
  let attempt = 0;
  let success = false;

  while (attempt < maxRetries && !success) {
    try {
      await fnLoading(downTemplate, "下载模板")(template, projectName, tag);
      success = true;
    } catch (err) {
      attempt++;
      console.log(`下载模板失败`);
      if (attempt >= maxRetries) {
        throw new Error("下载模板失败，请检查网络连接或稍后重试\n" + err.message);
      }
      console.log(`正在重试下载模板，第 ${attempt} 次`);
    }
  }

  // 修改 package.json 文件中的 name 字段
  const packageJsonPath = path.join(process.cwd(), projectName, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    packageJson.name = projectName;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }

  // 根据模板选择依赖列表
  const dependenciesList = dependenciesMap[template] || [];
  if (dependenciesList.length > 0) {
    try {
      await downloadDependency(projectName, dependenciesList);
    } catch (err) {
      // console.log("下载依赖失败");
    }
  }
};
