# 跨域单点登录 (SSO) 融合架构指南

为满足在同一台 VPS 服务器上架设以 `sxu.com` 为核心主站，衍生并辐射出多个拥有相同子系统功能独立站点（如 `eduflow.sxu.com`）的生态互通体验，我们通过底层代码魔改支持了极简的**野生 SSO 模式**。

## 核心痛点与解决思路

通常每个站点的用户身份（Cookie/Token）都由于浏览器的同源安全策略，被死死锁在当下的域名下。主站登入拿到了令牌，切到 Eduflow 却又要重新输入邮箱密码，极其破坏产品体验。 

**解法**：当顶级域名完全一致时（所有站点都挂在 `.sxu.com` 之下），我们可以劫持 Supabase 生成通行 Cookie 的底层指令，强行将该身份证明升格为「通配符范围」可见的共享级凭证。

## 具体代码实现详情

本项目中修改了 Next.js 的服务端及客户端创建 Supabase 实例的核心函数（共三处文件：`src/lib/supabase/client.ts`、`server.ts`、`middleware.ts`）。

**以下是判断劫持的核心逻辑代码切片：**
```typescript
{
    // 强制设定为生产环境判断（脱离本地调试环境）
    const effectiveDomain = process.env.NODE_ENV === 'production' && !options.domain?.includes('localhost') 
        ? '.sxu.com'   // 核心机制：在域名前加上句帽「.」，这代表了它是全家桶通用的 Cookie！
        : options.domain; 
        
    // 最后写入客户端
    cookieStore.set(name, value, { ...options, domain: effectiveDomain });
}
```

## 拓展子应用 (Eduflow) 操作指南

借助上述底层魔法，为了让 `eduflow.sxu.com` 和主站达到 100% 同一账户数据共享体验，在部署子应用时请遵循：

1. **环境克隆**：让 Eduflow 的代码工程连接**与主站完全一致**的那个 Supabase Database（确保它们的 `NEXT_PUBLIC_SUPABASE_URL` 及其密钥都是同一个）。
2. **免登录衔接**：由于主站发放了一张带有 `.sxu.com` 的通配令牌，并在主站点击路由时一并携带给 Eduflow，因此只要 Eduflow 代码内部同样拥有标准的 `await supabase.auth.getUser()` 抓取代码，它就能自动顺滑地在后台静默验证，瞬时通过并越过拦截器进入内部。
3. **后台引导卡片**：在主站 `/admin/resources` 的统一后台里，你作为超管可以直接选择发布 `eduflow.sxu.com`，当做内部外挂应用推荐展示给学生。

实现真正的账号大一统体验。
