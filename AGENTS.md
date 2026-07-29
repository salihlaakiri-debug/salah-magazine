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

## 5 Literary Sections
poetry, story, prose, articles, reflections

## Database (Supabase)
Project: pbxibeppcnnmrxhrmanf
Tables: articles, comments, profiles, tags, article_tags, subscribers, article_views, follows, likes, bookmarks, notifications
Migrations: 001_performance_indexes.sql, 002_tags_subscribers_views.sql, 003_notifications.sql (all executed)

## Auth System
- Server-side API routes (/api/auth/signup, /api/auth/auto-confirm) bypass email confirmation
- Google OAuth client-side via signInWithGoogle() + /auth/callback route
- Admin: 2ec8e6b2-284c-439e-8ae0-e0a53c1c2642 (role=admin)

## Profile System
- Profile page /profile/[username]: cover image, avatar, stats (works/likes/followers), section breakdown with progress bars, social links (website/Twitter/Instagram), tabs for articles & bookmarks (owner only)
- Settings page /settings: edit display_name, username, bio, avatar/cover upload, social links fields
- Article author linking: WorkCard & work/[id] make author name clickable → profile, show author avatar from profiles table
- Author bio card on article pages (work/[id]): display_name, username, bio, member-since date
- Writers page /writers: grid of all writer+admin profiles with avatars, bios, article/follower counts
- Social columns (website, twitter, instagram) added to profiles table (migration 005)
- enrichArticles() in supabase-data.ts batch-loads author profiles (avatar, username) into Article objects

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
- CSP security headers, rate limiting (in proxy.ts)
- Theme toggle (light/dark), localStorage persistence

## Important Paths
- /src/proxy.ts — middleware (rate limiting, security headers)
- /src/app/auth/callback/route.ts — OAuth callback for Google sign-in
- /src/components/AuthProvider.tsx — auth context with Google OAuth
- /src/components/NotificationsBell.tsx — realtime notifications via Supabase
- /src/lib/tags.ts — tag CRUD (server-side)
- /src/lib/notify.ts — notification creation helpers
- /src/lib/supabase-data.ts — server data helpers (includes enrichArticles for profile linking)
- /src/app/profile/[username]/page.tsx — public profile page with stats, sections, social links
- /src/app/settings/page.tsx — account settings with avatar/cover upload + social links
- /src/app/writers/page.tsx — writers listing grid
- /src/app/work/[id]/page.tsx — article page with author bio card
- /src/components/WorkCard.tsx — article card with clickable author + avatar
- /supabase/migrations/ — SQL migrations (already executed)

## New Pages (Launch-Ready)
- **/contact**: Contact form with Supabase storage (contact_messages table, migration 006)
- **/newsletter/confirmed**: Dedicated confirmation page after email confirmation
- **CookiesConsent**: EU-compliant consent banner added to root layout
- **Image lazy loading**: Added to WorkCard.tsx and AvatarUpload.tsx

## Toast Notification System
- `src/lib/toast.ts`: Module-level showToast() function with callback registration
- `src/components/ToastProvider.tsx`: Renders animated toasts (success/error/info) with auto-dismiss
- Integrated in: AuthProvider (login, signup, logout), LikeButton (login prompt), BookmarkButton (login/save/remove), Comments (publish), Submit (send/edit), Settings (save)
- Animation: `animate-slide-up` in globals.css

## Manual Steps Still Needed
1. **Migration 005**: Execute `supabase/migrations/005_profile_social.sql` in Supabase SQL Editor to add social link columns to profiles table
2. **Migration 006**: Execute `supabase/migrations/006_contact_messages.sql` in Supabase SQL Editor to create contact messages table
3. **Migration 007**: Execute `supabase/migrations/007_nested_comments.sql` in Supabase SQL Editor to add parent_id column for nested replies
4. **Migration 008**: Execute `supabase/migrations/008_images_bucket.sql` in Supabase SQL Editor to create the images storage bucket with RLS policies
5. **Add SMTP config** to .env.local (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM) for custom branded emails; falls back to Supabase default emails otherwise
