-- Seed minimal V1 data
insert into assessment_versions (id, title, is_published)
values ('v2026_02_pro_01', 'الإصدار المهني فبراير 2026', true)
on conflict (id) do nothing;

insert into items (version_id, text_ar, trait_key, facet_key, reverse_scored, weight)
values
('v2026_02_pro_01','أفضل التخطيط المسبق للمهام.','BF_C','organization',false,1),
('v2026_02_pro_01','أشعر بالطاقة في التفاعل الاجتماعي.','BF_E','social',false,1),
('v2026_02_pro_01','أميل لتجربة أفكار جديدة.','BF_O','innovation',false,1),
('v2026_02_pro_01','أتقبل ضغوط العمل بهدوء.','BF_N','stability',false,1),
('v2026_02_pro_01','أفضل الأعمال العملية الميدانية.','RI_R','field',false,1),
('v2026_02_pro_01','أستمتع بتحليل البيانات.','RI_I','analysis',false,1),
('v2026_02_pro_01','أحب الإبداع الفني في العمل.','RI_A','creative',false,1),
('v2026_02_pro_01','أحب مساعدة الآخرين.','RI_S','helping',false,1),
('v2026_02_pro_01','أفضل قيادة المبادرات.','RI_E','leadership',false,1),
('v2026_02_pro_01','أهتم بالتفاصيل والإجراءات.','RI_C','details',false,1)
on conflict do nothing;

insert into occupations (title_ar, sector_tags, riasec_vector, stress_level, structure_level, social_level)
values
('محلل أعمال', '{تقنية,استشارات}', '{20,90,30,35,50,80}', 'Medium', 'High', 'Medium'),
('مصمم تجربة مستخدم', '{تقنية,تصميم}', '{10,45,85,50,35,30}', 'Medium', 'Medium', 'Medium'),
('مدير مشروع', '{إدارة}', '{25,55,30,40,85,70}', 'High', 'High', 'High'),
('أخصائي موارد بشرية', '{موارد بشرية}', '{15,30,25,85,60,55}', 'Medium', 'Medium', 'High'),
('محاسب', '{مالية}', '{10,35,15,20,30,95}', 'Medium', 'High', 'Low'),
('مهندس برمجيات', '{تقنية}', '{35,88,45,20,40,60}', 'High', 'High', 'Low'),
('باحث سوق', '{تسويق}', '{20,80,40,50,55,45}', 'Medium', 'Medium', 'Medium'),
('مسؤول جودة', '{صناعة}', '{40,55,20,30,35,90}', 'Medium', 'High', 'Low'),
('مستشار مهني', '{تعليم}', '{15,45,35,92,50,40}', 'Low', 'Medium', 'High'),
('أخصائي تطوير منتجات', '{تقنية}', '{25,75,70,40,55,45}', 'High', 'Medium', 'Medium')
on conflict do nothing;
