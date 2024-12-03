const fs = require("fs");
const path = require("path");

const configFilePath = path.resolve(__dirname, "../config.json");

module.exports = (action, key, value) => {
  if (!fs.existsSync(configFilePath)) {
    fs.writeFileSync(configFilePath, JSON.stringify({}));
  }

  const config = JSON.parse(fs.readFileSync(configFilePath, "utf-8"));

  switch (action) {
    case "set":
      const supportList = ["github", "gitee", "gitlab"];
      if (key === "source" && supportList.findIndex((item) => item === value) === -1) {
        console.log(`不支持${value}平台`);
        break;
      }
      config[key] = value;

      fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
      console.log(`配置项 ${key} 已设置为 ${config[key]}`);
      break;

    case "get":
      console.log(config[key] ? `${key}: ${config[key]}` : `配置项 ${key} 不存在`);
      break;

    // case "remove":
    //   delete config[key];
    //   fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    //   console.log(`配置项 ${key} 已移除`);
    //   break;

    default:
      console.log("无效的操作");
  }
};
