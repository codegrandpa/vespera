# VESPERA 晚调 — 项目说明

一个可部署到 GitHub Pages 的纯静态个人站点，包含**音乐**与**博客**两个模块，共享同一套「深夜唱片行」视觉体系（暗/亮双主题）。

## 目录结构

```
.
├── index.html        音乐模块首页（数据驱动）
├── blog.html         博客列表页
├── post.html         文章详情页（Markdown 渲染）
├── admin.html        管理台（全实体 CRUD，GitHub API 在线提交）
├── assets/
│   ├── vespera.css   共享样式（暗/亮双主题变量）
│   └── vespera.js    共享脚本（主题切换 / 头部滚动 / 光标氛围 / 滚动显现 / Markdown 渲染）
└── data/
    ├── posts.json    博客数据库（文章）
    └── music.json    音乐数据库（专辑 / 曲目 / 歌单 / 流派 / 艺术家）
```

## 数据模型

- `data/posts.json`：`{ "posts": [ { id, title, date, tags[], excerpt, cover, content(Markdown), read } ] }`
- `data/music.json`：`{ "featured": { albumId }, "albums": [], "tracks": [], "playlists": [], "genres": [], "artists": [] }`
  - 专辑/歌单通过 `trackIds` 关联曲目；首页 Hero 由 `featured.albumId` 控制

## 操作步骤

### 本地预览

```bash
cd <项目目录>
python -m http.server 8300 --bind 127.0.0.1
# 打开 http://127.0.0.1:8300/
```

### 发布到 GitHub Pages

```bash
git add .
git commit -m "描述本次改动"
git push origin main        # 若报 SSL 证书错误，见下方「注意事项」
# 等待约 1 分钟，访问 https://<owner>.github.io/<repo>/
```

### 内容管理（两种方式）

- **方式 A（纯静态）**：本地直接编辑 `data/*.json`，`git push` 即发布，无需 Token。
- **方式 B（在线编辑）**：打开 `admin.html`，在「仓库连接」填入 Owner / Repo / Branch / Token（GitHub Personal Access Token，勾选 `repo` 权限，仅存于浏览器 localStorage），即可在网页上增删改文章、专辑、曲目、歌单、流派、艺术家，保存后自动 commit 回仓库。

## 注意事项

1. **JSON 必须严格合法**：字符串内禁止出现字面换行/制表符等控制字符，必须用 `\n` 转义。浏览器 `JSON.parse` 严格解析，非法 JSON 会导致整个页面脚本静默中断（曾因此导致管理台标签页不渲染）。修改后建议用 `node -e "JSON.parse(require('fs').readFileSync('data/posts.json','utf8'))"` 校验。
2. **Git SSL 证书问题**：本机 Git 全局配置 `http.sslCAInfo` 指向了不存在的路径（`E:/devsoftware/Git/...`，实际安装在 `D:/devsoftware/Git`）。推送时需临时指定：
   ```bash
   git -c http.sslCAInfo="D:/devsoftware/Git/mingw64/etc/ssl/certs/ca-bundle.crt" push origin main
   ```
   或修复全局配置：`git config --global http.sslCAInfo "D:/devsoftware/Git/mingw64/etc/ssl/certs/ca-bundle.crt"`
3. **缓存穿透**：所有数据请求已带 `?v=时间戳` 参数，避免浏览器命中旧缓存。若页面仍显示旧内容，按 Ctrl+F5 强制刷新。
4. **GitHub Pages 生效延迟**：每次 push 后约 1 分钟重新构建，期间访问的是旧版本。
5. **Token 安全**：管理台 Token 仅保存在浏览器 localStorage，不会上传到任何服务器；仓库公开只代表可读，写入权限仅归仓库所有者。
6. **图片资源**：封面图使用 `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=...&image_size=...` 文生图接口生成，`image_size` 可选 `square_hd / square / portrait_4_3 / portrait_16_9 / landscape_4_3 / landscape_16_9`。
7. **字体加载**：Google Fonts 在国内可能被墙，页面已同时引入 `fonts.loli.net` 镜像源兜底。