"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import NewsletterSignup from "@/components/NewsletterSignup";
import { ArrowLeftIcon } from "@/components/Icons";
import { RootIcon, FeatherIcon, LightbulbIcon } from "@/components/ValueIcon";
import { supabase } from "@/lib/supabase";

const VALUES = [
  {
    title: "الأصالة",
    description: "نحافظ على جذور اللغة العربية ونكرّم تراثها الأدبي الغني بكل ما تحمله من معاني عميقة وجمال لفظي فريد.",
    icon: RootIcon,
  },
  {
    title: "الإبداع",
    description: "نفتح أبوابنا لأصوات جديدة وآفاق غير مطروقة، لأنّ كلّ صوتٍ صادق يستحقّ أن يُسمع.",
    icon: FeatherIcon,
  },
  {
    title: "التنوير",
    description: "نؤمن بالقوة المُحَوِّلة للأدب في تشكيل الوعي وإثراء الحوارات الفكرية والثقافية.",
    icon: LightbulbIcon,
  },
];

export default function AboutPage() {
  const [stats, setStats] = useState([
    { value: "0", label: "أعمال منشورة" },
    { value: "5", label: "أقسام أدبية" },
    { value: "0", label: "قارئ" },
  ]);

  useEffect(() => {
    async function loadStats() {
      const [{ count: articles }, { count: users }] = await Promise.all([
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      setStats([
        { value: `${articles || 0}+`, label: "أعمال منشورة" },
        { value: "5", label: "أقسام أدبية" },
        { value: `${users || 0}+`, label: "قارئ" },
      ]);
    }
    loadStats();
  }, []);
  return (
    <div className="min-h-screen">
      {/* ── BREADCRUMB ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        <nav className="text-sm text-text-muted">
          <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">من نحن</span>
        </nav>
      </div>

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium text-accent">مجلة أدبية عربية مستقلة</span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-[var(--font-heading)] mb-6">
            <span className="gradient-text">من نحن</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="editorial-line mx-auto mb-8" />
        </ScrollReveal>

        <ScrollReveal delay={250}>
          <p className="text-lg sm:text-xl text-foreground/70 leading-relaxed max-w-2xl mx-auto font-[var(--font-arabic)]">
            نحن لا نكتب لنُنسى. بل لنُتذكّر أننا كنا، وأننا سنبقى، في كل حرفٍ كتبناه يوماً.
          </p>
        </ScrollReveal>
      </section>

      {/* ── MISSION ── */}
      <section className="border-y border-border/30 bg-surface/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-8">
              <div className="editorial-line-lg" />
              <h2 className="text-xl sm:text-2xl font-bold font-[var(--font-heading)]">رسالتنا</h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <blockquote className="relative">
              <div className="absolute -top-6 -right-2 text-6xl text-accent/10 font-serif leading-none">&ldquo;</div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold font-[var(--font-heading)] leading-snug text-foreground/90 max-w-3xl">
                رسالتنا هي إحياء الكلمة العربية ونشر الأدب الرفيع
              </p>
              <div className="absolute -bottom-4 right-0 editorial-line" />
            </blockquote>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="mt-10 text-base sm:text-lg text-foreground/60 leading-relaxed max-w-2xl">
              مجلة أدبية رقمية مستقلة، تُنشر أعمالاً إبداعية في الشعر والقصة والنثر والتأملات والمقالات. تأسست على إيمان بأن الكلمة، حين تُكتب بصدق، تملك القدرة على تغيير طريقة نظرنا إلى أنفسنا وإلى العالم.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── VISION / VALUES ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="editorial-line-lg mx-auto mb-6" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-[var(--font-heading)] mb-4">رؤيتنا وقيمنا</h2>
            <p className="text-text-muted text-sm sm:text-base max-w-lg mx-auto">
              لا نخضع لأي توجه تجاري أو سياسي. ننشر ما نؤمن بقيمته الأدبية، ونفتح أبوابنا لكل كاتبٍ يحمل قلماً صادقاً وقلباً مستمعاً.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
          {VALUES.map((v, i) => (
            <ScrollReveal key={v.title} delay={i * 120}>
              <div className="group relative bg-surface rounded-2xl sm:rounded-3xl border border-border/50 p-7 sm:p-8 card-hover overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-accent/[0.08] flex items-center justify-center text-accent mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-accent/10 transition-all duration-300">
                    <v.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold font-[var(--font-heading)] mb-3 group-hover:text-accent transition-colors duration-300">
                    {v.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {v.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── STATISTICS ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold font-[var(--font-heading)] gradient-text mb-2">
                  {stat.value}
                </div>
                <p className="text-sm sm:text-base text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-accent via-accent-dark to-[#0d1025] p-8 sm:p-12 lg:p-16 text-center">
            <div className="absolute inset-0 pointer-events-none hidden sm:block">
              <div className="absolute top-[10%] right-[10%] w-40 h-40 rounded-full border border-white/[0.06] animate-drift" />
              <div className="absolute bottom-[15%] left-[15%] w-24 h-24 rounded-full border border-white/[0.04] animate-drift" style={{ animationDelay: "-8s" }} />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-heading)] mb-3 text-white">
                هل تكتب؟
              </h2>
              <p className="text-white/50 max-w-lg mx-auto mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
                نفتح أبوابنا لكل كاتبٍ يحمل قلماً صادقاً. شاركنا أعمالك في أيٍّ من أقسامنا الأدبية.
              </p>
              <Link
                href="/submit"
                className="inline-flex px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-white text-accent-dark font-bold text-sm hover:bg-white/90 transition-all duration-300 shadow-2xl shadow-black/20 items-center gap-2.5 btn-ripple active:scale-95 hover:scale-[1.02]"
              >
                أرسل عملك
                <ArrowLeftIcon size={15} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <ScrollReveal>
          <NewsletterSignup />
        </ScrollReveal>
      </section>
    </div>
  );
}
