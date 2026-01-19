# Life Manager - Setup Guide

Welcome to your personal management platform! Follow this guide to get up and running.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Local Development](#local-development)
4. [Deployment](#deployment)
5. [Using as a PWA](#using-as-a-pwa)
6. [Customization](#customization)

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works great!)
- A modern web browser

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in/create an account
2. Click "New Project"
3. Choose an organization and fill in:
   - Project name: `life-manager` (or any name you prefer)
   - Database password: Choose a strong password
   - Region: Select closest to you
4. Click "Create new project" and wait for it to initialize (~2 minutes)

### 2. Set Up the Database

1. In your Supabase project dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" or press Cmd/Ctrl + Enter
6. You should see "Success. No rows returned"

This creates all the necessary tables, indexes, Row Level Security policies, and enables real-time subscriptions.

### 3. Get Your API Keys

1. In your Supabase project dashboard, click "Project Settings" (gear icon) in the bottom left
2. Click "API" in the settings menu
3. You'll see two important values:
   - **Project URL**: Something like `https://abcdefghijk.supabase.co`
   - **anon public** key: A long string starting with `eyJ...`

### 4. Configure Environment Variables

1. In the project directory (`app/`), copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

4. Create an account using the sign-up form

5. Start using your personal management platform!

## Deployment

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   npm run build
   vercel
   ```

3. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Redeploy

### Option 2: Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Build and deploy:
   ```bash
   npm run build
   netlify deploy --prod
   ```

3. Add environment variables in Netlify dashboard

### Option 3: Static Hosting (Cloudflare Pages, GitHub Pages, etc.)

1. Build the project:
   ```bash
   npm run build
   ```

2. The `dist/` folder contains your production-ready app

3. Upload to your preferred hosting service

4. Configure environment variables in your hosting platform's dashboard

## Using as a PWA (Progressive Web App)

Your Life Manager works as a native-like app on both desktop and mobile!

### On Desktop (Chrome, Edge, Brave)

1. Visit your deployed site
2. Look for the install icon in the address bar
3. Click "Install Life Manager"
4. The app will open in its own window

### On iOS (Safari)

1. Visit your deployed site in Safari
2. Tap the Share button
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"
5. The app icon will appear on your home screen

### On Android (Chrome)

1. Visit your deployed site
2. Tap the menu (three dots)
3. Tap "Install app" or "Add to Home Screen"
4. Tap "Install"

## Features Overview

### Daily To-Do List

- **Today**: Tasks you're working on today
- **Inbox**: Quick capture for all incoming tasks
- **Quick Capture**: Just type and press Enter
- **Move Tasks**: Arrow button moves inbox tasks to today
- **Complete**: Click the checkbox to mark done

### Habit Tracker

- Create daily habits you want to build
- Check them off each day
- See your streak (consecutive days completed)
- Visual 7-day history for each habit
- Choose custom colors for each habit

### Real-Time Sync

- Changes sync instantly across all your devices
- Open on your phone and computer simultaneously
- Updates appear in real-time

## Customization

### Change Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      success: '#your-color',
      // etc.
    },
  },
}
```

### Add More Features

The codebase is designed to be easily extensible:

- **New Views**: Add to `src/pages/`
- **New Components**: Add to `src/components/`
- **New Data Stores**: Add to `src/stores/`
- **Database Changes**: Update `supabase-schema.sql` and run the new SQL

### Upcoming Features (Planned)

Check `ARCHITECTURE.md` for the full roadmap. Some highlights:

- Goal tracking with milestones
- Time blocking / calendar view
- Weekly review dashboard
- Analytics and insights
- Calendar integrations (Google, Apple)

## Troubleshooting

### Can't sign in/sign up

- Check that your `.env` file has the correct Supabase credentials
- Verify your Supabase project is active
- Check browser console for error messages

### Tasks/Habits not syncing

- Ensure you're connected to the internet
- Check that the database schema was set up correctly
- Verify Row Level Security policies are enabled
- Look at the browser console for real-time subscription errors

### App not installing as PWA

- PWAs require HTTPS (works on localhost and deployed sites)
- Check that `manifest.json` is accessible
- Ensure your hosting serves the manifest with correct MIME type

## Support & Feedback

This is your personal productivity platform - customize it to fit your needs!

For issues or questions:
- Check `ARCHITECTURE.md` for technical details
- Review the Supabase dashboard for database issues
- Check browser console for JavaScript errors

## Privacy & Data

- All your data is stored in your personal Supabase database
- Only you have access to your data (via Row Level Security)
- No third-party tracking or analytics
- You own and control everything

---

**Enjoy building your life with Life Manager!** 🚀
