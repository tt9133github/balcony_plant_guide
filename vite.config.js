import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages 项目站点需要 /仓库名/；本地开发和自定义域名使用 /。
  base: process.env.GITHUB_ACTIONS
    ? `/${process.env.GITHUB_REPOSITORY.split("/")[1]}/`
    : "/",
});
