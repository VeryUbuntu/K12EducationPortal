import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Initialize Supabase. Replace with your actual project URL and SERVICE ROLE KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding stages...');
  const { data: stages, error: stagesError } = await supabase
    .from('stages')
    .upsert(
      [
        { id: 1, slug: 'primary', name: '小学部' },
        { id: 2, slug: 'junior', name: '初中部' },
        { id: 3, slug: 'senior', name: '高中部' },
      ],
      { onConflict: 'slug' }
    )
    .select();

  if (stagesError) {
    console.error('Error seeding stages:', stagesError);
    return;
  }

  console.log('Seeding subjects...');
  const subjectsData = [
    // Primary
    { stage_slug: 'primary', slug: 'chinese', name: '语文', icon_name: 'BookOpen' },
    { stage_slug: 'primary', slug: 'math', name: '数学', icon_name: 'Calculator' },
    { stage_slug: 'primary', slug: 'english', name: '英语', icon_name: 'Languages' },
    { stage_slug: 'primary', slug: 'science', name: '科学', icon_name: 'FlaskConical' },
    { stage_slug: 'primary', slug: 'comprehensive', name: '综合', icon_name: 'Library' },
    // Junior
    { stage_slug: 'junior', slug: 'chinese', name: '语文', icon_name: 'BookOpen' },
    { stage_slug: 'junior', slug: 'math', name: '数学', icon_name: 'Calculator' },
    { stage_slug: 'junior', slug: 'english', name: '英语', icon_name: 'Languages' },
    { stage_slug: 'junior', slug: 'physics', name: '物理', icon_name: 'Atom' },
    { stage_slug: 'junior', slug: 'chemistry', name: '化学', icon_name: 'Beaker' },
    { stage_slug: 'junior', slug: 'biology', name: '生物', icon_name: 'Dna' },
    { stage_slug: 'junior', slug: 'geography', name: '地理', icon_name: 'Globe' },
    { stage_slug: 'junior', slug: 'history', name: '历史', icon_name: 'Hourglass' },
    { stage_slug: 'junior', slug: 'politics', name: '政治', icon_name: 'Landmark' },
    { stage_slug: 'junior', slug: 'science', name: '科学', icon_name: 'FlaskConical' },
    { stage_slug: 'junior', slug: 'comprehensive', name: '综合', icon_name: 'Library' },
    { stage_slug: 'junior', slug: 'ai', name: 'AI', icon_name: 'Bot' },
    // Senior
    { stage_slug: 'senior', slug: 'chinese', name: '语文', icon_name: 'BookOpen' },
    { stage_slug: 'senior', slug: 'math', name: '数学', icon_name: 'Calculator' },
    { stage_slug: 'senior', slug: 'english', name: '英语', icon_name: 'Languages' },
    { stage_slug: 'senior', slug: 'physics', name: '物理', icon_name: 'Atom' },
    { stage_slug: 'senior', slug: 'chemistry', name: '化学', icon_name: 'Beaker' },
    { stage_slug: 'senior', slug: 'biology', name: '生物', icon_name: 'Dna' },
    { stage_slug: 'senior', slug: 'geography', name: '地理', icon_name: 'Globe' },
    { stage_slug: 'senior', slug: 'history', name: '历史', icon_name: 'Hourglass' },
    { stage_slug: 'senior', slug: 'politics', name: '政治', icon_name: 'Landmark' },
    { stage_slug: 'senior', slug: 'science', name: '科学', icon_name: 'FlaskConical' },
    { stage_slug: 'senior', slug: 'comprehensive', name: '综合', icon_name: 'Library' },
    { stage_slug: 'senior', slug: 'ai', name: 'AI', icon_name: 'Bot' },
  ];

  for (const subject of subjectsData) {
    const { error: subjectError } = await supabase
      .from('subjects')
      .upsert(subject, { onConflict: 'stage_slug,slug' });

    if (subjectError) console.error(`Error seeding ${subject.slug}:`, subjectError);
  }

  console.log('Seeding resources...');
  
  // Example for fetching math subject id in primary to associate
  const { data: mathSubject } = await supabase
    .from('subjects')
    .select('id')
    .eq('stage_slug', 'primary')
    .eq('slug', 'math')
    .single();

  if (mathSubject) {
    const resourcesData = [
      {
        subject_id: mathSubject.id,
        title: '小学奥数入门',
        description: '交互式奥数体验',
        type: 'web_app',
        url: 'https://example.com/math-app',
        is_featured: true,
        access_level: 'registered',
      },
      {
        subject_id: mathSubject.id,
        title: '基础四则运算题库',
        description: '免费计算题库',
        type: 'file',
        url: 'https://example.com/math.pdf',
        is_featured: false,
        access_level: 'public',
      },
      {
        subject_id: mathSubject.id,
        title: '数学学习网',
        description: '外部优质学习链接',
        type: 'link',
        url: 'https://example.com',
        is_featured: true,
        access_level: 'public',
      }
    ];

    for (const res of resourcesData) {
      const { error: resError } = await supabase
        .from('resources')
        .insert(res);
      // Suppress duplicate key errors if already seeded
      if (resError && !resError.message.includes('duplicate key value')) {
          console.error(`Error seeding resource ${res.title}:`, resError);
      }
    }
  }

  console.log('Seed completed!');
}

seed();
