import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    const { data, error } = await supabase.storage.createBucket('resource_images', { public: true });
    if (error && !error.message.includes('already exists')) {
        console.error('Failed to create bucket:', error.message);
    } else {
        console.log('Bucket "resource_images" is ready.');
    }
}
main();
