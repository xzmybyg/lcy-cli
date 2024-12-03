const { Command } = require("commander");
const path = require("path");

const { mapActions } = require("./util/actions");
const packageConfig = require("../package.json");


//创建命令
const program = new Command();

//映射命令
Reflect.ownKeys(mapActions).forEach((action) => {
  program
    .command(action)
    .alias(mapActions[action].alias)
    .description(mapActions[action].description)
    .action(() => {
      if (action === "*") {
        console.log(mapActions[action].description);
      } else {
        require(path.join(__dirname,'command', action))(...process.argv.slice(3));
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
program.helpInformation = function() {
  let helpInfo = `
用法: ${program.name()} [选项] [命令]

选项:
  -V, --version   输出版本号
  -h, --help      显示帮助信息

命令:
`;
  Reflect.ownKeys(mapActions).forEach((action) => {
    if (action !== "*") {
      helpInfo += `  ${action}|${mapActions[action].alias}       ${mapActions[action].description}\n`;
    }
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

const { name,version } = packageConfig;

//解析命令
program.name(name).version(version).parse(process.argv);