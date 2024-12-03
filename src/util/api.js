const fs = require("fs");
const path = require("path");
const https = require("https");

const axios = require("axios");
const unzipper = require("unzipper");

const { checkConfig, getRepoListUrl, getTagListUrl, getZipDownloadUrl } = require("./common");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

/** 获取远程仓库列表。
 * @returns {Promise<Object>} 返回仓库列表。
 */
const fetchReopLists = async () => {
  const { source, organization } = await getConfig();

  const repoListUrl = getRepoListUrl(source, organization);

  const { data } = await axios.get(repoListUrl, { httpsAgent });
  return data;
};

/** /获取远程仓库tag列表
 * @param {string} repo 仓库名称
 * @returns {Promise<Object>} 返回tag列表。
 */
const getTagLists = async (repo) => {
  const { source, organization } = await getConfig();
  const getTagUrl = getTagListUrl(source, organization, repo);

  const { data } = await axios.get(getTagUrl, { httpsAgent });
  return data;
};

// 下载模板
const downTemplate = async (template, projectName, tag) => {
  const { source, organization } = await getConfig();
  const branch = tag || "master";
  const project = getZipDownloadUrl(source, organization, template, branch);

  // 获取当前终端路径
  const currentTerminalPath = process.cwd();
  const targetPath = `${currentTerminalPath}/${projectName}`;

  let status;

  try {
    console.log(`正在下载 ZIP 文件：${project}`);
    // 下载模板
    const response = await axios({
      url: project,
      method: "GET",
      responseType: "stream",
      httpsAgent,
    });
    // 创建 ZIP 文件
    const zipPath = path.join(currentTerminalPath, `${projectName}.zip`);
    // 创建写入流
    const writer = fs.createWriteStream(zipPath);
    // 写入 ZIP 文件
    response.data.pipe(writer);
    // 等待写入完成
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log(`正在解压缩 ZIP 文件到：${targetPath}`);
    // 解压 ZIP 文件
    await fs
      .createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: targetPath })) // 解压到指定目录
      .promise(); // 等待解压完成

    fs.unlinkSync(zipPath); // 删除 ZIP 文件

    // 移动解压后的内容到目标路径
    const extractedFolderName = fs.readdirSync(targetPath).find((name) => name.startsWith(template));
    const extractedFolderPath = path.join(targetPath, extractedFolderName);

    fs.readdirSync(extractedFolderPath).forEach((file) => {
      fs.renameSync(path.join(extractedFolderPath, file), path.join(targetPath, file));
    });

    fs.rmSync(extractedFolderPath, { recursive: true }); // 删除多余的文件夹

    status = true;
  } catch (error) {
    console.error(error);
    status = false;
  }

  return status;
};

const configFilePath = path.resolve(__dirname, "../config.json");
/** 获取配置文件
 * @returns {Promise<Object>} 返回配置文件。
 */
const getConfig = async () => {
  checkConfig();
  const config = await JSON.parse(fs.readFileSync(configFilePath, "utf-8"));
  return config;
};

module.exports = {
  fetchReopLists,
  getTagLists,
  downTemplate,
  getConfig,
};
