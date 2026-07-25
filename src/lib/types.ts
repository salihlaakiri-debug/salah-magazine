export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  section: Section;
  date: string;
  author: string;
  author_id?: string;
  author_name?: string;
  readTime: string;
  status?: "draft" | "pending" | "published" | "rejected";
  published_at?: string;
  created_at?: string;
}

export type Section = "شعر" | "قصة" | "نثر" | "مقالات" | "تأملات";

export interface Comment {
  id: string;
  articleId: string;
  user_id?: string;
  name: string;
  text: string;
  date: string;
}

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  role: "reader" | "writer" | "admin";
  created_at: string;
}

export interface SectionInfo {
  slug: string;
  name: Section;
  description: string;
  color: string;
}

export const SECTIONS: SectionInfo[] = [
  {
    slug: "poetry",
    name: "شعر",
    description: " قصائد من الروح، تمشي على حافة الصمت والصدى",
    color: "from-amber-500 to-orange-600",
  },
  {
    slug: "story",
    name: "قصة",
    description: "حكايات تولد من تفاصيل يومية وتموت في ذاكرة القارئ",
    color: "from-blue-500 to-indigo-600",
  },
  {
    slug: "prose",
    name: "نثر",
    description: "كتابة بلا هيكل، لكنها تملك عموداً فقرياً من المعنى",
    color: "from-emerald-500 to-teal-600",
  },
  {
    slug: "articles",
    name: "مقالات",
    description: "تأملات في اللغة والأدب والحياة",
    color: "from-purple-500 to-violet-600",
  },
  {
    slug: "reflections",
    name: "تأملات",
    description: "لحظات صمت يولد منها السؤال",
    color: "from-rose-500 to-pink-600",
  },
];
