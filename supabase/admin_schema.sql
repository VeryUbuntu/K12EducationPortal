-- 1. 创建首页轮播图管理表
create table public.carousel_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text not null,
  link_url text not null,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.carousel_slides enable row level security;
create policy "Slides are viewable by everyone" on public.carousel_slides for select using (true);
create policy "Admins can do everything on slides" on public.carousel_slides for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 2. 创建简单的站点访问记录表
create table public.site_visits (
  id uuid primary key default gen_random_uuid(),
  visited_at date default CURRENT_DATE not null,
  page_path text not null,
  views_count integer default 1,
  unique (visited_at, page_path)
);

-- RLS
alter table public.site_visits enable row level security;
-- 允许所有用户（包含匿名）查看和更新/插入统计
create policy "Anyone can insert tracking" on public.site_visits for insert with check (true);
create policy "Anyone can update tracking" on public.site_visits for update using (true);
create policy "Anyone can select tracking" on public.site_visits for select using (true);

-- 3. （可选）如果你已经注册了账号，想要变成管理员，可以运行下面这句：
-- update public.profiles set role = 'admin' where email = '你的注册邮箱';

-- 4. 插入一些初始轮播图
insert into public.carousel_slides (title, description, image_url, link_url, sort_order)
values 
  ('欢迎来到 SXU.com', '专为中小学生打造的高效个人学习站。', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2000&auto=format&fit=crop', '/', 1),
  ('小学奥数进阶指南', '全面提升逻辑思维，探索数学的独特魅力。', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=2000&auto=format&fit=crop', '/primary/math', 2);
