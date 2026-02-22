import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase Environment Variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.log("🛠️ 用法: npx tsx scripts/set-admin.ts <用户邮箱>");
        process.exit(1);
    }

    // Check if profile exists
    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

    if (fetchError || !profile) {
        console.error(`❌ 未能找到邮箱为 ${email} 的用户，请确保该用户至少注册或尝试登录过一次。`);
        process.exit(1);
    }

    // Update role to admin
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('email', email);

    if (updateError) {
        console.error(`❌ 更新管理员权限失败:`, updateError);
    } else {
        console.log(`✅ 成功！已将邮箱为 ${email} 的用户权限提升为【超级管理员 Admin】。`);
    }
}

main();
