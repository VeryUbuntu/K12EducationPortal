# K12EducationPortal (SXU.com) 生产环境服务器部署指南

本文档记录了将本 Next.js 项目部署到真实的 VPS 服务器（Ubuntu/Debian 体系下）并使用 Nginx 进行反向代理的标准操作流程。

## 第一阶段：代码拉取与预编译构建 (Build)

在服务器上获取代码并安装依赖后，**绝不可以使用 `npm run dev` 运行生产环境**。
必须使用 Next.js 提供的预渲染机制将代码深度优化：

```bash
# 进入项目根目录
cd /path/to/your/sxu.com

# 安装依赖模块
npm install

# 利用 Next.js 引擎打包进行生产环境构建
npm run build
```

## 第二阶段：守护进程管理器 (PM2) 接管主站程序

使用 PM2 作为守护进程引擎。它能确保在 Node 服务崩溃或服务器因维护发生意外重启时，第一时间瞬间复活并挂载服务，确保网站始终在线。

**1. 全局安装使用 PM2：**
```bash
# 全局安装守护进程包
npm install -g pm2
```

**2. 启动服务并锁定状态：**
```bash
# 以后台常驻的形式启动打包好的 Next.js 服务，并将进程命名为 sxu-portal
pm2 start npm --name "sxu-portal" -- start

# 如果需要 PM2 伴随服务器开机自启动：
pm2 startup
pm2 save
```

## 第三阶段：Nginx 反向代理配置与安全分发

我们的主站应用现在潜在大门后（默认在本地监听 `localhost:3000`）。我们需要配置 Nginx 站在公网最前锋，接收 80 端口（HTTP）及 443 端口（HTTPS），再将其秘密转发给 `sxu-portal` 处理。

**示例配置文件结构：**
（通常保存在 `/etc/nginx/sites-available/sxu.com`，随后软链到 `sites-enabled` 目录）

```nginx
server {
    listen 80;
    server_name sxu.com www.sxu.com;

    # 这里可以配置让 HTTP 默认重定向至 HTTPS (推荐使用 Certbot 等自动获取证书)
    # return 301 https://$host$request_uri;

    location / {
        proxy_pass http://127.0.0.1:3000; # 将公网用户的请求直接代理给 Next.js 引擎
        
        # 以下是必备的关键代理请求头配置，防止 React 丢失真实客户端状态
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

配置保存无误后，通过 `sudo nginx -t` 测试并 `sudo systemctl restart nginx` 重启即可上线全链路。

---

*部署建议：等回到家登录 VPS 时，请严格照着上述步骤进行逐步排查与上线，一切就绪即可。*
