# 疑难杂症处理：GitHub 鉴权 403 被拒 与 Token 重置手册

在日常开发推送本地文件时，如果抛出以 `403` 为主的 Permission Denied（系统级别的远端校验越权），这通常都是由 Mac 本地的 Keychain 密码钥匙串遗留导致的缓存串台或是本地身份凭证失效。

## 场景：旧账号冲突报错
```
remote: Permission to VeryUbuntu/K12EducationPortal.git denied to neopaoe.
致命错误：无法访问 'https://github.com/VeryUbuntu/K12EducationPortal.git/'：The requested URL returned error: 403
```

## 解决与重建通行线路的终极指南

GitHub 的 API 要求不可再使用主账户明文密码执行强推送（Push）。所有的授权核心均需换置为 `Personal Access Token (PAT)`。

**1. 清洗系统层级的本地缓存：**
确保 Mac 先“失忆”，不拿错以前的错误号：
```bash
# 全局擦除保存好的 github.com 旧认证信息
printf "protocol=https\nhost=github.com\n" | git credential-osxkeychain erase
```

**2. 颁发具有顶级权限的 Token：**
*   去本人的 Github setting -> Developer settings -> Personal access tokens (classic)。
*   点击 `Generate new token`，命名并**绝对勾选 `repo` 全部权限框架**。
*   拿到并必须暂时复制粘贴好那串一次性的 `ghp_xxxx` 代码。

**3. 在终端利用 Token 作为超级护照推送：**
利用安全链接骨架强行打通链接（这一步是万金油）：
```bash
# 修改原本的推流源网址
git remote set-url origin https://github.com/VeryUbuntu/K12EducationPortal.git

# 强行推送主线代码（覆盖可能存在的云端系统冲突文件）
git push -f -u origin main
```
在出现 `Username` 和 `Password` 请求确认框或系统指纹授权时。不要填写的你的邮箱原设登录密码！**请用你复制出来的 `ghp_` 令牌粘贴替代作为「Password」。**

只要一次全绿成功推送到底，该 Token 就会永驻系统的内源钥匙串中。
后续的推送开发命令，都只需要如释重负的两个词汇代码即可：
```bash
git add .
git commit -m "update"
git push
```
