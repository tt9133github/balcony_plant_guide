# 成都阳台花园 · Balcony Garden

一个面向个人阳台植物管理的轻量级中文网页，使用 Vite + 原生 JavaScript + CSS。

## 功能

- 成都实时天气和未来 7 天预报（Open-Meteo）。
- 八种植物的照片、属性、光照与浇水建议。
- 植物详情与逐盆养护记录。
- 养护记录保存在当前浏览器 `localStorage`。
- 支持导出 / 导入 JSON 备份。
- 手机和桌面浏览器自适应布局。

## 本地运行

需要 Node.js 20.19+ 或 22.12+。

```bash
npm install
npm run dev
```

打开终端输出的本地地址，通常是 `http://localhost:5173`。

## 构建与预览

```bash
npm run build
npm run preview
```

构建产物位于 `dist/`。

## 修改自己的阳台环境

编辑 `src/data/settings.js`：

- `location`：城市名、天气坐标和时区。
- `balcony`：朝向、直射光情况、光照条件。

目前使用成都城市级坐标，不记录家庭精确地址或楼层。

## 修改植物资料

编辑 `src/data/plants.js`。每种植物是一条对象记录，图片放在：

```text
public/images/plants/
```

新增植物时：
1. 将照片放入 `public/images/plants/`。
2. 在 `plants.js` 增加植物对象。
3. 图片路径填写 `/images/plants/文件名.webp`。

部分植物的品种名称是根据照片外观推测的，页面已标注不确定项；如获得花店标签信息，可更新拉丁学名。

## 天气接口

天气由 Open-Meteo Forecast API 提供。免费 API 适用于非商业使用；请遵守其服务条款和署名要求。天气缓存 1 小时，接口失败时会尝试展示最近一次缓存。

- API 文档：https://open-meteo.com/en/docs
- 服务说明：https://open-meteo.com/

天气仅用于环境参考，不能替代实际检查每盆植物的盆土湿度。

## 养护数据存储说明

养护记录保存在当前浏览器的 `localStorage`：
- 不会自动上传到服务器。
- 清除浏览器站点数据可能导致记录丢失。
- 更换设备或浏览器前，请使用页面中的“导出备份”功能。
- 可使用“导入备份”恢复 JSON 文件。

## GitHub Pages 部署

仓库已提供 `.github/workflows/deploy.yml`。将代码推送到 `main` 分支后，GitHub Actions 会构建并部署。

在 GitHub 仓库设置中：
1. 打开 **Settings → Pages**。
2. 将 **Build and deployment → Source** 设置为 **GitHub Actions**。
3. 查看 **Actions** 页面确认部署成功。

Vite 配置会根据 `GITHUB_REPOSITORY` 自动设置仓库子路径。

## 项目结构

```text
balcony-garden/
├── .github/workflows/deploy.yml
├── public/images/plants/
├── src/
│   ├── data/
│   │   ├── plants.js
│   │   └── settings.js
│   ├── services/
│   │   ├── storage.js
│   │   └── weather.js
│   ├── styles/main.css
│   └── main.js
├── index.html
├── package.json
└── vite.config.js
```

## 植物清单

1. 绣球花
2. 三角梅
3. 迷迭香
4. 蓝花鼠尾草
5. 鹤望兰（天堂鸟）
6. 蔓绿绒（Birkin）
7. 春羽（羽裂喜林芋）
8. 长寿花

## License

个人项目。照片为用户提供的植物实拍素材；如公开仓库，请确认你有权公开这些照片。
