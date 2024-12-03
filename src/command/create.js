const fs = require("fs");
const path = require("path");
const { spawn } = require('child_process');

const inquirer = require("inquirer");

const { fnLoading } = require("../util/common.js");
const { fetchReopLists, getTagLists, downTemplate } = require("../util/api.js");

module.exports = async (projectName) => {
  let templates = await fnLoading(fetchReopLists, "链接远程仓库")();
  templates = templates.map((item) => item.name);

  const { template } = await inquirer.prompt({
    name: "template",
    type: "list",
    message: "请选择一个模板",
    choices: templates,
  });

  // 获取版本信息
  let tags = await fnLoading(getTagLists, "正在获取版本信息...")(template);
  tags = tags.map((item) => item.name);

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

  try {
    await fnLoading(downTemplate, "下载模板")(template, projectName, tag);
  } catch (err) {
    throw new Error(err);
  }
  //TODO:根据配置生产package.json
  
  // 安装依赖
  // const projectPath = path.join(process.cwd(), projectName);
  // await spawn("npm", ["install"], { cwd: `${projectPath}` });
  // 修改 package.json 文件中的 name 字段
  // const packageJsonPath = path.join(process.cwd(), projectName, "package.json");
  // if (fs.existsSync(packageJsonPath)) {
  //   const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  //   packageJson.name = projectName;
  //   fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  // }
  // 提示用户安装完成
  console.log("安装完成");
  // console.log("运行以下命令启动项目:");
  // console.log(`cd ${projectName}`);
  // console.log("npm run serve");
};
