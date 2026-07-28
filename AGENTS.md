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
- /supabase/migrations/ — SQL migrations (already executed)

## Manual Steps Still Needed
1. **Google OAuth**: Enable in Supabase Dashboard → Authentication → Providers → Google
   - Set up Google Cloud Console OAuth credentials (Client ID + Secret)
   - Add redirect URI: https://pbxibeppcnnmrxhrmanf.supabase.co/auth/v1/callback
   - OR use Supabase Management API PAT to configure via API
2. **All SQL migrations already executed** (tables + indexes + triggers + RPCs confirmed working)
