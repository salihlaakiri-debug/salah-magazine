import Link from "next/link";
import { SearchIcon } from "@/components/Icons";

export default function NotFound() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center hero-gradient overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden sm:block">
        <div className="absolute top-[15%] right-[10%] w-64 h-64 rounded-full bg-accent/[0.03] animate-drift blur-sm" />
        <div className="absolute bottom-[20%] left-[8%] w-48 h-48 rounded-full bg-accent/[0.04] animate-drift blur-sm" style={{ animationDelay: "-7s" }} />
        <div className="absolute top-[40%] left-[50%] w-20 h-20 rounded-full border border-accent/[0.06] animate-drift" style={{ animationDelay: "-12s" }} />
        <div className="absolute inset-0 mesh-gradient opacity-60" />
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6">
        <div className="mb-8 flex justify-center animate-fade-in-up">
          <div className="w-28 h-28 rounded-full bg-accent/10 flex items-center justify-center">
            <SearchIcon size={48} className="text-accent/40" />
          </div>
        </div>

        <h1
          className="text-[8rem] sm:text-[10rem] lg:text-[12rem] font-black font-[var(--font-heading)] leading-none mb-4 animate-fade-in-up delay-100 opacity-0"
          style={{
            background: "linear-gradient(135deg, var(--accent-dark), var(--accent), var(--accent-light))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 4px 24px var(--glow))",
          }}
        >
          404
        </h1>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-[var(--font-heading)] mb-3 animate-fade-in-up delay-200 opacity-0">
          الصفحة غير موجودة
        </h2>

        <p className="text-text-muted text-sm sm:text-base mb-8 sm:mb-10 animate-fade-in-up delay-300 opacity-0">
          يبدو أنك ضلّت الطريق
        </p>

        <div className="animate-fade-in-up delay-400 opacity-0">
          <Link
            href="/"
            className="inline-flex px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-accent text-white font-medium hover:bg-accent-dark transition-all duration-300 shadow-xl shadow-accent/15 hover:shadow-accent/25 hover:shadow-2xl text-sm btn-ripple active:scale-95"
          >
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </section>
  );
}
