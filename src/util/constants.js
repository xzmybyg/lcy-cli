// 定义依赖列表
const dependenciesMap = {
  "react-template": [
    { name: "axios", value: "axios" },
    { name: "antd", value: "antd" },
    { name: "react-router-dom", value: "react-router-dom" },
    { name: "zustand", value: "zustand" },
  ],
  "vue-template": [
    { name: "axios", value: "axios" },
    { name: "vue-router", value: "vue-router" },
    { name: "pinia", value: "pinia" },
    { name: "element-ui", value: "element-ui" },
  ],
  // 可以根据需要添加更多模板和依赖列表
};

module.exports = {
  dependenciesMap,
};
