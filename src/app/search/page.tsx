import Link from "next/link";
import SearchBar from "@/components/SearchBar";

export const metadata = {
  title: "بحث | مجلة صلاح",
};

export default function SearchPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <nav className="text-sm text-text-muted mb-10">
        <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">بحث</span>
      </nav>

      <div className="flex items-center gap-3 mb-10">
        <div className="w-1 h-10 rounded-full bg-accent" />
        <h1 className="text-3xl sm:text-4xl font-bold font-[var(--font-heading)]">
          بحث
        </h1>
      </div>

      <SearchBar />
    </div>
  );
}
