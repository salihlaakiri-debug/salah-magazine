<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Al-Sudfeh Magazine — Project Summary

## Overview
Arabic literary magazine "السُّدفة" — Next.js 16.2.11, React 19, TypeScript, Tailwind CSS v4, Supabase, Vercel.
Live at: https://al-sudfeh.vercel.app

## Tech Stack
- Next.js 16.2.11 (Turbopack), React 19, TypeScript
- Tailwind CSS v4
- Supabase (Auth, Database, Storage, Realtime)
- Vercel (hosting, edge middleware proxy)
- Arabic RTL (Noto Naskh Arabic, Noto Kufi Arabic, Amiri fonts)
- Deep Indigo (#2d3561) color scheme, light mode default (localStorage key: sudfeh-theme)
- Vitest (testing)

## 5 Literary Sections
poetry, story, prose, articles, reflections

## Database (Supabase)
Project: pbxibeppcnnmrxhrmanf
Tables: articles, comments, profiles, tags, article_tags, subscribers, article_views, follows, likes, bookmarks, notifications, contact_messages, reading_lists, notification_preferences, rate_limits
Consolidated migration: supabase/migrations/012_consolidated.sql (run ONCE in Supabase SQL Editor — covers all tables, indexes, RLS, functions, triggers, storage buckets, admin setup)

## Auth System
- Server-side API routes (/api/auth/signup, /api/auth/auto-confirm) bypass email confirmation
- Google OAuth client-side via signInWithGoogle() + /auth/callback route
- Admin: salihlaakiri@gmail.com (role=admin, set by migration 012)

## Key Features
- Tags system (TagBadge, TagInput, /tag/[slug] pages)
- Newsletter (subscribe/confirm API routes)
- View counter (article_views table + API route)
- Real-time notifications (Supabase Realtime + NotificationsBell component + DB triggers)
- PWA manifest (Arabic RTL)
- JSON-LD structured data (Website, Article, Breadcrumb)
- RSS feed, sitemap, robots.txt
- Dynamic imports for heavy components (Comments, ReadingMode, TOC, ShareButtons, ShareCard)
- Admin dashboard (stats, section breakdown, recent articles/comments)
- Admin articles (CRUD, filter by section, tag management)
- Admin comments (search, pagination, article-title lookup, delete/clear-all)
- Loading skeletons, error boundaries, pagination
- CSP security headers, rate limiting (in-memory at edge + DB-backed in API routes)
- Input validation (src/lib/validation.ts)
- Theme toggle (light/dark), localStorage persistence

## Important Paths
- /src/proxy.ts — middleware (rate limiting, security headers)
- /src/lib/validation.ts — input validation utilities
- /src/lib/rate-limit.ts — DB-backed rate limiting fallback
- /src/lib/supabase.ts — client-side Supabase (lazy proxy)
- /src/lib/supabase-server.ts — server-side Supabase client
- /src/lib/supabase-data.ts — server data helpers (enrichArticles)
- /src/lib/tags.ts — tag CRUD
- /src/lib/notify.ts — notification creation helpers
- /src/lib/email.ts — email sending (nodemailer)
- /src/lib/toast.ts — toast notification system
- /src/components/AuthProvider.tsx — auth context with Google OAuth
- /src/components/NotificationsBell.tsx — realtime notifications via Supabase
- /supabase/migrations/012_consolidated.sql — single file for full DB setup

## Important Pages
- /profile/[username] — public profile page with stats, sections, social links
- /settings — account settings with avatar/cover upload + social links
- /writers — writers listing grid
- /work/[id] — article page with author bio card
- /contact — contact form with Supabase storage
- /newsletter/confirmed — confirmation page

## Manual Steps Still Needed
1. **Run consolidated migration**: Execute `supabase/migrations/012_consolidated.sql` in Supabase SQL Editor (idempotent — safe to run multiple times) — this replaces all individual migrations 001-011
2. **Add SMTP config** to .env.local (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM) for custom branded emails; falls back to Supabase default emails otherwise
