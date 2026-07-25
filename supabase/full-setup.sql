-- ======== SCHMA + SEED (ملف واحد) ========

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text default '',
  avatar_url text default '',
  role text default 'reader' check (role in ('reader', 'writer', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Articles table
create table public.articles (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null,
  excerpt text default '',
  section text not null check (section in ('شعر', 'قصة', 'نثر', 'مقالات', 'تأملات')),
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null default 'مجهول',
  status text default 'draft' check (status in ('draft', 'pending', 'published', 'rejected')),
  read_time text default '3 دقائق',
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Comments table
create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid references public.articles(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Bookmarks table
create table public.bookmarks (
  user_id uuid references public.profiles(id) on delete cascade,
  article_id uuid references public.articles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, article_id)
);

-- Likes table
create table public.likes (
  user_id uuid references public.profiles(id) on delete cascade,
  article_id uuid references public.articles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, article_id)
);

-- Indexes
create index idx_articles_section on public.articles(section);
create index idx_articles_status on public.articles(status);
create index idx_articles_author_id on public.articles(author_id);
create index idx_articles_published_at on public.articles(published_at desc);
create index idx_comments_article_id on public.comments(article_id);
create index idx_bookmarks_user_id on public.bookmarks(user_id);
create index idx_likes_article_id on public.likes(article_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.comments enable row level security;
alter table public.bookmarks enable row level security;
alter table public.likes enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Articles policies
create policy "Published articles are viewable by everyone" on public.articles for select using (status = 'published' or auth.uid() = author_id);
create policy "Authenticated users can insert articles" on public.articles for insert with check (auth.uid() = author_id);
create policy "Users can update own articles" on public.articles for update using (auth.uid() = author_id);
create policy "Admins can update any article" on public.articles for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can delete any article" on public.articles for delete using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Comments policies
create policy "Comments are viewable by everyone" on public.comments for select using (true);
create policy "Authenticated users can insert comments" on public.comments for insert with check (auth.uid() = user_id or user_id is null);
create policy "Users can delete own comments" on public.comments for delete using (auth.uid() = user_id);
create policy "Admins can delete any comment" on public.comments for delete using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Bookmarks policies
create policy "Users can view own bookmarks" on public.bookmarks for select using (auth.uid() = user_id);
create policy "Users can insert own bookmarks" on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "Users can delete own bookmarks" on public.bookmarks for delete using (auth.uid() = user_id);

-- Likes policies
create policy "Likes are viewable by everyone" on public.likes for select using (true);
create policy "Users can insert own likes" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can delete own likes" on public.likes for delete using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'reader'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ======== SEED DATA ========

INSERT INTO articles (title, content, excerpt, section, author_name, status, read_time, published_at, created_at) VALUES
('النسخ والواقع', 'يا ترى أي جزءٍ من الواقع كنتُ أضيفه إليه من عندي حتى بدا مختلفاً؟ مجرد كلمة مضطربة. تفترض وجود ثالث! بينما الخراب الحقيقي لا يحتاج إلا إلى اثنين، وإلى تشابهٍ واحدٍ أكثر مما ينبغي.

فالنسخ هنا لا يكن يوما ليقتل الأصل. وإنما وجد وفقط ليكشف أن الأصل لم يكن أصلاً، يوما! وانما مجرد ترتيب بحت لمصادفات لم نكن لنخترها يوما لو لا عطسة الإله. والمصادفات هنا، كما يبدو، لا تعترف بملكية أحد.. في النهاية، فهي لا تُهزم الأشياء لأن غيرها أقوى. وانما حين تفقد تلك الأشياء سبب استثنائيتها.. حينها ولا شك ان تهزم.

ولهذا لم يكن هناك شيء يدعو للغرابة بقدر التساؤل، حتى بدا لي وبشكل هادئ قانونٌ كوني يسقط امامي. عندها، لم تعد المشكلة في الكلمات. بل في سهولة تكرارها.. بربك! الكلمات تُستنسخ؟ الايقاع.. وكيف؟', 'يا ترى أي جزءٍ من الواقع كنتُ أضيفه إليه من عندي حتى بدا مختلفاً؟ مجرد كلمة مضطربة. تفترض وجود ثالث!', 'نثر', 'السّدفة', 'published', '8 دقائق', NOW(), '2026-07-25'),
('حوار الصمت', 'جلسا وجهاً لوجه على طاولةٍ لم تَرَ قط كوباً يحتوي على محتوى واحد. كان هو يحمل فنجان القهوة بيده اليمنى، وهي تحمل الشاي بيدها اليسرى. لم يكن بينهما حوارٌ يذكر، سوى ذلك النقر الخفيف الذي يصنعه الإصبع على حافة الكوب.

قال: أنتِ لا تتكلمين كثيراً هذه الأيام.
فأجابت: وأنتَ لا تسأل كثيراً هذه الأيام.

فابتسم ابتسامةً مفاجئة، وقال: ربما لأنني أعرف أن الإجابة لن تُرضيني.
فردّت: ربما لأنني أعرف أن السؤال لن يُرضيك.

ثم سكتا. وعاد الصمت ليملأ المكان بينهما، ليس بصمتٍ يُخيف، بل بصمتٍ يُشبه ذلك النوع من الراحة التي لا نحتاج إلى تفسير لها.', 'جلسا على طاولةٍ لم تَرَ قط كوباً يحتوي على محتوى واحد... كان الصمت بينهما يُشبه نوعاً من الراحة.', 'قصة', 'السّدفة', 'published', '4 دقائق', NOW(), '2026-07-20'),
('على حافة النبرة', 'الكلمة حين تخرج من الفم لا تعود ملكاً لمن قالها. تصبح حراً، تمشي في الأسماع كما تشاء. وقد تصل إلى معنى لم يقصده القائل قط. وهذا جمال اللغة أنفسها: أنها تخون صاحبها في اللحظة التي يظن فيها أنه يملكها.

النبرة، في الشعر العربي المعاصر، لم تعد أداة تصوير فحسب. بل أصبحت هي الصورة ذاتها. فالشاعر لا يصف الشوق فحسب؛ بل يجعل الكلمة نفسها تشتاق. لا يرسم الحزن؛ بل يجعل الحرف يذوب بين السطور.', 'الكلمة حين تخرج من الفم لا تعود ملكاً لمن قالها. تصبح حراً، تمشي في الأسماع كما تشاء.', 'مقالات', 'السّدفة', 'published', '5 دقائق', NOW(), '2026-07-15'),
('أيقونات الفراغ', 'لا أعرف متى بدأ الصمت يتحدث إليّ. ربما حين أدركت أن كل جملةٍ كتبتها كانت في الحقيقة سؤالاً متنكراً. ربما حين فهمت أن الكتابة ليست خروجاً من العزلة، بل دخولاً في نوعٍ آخر منها.

في كل مرةٍ أفتح فيها دفتري، أجد نفسي أمام فراغٍ أبيض. وأعلم أن ما سأكتبه لن يكون إلا محاولةً أخرى لسدّ ذلك الفراغ. لكن الفراغ، هنا، ليس نقيصة. بل هو شرط الكتابة ذاتها.', 'لا أعرف متى بدأ الصمت يتحدث إليّ. ربما حين أدركت أن كل جملةٍ كتبتها كانت في الحقيقة سؤالاً متنكراً.', 'تأملات', 'السّدفة', 'published', '4 دقائق', NOW(), '2026-07-10'),
('مطر من ورق', 'كان المطر يهطل على المدينة كما يهطل الندم على ضميرٍ نائم. بلا صوت، بلا ضجة، فقط انحدارٌ هادئ للسوائل على الأسطح الزجاجية.

جلس في مقهىٍ صغير على زاوية شارعٍ لا يحمل اسماً. وطلب قهوةً سادة، كما يطلب الرجل أن يُنسى اسمه. ونظر عبر النافذة إلى الخارج، حيث كان المشاة يهرولون تحت مظلاتهم كنملٍ تحمل على ظهورها أحلاماً مبللة.', 'كان المطر يهطل على المدينة كما يهطل الندم على ضميرٍ نائم. بلا صوت، بلا ضجة.', 'قصة', 'السّدفة', 'published', '3 دقائق', NOW(), '2026-07-05'),
('نبض الأول', 'أنا الأول.
قبل أن يُولد أي حرف، كنتُ أنا.
أنا الذي يسكن بين الهمزة والياء، بين الشدة والسكينة. أنا الذي يجعل الكلمة تنحو نحو المعنى دون أن تعرف كيف.

لا تسألوني عن صوتي. فصوتي ليس صوتاً. بل هو الغياب الذي يجعل الحضور ممكناً. أنا الصمت الذي قبل الصوت، والنوم الذي قبل الحلم.', 'أنا الأول. قبل أن يُولد أي حرف، كنتُ أنا. أنا الذي يسكن بين الهمزة والياء.', 'شعر', 'السّدفة', 'published', '3 دقائق', NOW(), '2026-06-30'),
('كيف نقرأ ما لم يُكتب', 'القراءة الفعلية ليست في النص. بل فيما حوله. في الفاصلة التي تأخرت، في الكلمة التي غابت، في السطر الذي فُتح ثم أُغلق دون أن يقول شيئاً.

نحن لا نقرأ كلام المؤلف فحسب. بل نقرأ صمتَه، تردُّده، اختياراته فيما لم يقل. وهذه هي القراءة الأعمق: قراءة الغياب.', 'القراءة الفعلية ليست في النص. بل فيما حوله. في الفاصلة التي تأخرت، في الكلمة التي غابت.', 'مقالات', 'السّدفة', 'published', '4 دقائق', NOW(), '2026-06-25'),
('ذاكرة الماء', 'الماء يتذكر كل شيء. يتذكر الطريق الذي قطعه من الغيوم إلى النهر، ومن النهر إلى البحر. يتذكر كل ورقة لمسها، وكل حجر مرّ به، وكل شفة رُويت.

لكنه يحمل ذاكرته بخفةٍ لا تُشبه إلا النسيان. يجري وكأن شيئاً لم يكن. ينسى وكأن كل شيء كان.

ربما كان هذا هو الدرس الذي يُعلّمُنا الماء: أن تحمل الذاكرة لا يعني أن تمشي بثقلها. بل أن تمشي بها كما يمشي النهر.. بهدوء، بانسياب، بلا ضجيج.', 'الماء يتذكر كل شيء. يتذكر الطريق الذي قطعه من الغيوم إلى النهر. لكنه يحمل ذاكرته بخفةٍ لا تُشبه إلا النسيان.', 'تأملات', 'السّدفة', 'published', '3 دقائق', NOW(), '2026-06-20');
