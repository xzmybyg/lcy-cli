const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

/**
 * 下载项目依赖
 * @param {string} projectName 项目名称
 * @param {string[]} dependenciesList 依赖列表
 * @returns {void}
 */
const downloadDependency = async (projectName, dependenciesList) => {
  const chalk = (await import("chalk")).default;

  const { dependencies } = await inquirer.prompt({
    name: "dependencies",
    type: "checkbox",
    message: "请选择需要安装的依赖",
    choices: dependenciesList,
  });

  const cwdPath = path.join(process.cwd(), projectName);

  if (!fs.existsSync(cwdPath)) {
    console.error(`工作目录不存在: ${cwdPath}`);
    return;
  }

  // 安装依赖
  const command = process.platform === "win32" ? "cmd" : "npm";
  const args = process.platform === "win32" ? ["/c", "npm", "install", ...dependencies] : ["install", ...dependencies];
  const options = { stdio: "inherit", cwd: cwdPath };

  try {
    await new Promise((resolve, reject) => {
      const install = spawn(command, args, options);

      install.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`npm install 失败，退出代码 ${code}`));
        }
      });

      install.on("error", (err) => {
        reject(new Error(`npm install 失败: ${err.message}`));
      });
    });

    console.log(`安装完成\n运行以下命令启动项目:\n${chalk.green(`cd ${projectName}`)}\n${chalk.green("npm run serve")}`);
  } catch (err) {
    console.error(chalk.red("安装依赖失败, 请手动安装"));
  }
};

module.exports = {
  downloadDependency,
};
