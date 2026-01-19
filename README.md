# Life Manager - Complete Personal Management Platform

A comprehensive, life-changing productivity platform designed to help you run your life effectively. Built with modern web technologies for seamless cross-device synchronization.

## 🚀 Features

### 📝 Task Management
- **Today & Inbox Views** - GTD-style workflow with quick capture
- **Task Completion Tracking** - Visual feedback and progress monitoring
- **Priority Management** - Move tasks between inbox and today
- **Real-time Sync** - Changes appear instantly across all devices

### 🎯 Habit Tracking
- **Daily Check-ins** - One-tap habit completion
- **Streak Tracking** - Visual flame icons showing consecutive days
- **7-Day History** - See your consistency at a glance
- **Color Coding** - Personalize each habit with custom colors
- **Habit Consistency Analytics** - Track your performance over time

### 🏆 Goal Tracking
- **Long-term Goals** - Set and track big-picture objectives
- **Milestone System** - Break down goals into actionable steps
- **Progress Visualization** - Automatic progress calculation and charts
- **Target Dates** - Set deadlines to stay accountable
- **Goal Completion Tracking** - Celebrate achievements

### ⏰ Time Blocking
- **Daily Schedule View** - Hourly timeline from 6 AM to 10 PM
- **Block Management** - Create, view, and delete time blocks
- **Date Navigation** - Easily move between days
- **Visual Planning** - See your day at a glance
- **Focused Work Sessions** - Allocate dedicated time for important tasks

### 📊 Weekly Review
- **Performance Dashboard** - Comprehensive weekly overview
- **Task Completion Metrics** - See how many tasks you completed
- **Habit Consistency Rates** - Track your habit performance
- **Goal Progress Summary** - Monitor progress toward your goals
- **Insights & Reflections** - Automated insights based on your data
- **Reflection Prompts** - Guided questions for meaningful review

### 📈 Analytics & Insights
- **Productivity Statistics** - Overall completion rates and trends
- **7-Day Trend Charts** - Visual task completion patterns
- **30-Day Summaries** - Long-term performance tracking
- **Habit Analytics** - Consistency metrics over different timeframes
- **Goal Progress Tracking** - Average progress across all goals
- **Intelligent Recommendations** - Context-aware productivity tips

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS v4** - Utility-first styling
- **Lucide React** - Beautiful icon system
- **date-fns** - Modern date manipulation

### Backend & Data
- **Supabase** - PostgreSQL database with real-time capabilities
- **Row Level Security** - Secure, per-user data isolation
- **Real-time Subscriptions** - Instant sync across devices
- **Zustand** - Lightweight state management

### Progressive Web App
- **PWA Manifest** - Installable on any device
- **Service Workers Ready** - Offline support capability
- **Mobile-First Design** - Responsive on all screen sizes

## 📦 Getting Started

### Prerequisites
- Node.js 18 or higher
- A Supabase account (free tier works perfectly)

### Installation

1. **Clone the repository**
   ```bash
   cd app
   npm install
   ```

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL from `supabase-schema.sql` in your SQL Editor
   - Copy your Project URL and anon key from Settings > API

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   - Navigate to `http://localhost:5173`
   - Sign up for an account
   - Start managing your life!

## 📖 Documentation

- **[SETUP.md](app/SETUP.md)** - Detailed setup instructions
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and technical details
- **[supabase-schema.sql](app/supabase-schema.sql)** - Database schema

## 🌟 Key Benefits

### For Daily Productivity
- **Quick Capture** - Brain dump tasks instantly without friction
- **Focus on Today** - Clear view of what matters now
- **Build Habits** - Consistent routines with visual motivation
- **Time Awareness** - See where your time goes with time blocking

### For Long-term Success
- **Goal Achievement** - Break down big goals into actionable milestones
- **Progress Tracking** - Visual feedback on your journey
- **Weekly Reviews** - Reflect and adjust your approach
- **Data-Driven Insights** - Understand your productivity patterns

### For Flexibility
- **Cross-Platform** - Works on desktop, tablet, and mobile
- **Real-Time Sync** - Seamless experience across all devices
- **Offline Support** - Work without internet, sync when connected
- **Fully Customizable** - Clean codebase for easy modifications

## 🚢 Deployment

### Quick Deploy Options

**Vercel (Recommended)**
```bash
npm run build
vercel
```

**Netlify**
```bash
npm run build
netlify deploy --prod
```

**Static Hosting**
```bash
npm run build
# Upload the dist/ folder to your hosting provider
```

Don't forget to add your environment variables in your hosting platform's dashboard!

## 🎨 Customization

The platform is designed to be easily customizable:

- **Colors**: Edit `tailwind.config.js` for theme colors
- **Features**: Add new views in `src/components/`
- **Data Models**: Extend types in `src/types/` and update database schema
- **Stores**: Add new stores in `src/stores/` for additional features

## 📱 Installing as an App

### Desktop (Chrome, Edge, Brave)
1. Visit your deployed site
2. Click the install icon in the address bar
3. Click "Install"

### iOS (Safari)
1. Visit your site in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

### Android (Chrome)
1. Visit your site
2. Tap menu (three dots)
3. Tap "Install app"

## 🔒 Privacy & Security

- **Your Data, Your Database** - All data stored in your personal Supabase instance
- **Row Level Security** - Only you can access your data
- **No Third-Party Tracking** - Complete privacy
- **Self-Hosted Option** - Can be deployed anywhere

## 🤝 Contributing

This is your personal platform! Feel free to:
- Fork and customize to your needs
- Add new features you find useful
- Share improvements with others

## 📄 License

This project is open source and available for personal use.

## 🙏 Acknowledgments

Built with insights from proven productivity methodologies:
- Getting Things Done (GTD) by David Allen
- Atomic Habits by James Clear
- Deep Work by Cal Newport
- The Bullet Journal Method by Ryder Carroll

---

**Start building the life you want today!** 🚀
