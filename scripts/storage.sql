insert into storage.buckets (id, name, public) values ('resource_images', 'resource_images', true) on conflict do nothing;

create policy "Images are publicly accessible" on storage.objects for select using (bucket_id = 'resource_images');
create policy "Anyone can upload images" on storage.objects for insert with check (bucket_id = 'resource_images');
create policy "Anyone can update images" on storage.objects for update with check (bucket_id = 'resource_images');
