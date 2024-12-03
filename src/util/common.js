const path = require("path");
const fs = require("fs");

//loading效果
const fnLoading =
  (fn, msg) =>
  async (...argv) => {
    const ora = (await import("ora")).default;

    const spinner = ora(`正在${msg}...`);

    spinner.start();

    try {
      const result = await fn(...argv);
      if (result) {
        spinner.succeed(`${msg}成功`);
      } else {
        spinner.fail(`${msg}失败`);
      }
      return result;
    } catch (error) {
      spinner.fail(`${msg}失败`);
      throw error;
    }
  };

// 检查配置文件是否存在
const configFilePath = path.resolve(__dirname, "../config.json");
const checkConfig = () => {
  if (!fs.existsSync(configFilePath)) {
    fs.writeFileSync(
      configFilePath,
      JSON.stringify({
        source: "gitee",
        organization: "lcy-cli-template",
        timeout: "30000",
      })
    );
  }
  return configFilePath;
};

// 查询仓库列表地址
const getRepoListUrl = (platform, organization) => {
  switch (platform) {
    case "github":
      return `https://api.github.com/orgs/${organization}/repos`;
    case "gitee":
      return `https://gitee.com/api/v5/orgs/${organization}/repos`;
    case "gitlab":
      return `https://gitlab.com/api/v4/groups/${organization}/projects`;
    default:
      throw new Error("Unsupported platform");
  }
};

// 获取远程仓库下载地址
const getZipDownloadUrl = (platform, owner, repo, branch) => {
  switch (platform) {
    case "github":
      return `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;
    case "gitee":
      return `https://gitee.com/${owner}/${repo}/repository/archive/${branch}.zip`;
    case "gitlab":
      return `https://gitlab.com/${owner}/${repo}/-/archive/${branch}/${repo}-${branch}.zip`;
    default:
      throw new Error("Unsupported platform");
  }
};

// 查询标签列表地址
const getTagListUrl = (platform, owner, repo) => {
  switch (platform) {
    case 'github':
      return `https://api.github.com/repos/${owner}/${repo}/tags`;
    case 'gitee':
      return `https://gitee.com/api/v5/repos/${owner}/${repo}/tags`;
    case 'gitlab':
      return `https://gitlab.com/api/v4/projects/${encodeURIComponent(`${owner}/${repo}`)}/repository/tags`;
    default:
      throw new Error('Unsupported platform');
  }
};

module.exports = {
  fnLoading,
  configFilePath,
  checkConfig,
  getRepoListUrl,
  getTagListUrl,
  getZipDownloadUrl,
};
