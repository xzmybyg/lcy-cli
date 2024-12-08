const mapActions = {
  create: {
    alias: "cr",
    description: "创建一个项目",
    examples: ["lcy-cli create <project-name>"],
    options: [
      {
        flag: "-t, --template <template>",
        description: "指定项目模板",
      },
      {
        flag: "-d, --directory <directory>",
        description: "指定项目目录",
      },
      {
        flag: "-f, --force",
        description: "强制创建项目",
      }
    ],
  },
  config: {
    alias: "cf",
    description: "配置项目变量",
    examples: ["lcy-cli config set <key> <value>", "lcy-cli config get <key>", "lcy-cli config remove <key>"],
  },
  "*": {
    alias: "",
    description: "未知命令",
    examples: [],
  },
};

module.exports = {
  mapActions,
};
