const { Command } = require("commander");
const path = require("path");

const { mapActions } = require("./util/actions");
const packageConfig = require("../package.json");

//创建命令
const program = new Command();

//映射命令
Reflect.ownKeys(mapActions).forEach((action) => {
  const { alias, description, options } = mapActions[action];
  const command = program.command(action).alias(alias).description(description);

  // 检查是否有 options
  if (options) {
    options.forEach((option) => {
      command.option(option.flag, option.description);
    });
  }
  command.action((options, args) => {
    if (action === "*") {
      console.log(mapActions[action].description);
    } else {
      const argv = args.args;
      require(path.join(__dirname, "command", action))(argv, options);
    }
  });
});

//帮助信息
// program.on("--help", () => {
//   console.log("\nExamples:");
//   Reflect.ownKeys(mapActions).forEach((action) => {
//     mapActions[action].examples.forEach((example) => {
//       console.log(`  ${example}`);
//     });
//   });
// });

// 覆盖默认帮助信息
program.helpInformation = function () {
  let maxLength = 0;
  let helpInfo = `
用法: ${program.name()} [选项] [命令]

选项:
  -V, --version   输出版本号
  -h, --help      显示帮助信息

命令:
`;

  // 计算最大长度并生成命令和选项的帮助信息
  const commandHelp = [];
  Reflect.ownKeys(mapActions).forEach((action) => {
    const { alias, description, options } = mapActions[action];
    if (action !== "*") {
      const command = `${action}|${alias}`;
      const commandLength = command.length;
      if (commandLength > maxLength) {
        maxLength = commandLength;
      }
      commandHelp.push({ command, description: description, isOption: false });

      if (options) {
        options.forEach((item) => {
          const optionLength = item.flag.length;
          if (optionLength > maxLength) {
            maxLength = optionLength;
          }
          commandHelp.push({ command: item.flag, description: item.description, isOption: true });
        });
      }
    }
  });

  // 格式化输出命令和选项
  commandHelp.forEach((item) => {
    const padding = " ".repeat(maxLength - item.command.length);
    const indent = item.isOption ? "    " : "  "; // 选项行多一格缩进
    helpInfo += `${indent}${item.command}${padding}  ${item.description}\n`;
  });

  helpInfo += `
示例:
`;
  Reflect.ownKeys(mapActions).forEach((action) => {
    if (action !== "*") {
      mapActions[action].examples.forEach((example) => {
        helpInfo += `  ${example}\n`;
      });
    }
  });

  return helpInfo;
};

const { name, version } = packageConfig;

//解析命令
program.name(name).version(version).parse(process.argv);
