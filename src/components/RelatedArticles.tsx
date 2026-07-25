import { Article } from "@/lib/types";
import { articles } from "@/lib/data";
import WorkCard from "./WorkCard";

export default function RelatedArticles({ current }: { current: Article }) {
  const related = articles
    .filter((a) => a.id !== current.id && a.section === current.section)
    .slice(0, 2);

  if (related.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="section-divider mb-10" />
      <h3 className="text-xl font-bold font-[var(--font-heading)] mb-6">
        أعمال ذات صلة
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {related.map((a) => (
          <WorkCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}
