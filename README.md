# VESPERA 晚调 · 深夜唱片行

一个可部署到 **GitHub Pages** 的纯静态个人站点：**音乐** + **博客** 双模块，共享「深夜唱片行」的暗/亮双主题视觉。数据全部由 `data/*.json` 驱动，无后端、无构建。

面向访客与使用者的说明在这里；协作细节与维护坑点见 [AGENTS.md](AGENTS.md)。

## 特性

- 🎵 **音乐唱片行**：本周精选 / 正在流行 / 流派货架 / 情绪歌单 / 驻店艺术家
- 🎧 **可播放的播放器**：真实 `<audio>` 内核 —— 播放、暂停、拖拽进度、音量、上一首/下一首、随机与单曲循环、空格快捷键
- ✍️ **博客**：Markdown 文章列表与详情，按日期倒序，支持上下篇导航
- 🎛️ **管理台**（`admin.html`）：文章 / 专辑 / 曲目 / 歌单 / 流派 / 艺术家全实体 CRUD，通过 GitHub API 在线提交
- 🌗 **暗/亮双主题**：记住偏好、跟随系统、首屏无闪烁
- 📦 **零依赖**：纯 HTML / CSS / JS，JSON 即数据库

## 目录结构

```
.
├── index.html        音乐模块首页（数据驱动 + 播放器）
├── blog.html         博客列表页
├── post.html         文章详情页（Markdown 渲染）
├── admin.html        管理台（全实体 CRUD，GitHub API 在线提交）
├── assets/
│   ├── vespera.css   共享样式（暗/亮双主题变量）
│   └── vespera.js    共享脚本（主题 / 头部 / 光标 / 滚动 / Markdown）
├── data/
│   ├── posts.json    博客数据库（文章）
│   └── music.json    音乐数据库（专辑 / 曲目 / 歌单 / 流派 / 艺术家）
└── audio/            可选：提交到仓库的音频文件目录
```

## 快速开始（本地预览）

```bash
cd <项目目录>
python -m http.server 8300 --bind 127.0.0.1
# 打开 http://127.0.0.1:8300/
```

## 数据模型

- `data/posts.json`：`{ "posts": [ { id, title, date, tags[], excerpt, cover, content(Markdown), read } ] }`
- `data/music.json`：`{ "featured": { albumId }, "albums": [], "tracks": [], "playlists": [], "genres": [], "artists": [] }`
  - 专辑 / 歌单通过 `trackIds` 关联曲目；首页 Hero 由 `featured.albumId` 控制。
  - 曲目 `tracks[].src`：**音频源**（可选）。可填：
    - 相对仓库路径：`audio/xxx.mp3`（文件放在仓库 `audio/` 目录）
    - 外部直链：`https://.../track.mp3`（CDN / 对象存储等）
    - 留空：表示暂无音源，首页该曲目会置灰提示
    - 运行时会话内也可能被本机浏览器 IndexedDB 中上传的音频（`blob:` URL）覆盖，见下文。

## 上传自己的音乐

方式 A（纯静态，无需 Token）：

1. 把音频文件放入仓库 `audio/` 目录（如 `audio/my-track.mp3`）。
2. 编辑 `data/music.json`，给对应曲目加 `"src": "audio/my-track.mp3"`。
3. `git push`，约 1 分钟后线上生效。

方式 B（管理台在线，推荐）：

1. 打开 `admin.html`，在「仓库连接」填入 Owner / Repo / Branch / Token（GitHub Personal Access Token，勾选 `repo` 权限；Token 仅存于浏览器 localStorage，不会上传到任何服务器）。
2. 切到「曲目」标签页，新建或编辑一条曲目。
3. 「音频文件」字段有两种填法：
   - **上传本地文件**：保存时音频会存入**本机浏览器**（IndexedDB，立即生效、刷新不丢），并尝试同步到仓库 `audio/` 目录（≤ 5MB）。同步成功则全站可播；同步失败（过大或网络问题）则仅本机能播，控制台会给出提示。
   - **粘贴外部链接**：直接填 `https://...` 直链，保存后全站可见。
4. 点「保存并提交」，GitHub Pages 约 1 分钟后更新。

> 体积建议：GitHub Contents API 对 base64 上传的体积敏感，**超过 5MB 的音频请使用外部对象存储（R2 / OSS / S3 / Supabase Storage 等）直链**，或走方式 A 手动放到仓库。超大文件建议转码为 128–192kbps 的 MP3 再传。

## 发布到 GitHub Pages

```bash
git add .
git commit -m "描述本次改动"
git push origin main        # 若报 SSL 证书错误，见下
# 等待约 1 分钟，访问 https://<owner>.github.io/<repo>/
```

若本机 Git 报 SSL 证书路径错误，临时指定证书：

```bash
git -c http.sslCAInfo="D:/devsoftware/Git/mingw64/etc/ssl/certs/ca-bundle.crt" push origin main
```

## 注意事项

1. **JSON 必须严格合法**：字符串内禁止出现字面换行 / 制表符等控制字符，必须用 `\n` 转义。浏览器 `JSON.parse` 严格解析，非法 JSON 会导致页面脚本静默中断。
2. **缓存穿透**：所有数据请求已带 `?v=时间戳` 参数；资源文件带 `?v=版本号`。若仍显示旧内容，按 Ctrl+F5 强制刷新。
3. **Pages 生效延迟**：每次 push 后约 1 分钟重新构建，期间访问的是旧版本。
4. **Token 安全**：管理台 Token 仅保存在浏览器 localStorage；仓库公开只代表可读，写入权限仅归仓库所有者。
5. **封面图**使用 `trae-api-cn.mchost.guru` 文生图接口生成；Google Fonts 在国内可能被墙，已同时引入 `fonts.loli.net` 镜像兜底。

## 许可

© 2026 VESPERA 晚调 · 深夜唱片行 · 保留所有权利