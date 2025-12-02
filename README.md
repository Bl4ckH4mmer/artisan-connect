# Artisan Connect

A platform connecting local artisans with buyers across Nigeria.

## Features

- ✅ User Authentication (Artisan & Buyer)
- ✅ Artisan Profiles with Verification Badges
- ✅ Search & Discovery
- ✅ Review System
- ✅ Admin Panel
- ✅ Artisan Onboarding

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

- `/` - Home page
- `/auth/signup` - User registration
- `/search` - Search artisans
- `/artisan/onboard` - Artisan onboarding
- `/artisan/[id]` - Artisan profile
- `/admin/dashboard` - Admin panel

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Supabase (Database)
- Lucide Icons