# LinkedIn GTM Analytics Platform

A comprehensive analytics platform for analyzing LinkedIn post performance with AI-powered insights, built with Next.js, Supabase, and Google Gemini.

## 🌐 Live Demo

**🚀 [Try the Live App](https://linkedin-analysis-c8178u52f-anurags-projects-7932c64f.vercel.app)**

The application is now live and ready to use! Upload your LinkedIn data and get AI-powered insights instantly.

## 🎯 Key Features

### ✅ Implemented Features

- **📊 Multi-Profile Dashboard** - Manage multiple LinkedIn profiles in one place
- **🔐 Supabase Authentication** - Secure @misfits.capital email-based authentication
- **🤖 AI-Powered Insights** - Narrative insights, topic analysis, post evaluation, and positioning analysis using Google Gemini
- **📈 Advanced Analytics** - Comprehensive charts and metrics for engagement patterns
- **🔗 Shareable Reports** - Generate public shareable reports with customizable visibility
- **✏️ Editable Content** - Customize report sections including Unstoppable, Next Steps, and Investment Terms
- **🎛️ Card Visibility Control** - Show/hide specific cards in reports
- **💾 Data Persistence** - All profiles automatically saved to Supabase
- **🔄 Update Reports** - Update existing reports without changing the shareable URL
- **📱 Responsive Design** - Works seamlessly on desktop and mobile devices

### 🏗️ Technical Architecture

- **Frontend**: Next.js 14+ with React and TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with OAuth support
- **AI**: Google Gemini API for content analysis
- **Charts**: Chart.js for data visualization
- **Deployment**: Vercel with serverless functions

## 📁 Project Structure

```
GTM/
├── nextjs-app/                   # Main Next.js application
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── api/             # API routes
│   │   │   ├── report/[token]/  # Shareable report pages
│   │   │   ├── layout.jsx       # Root layout with auth
│   │   │   └── page.jsx         # Main dashboard
│   │   ├── components/          # React components
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── cards/           # Analytics card components
│   │   │   ├── charts/          # Chart components
│   │   │   └── ...              # Other components
│   │   └── lib/                 # Utilities and helpers
│   │       ├── contexts/        # React contexts
│   │       ├── hooks/           # Custom React hooks
│   │       └── utils/           # Utility functions
│   ├── public/                  # Static assets
│   ├── supabase-schema.sql      # Database schema
│   ├── supabase-auth-schema.sql # Auth schema
│   └── package.json
│
├── data/                         # LinkedIn data storage
│   └── linkedin/                 # CSV files
│
├── legacy/                       # Legacy Flask/vanilla JS version
│   ├── api/                      # Flask API (deprecated)
│   ├── web/                      # Vanilla JS frontend (deprecated)
│   └── scripts/                  # Utility scripts
│
└── YC - alums/                   # YC Founders Data
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Google Gemini API key

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd GTM
   ```

2. **Install dependencies:**
   ```bash
   cd nextjs-app
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in `nextjs-app/`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Set up Supabase database:**
   - Create a new Supabase project
   - Run `supabase-schema.sql` in the SQL Editor
   - Run `supabase-auth-schema.sql` for authentication
   - Run `add-shareable-report-fields.sql` for shareable reports

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

For detailed documentation, see the Next.js app documentation:

- **[Next.js App README](./nextjs-app/README.md)** - Detailed setup and features
- **[Card Components Guide](./nextjs-app/CARD_COMPONENTS_GUIDE.md)** - Component system
- **[Context Usage Guide](./nextjs-app/CONTEXT_USAGE_GUIDE.md)** - State management
- **[Update Report Feature](./nextjs-app/UPDATE_REPORT_FEATURE.md)** - Shareable reports
- **[Code Review Improvements](./nextjs-app/CODE_REVIEW_IMPROVEMENTS.md)** - Recent improvements
- **[Vercel Deployment](./VERCEL_QUICK_START.md)** - Deployment guide

## 🔧 Development

### File Organization

- **Main Application**: `nextjs-app/` - Active Next.js application
- **Legacy Files**: `legacy/` - Old Flask/vanilla JS version (maintained for reference)
- **Data Files**: `data/` - LinkedIn CSV data

### Key API Routes

- `POST /api/generate-insights` - Generate narrative insights
- `POST /api/analyze-topics` - Analyze post topics
- `POST /api/evaluate-posts` - Evaluate post quality
- `POST /api/analyze-positioning` - Analyze positioning
- `POST /api/generate-report/[datasetId]` - Create shareable report
- `PUT /api/update-report/[datasetId]` - Update existing report
- `DELETE /api/delete-report/[datasetId]` - Delete report

### Running Locally

```bash
# Start development server
cd nextjs-app
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

See [VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md) for detailed instructions.

## 🔐 Authentication

The application uses Supabase authentication with domain-based access control:
- Only `@misfits.capital` email addresses can access the platform
- Google OAuth and email/password authentication supported
- Row Level Security (RLS) ensures data privacy

## 📊 Data Management

### Upload LinkedIn Data

1. Export your LinkedIn posts (CSV format)
2. Click "Upload CSV" in the dashboard
3. Wait for analysis to complete
4. View insights and generate reports

### Profile Management

- Multiple profiles can be managed from one account
- Each profile stores its own analysis data
- Profiles are automatically saved to Supabase

### Shareable Reports

- Generate public shareable links for any profile
- Control which cards appear in the report
- Customize editable sections
- Update reports without changing URLs
- Delete reports when no longer needed

## 🎨 UI Features

### Card System

The application uses a sophisticated card component system:
- **GridCard** - Standard cards with visibility control
- **CollapsibleGridCard** - Large cards with expand/collapse
- **ConditionalCard** - Wrap components with visibility control
- **Card Visibility Settings** - UI to control which cards are shown

### Responsive Design

- Mobile-first approach
- Responsive grid layouts
- Collapsible sections for mobile
- Touch-friendly interactions

## 🔧 Configuration

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI
GEMINI_API_KEY=your_google_gemini_api_key

# Application
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Database Schema

The application requires these Supabase tables:
- `linkedin_datasets` - Main data storage
- `auth.users` - User authentication (managed by Supabase)

See SQL files in the `nextjs-app/` directory for complete schema.

## 🐛 Troubleshooting

**Server won't start?**
- Check if `.env.local` file exists
- Verify all environment variables are set
- Install dependencies: `npm install`

**Can't authenticate?**
- Ensure your email is `@misfits.capital`
- Check Supabase authentication settings
- Verify environment variables

**API not working?**
- Check if GEMINI_API_KEY is set correctly
- Verify Supabase connection
- Check browser console for errors

**Report not generating?**
- Ensure profile has analysis data
- Check if LLM analysis completed
- Verify Supabase database permissions

## 📝 License

Private project for GTM analytics.

## 🙏 Acknowledgments

- Built with Next.js, Supabase, and Google Gemini
- Uses shadcn/ui for UI components
- Chart.js for data visualization

---

**Last Updated**: January 2025

