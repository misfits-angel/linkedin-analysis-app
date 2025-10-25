# LinkedIn Analysis - Next.js Application

A modern, full-stack LinkedIn analytics platform built with Next.js, Supabase, and Google Gemini AI. Features multi-user authentication, comprehensive analytics, AI-powered insights, and shareable reports.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)
- Google Gemini API key

### Installation

1. **Install dependencies:**
   ```bash
   cd nextjs-app
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the `nextjs-app/` directory:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_google_gemini_api_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. **Set up Supabase database:**
   - Create a new Supabase project
   - Run `supabase-schema.sql` in the SQL Editor
   - Run `supabase-auth-schema.sql` for authentication
   - Run `add-shareable-report-fields.sql` for shareable reports

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ✨ Features

### ✅ Implemented Features

- **🔐 Authentication** - Supabase-based authentication with @misfits.capital domain control
- **📊 Multi-Profile Dashboard** - Manage multiple LinkedIn profiles in one place
- **📈 Advanced Analytics** - Comprehensive charts and metrics
- **🤖 AI-Powered Insights** - Google Gemini AI analysis:
  - Narrative insights about posting patterns
  - Topic analysis with performance metrics
  - Post quality evaluation with scoring
  - Positioning analysis and recommendations
- **🔗 Shareable Reports** - Generate public shareable reports with customizable visibility
- **✏️ Editable Content** - Customize report sections (Unstoppable, Next Steps, Investment Terms)
- **🎛️ Card Visibility Control** - Show/hide specific cards in reports
- **💾 Data Persistence** - All profiles automatically saved to Supabase
- **🔄 Update Reports** - Update existing reports without changing the shareable URL
- **📱 Responsive Design** - Mobile-first responsive design
- **🎨 Modern UI** - Tailwind CSS with shadcn/ui components

## 📁 Project Structure

```
nextjs-app/
├── src/
│   ├── app/                    # Next.js 13+ App Router
│   │   ├── api/               # API Routes (backend)
│   │   │   ├── generate-insights/
│   │   │   ├── analyze-topics/
│   │   │   ├── evaluate-posts/
│   │   │   ├── analyze-positioning/
│   │   │   ├── generate-report/
│   │   │   ├── update-report/
│   │   │   └── delete-report/
│   │   ├── report/[token]/    # Shareable report pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.jsx         # Root layout with providers
│   │   └── page.jsx           # Main dashboard page
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui base components
│   │   ├── cards/            # Analytics card components
│   │   ├── charts/           # Chart components
│   │   └── ...               # Other components
│   └── lib/                   # Utility functions and hooks
│       ├── contexts/         # React Context providers
│       ├── hooks/            # Custom React hooks
│       └── utils/            # Utility functions
├── public/                    # Static assets
├── supabase-schema.sql        # Database schema
├── supabase-auth-schema.sql   # Auth schema
├── add-shareable-report-fields.sql # Shareable reports schema
├── package.json
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## 🔌 API Endpoints

All API routes are configured with appropriate timeouts for Vercel deployment:

### Analysis Endpoints
- `POST /api/generate-insights` - Generate narrative insights about posting patterns
- `POST /api/analyze-topics` - Analyze post topics with AI
- `POST /api/evaluate-posts` - Evaluate post quality with scoring rubric
- `POST /api/analyze-positioning` - Analyze personal branding and positioning

### Report Endpoints
- `POST /api/generate-report/[datasetId]` - Create shareable report
- `PUT /api/update-report/[datasetId]` - Update existing report
- `DELETE /api/delete-report/[datasetId]` - Delete report

## 🔐 Authentication

The application uses Supabase authentication with domain-based access control:

- **Domain Restriction**: Only `@misfits.capital` email addresses can access
- **Auth Methods**: Email/password and Google OAuth
- **RLS**: Row Level Security ensures data privacy
- **User Context**: `AuthContext` provides authentication state throughout the app

## 📊 Data Management

### Profile Management

- Upload CSV files with LinkedIn post data
- Automatic analysis and data extraction
- Multiple profiles per user
- Profile switching without page reload

### Shareable Reports

- Generate public shareable links
- Control card visibility
- Customize editable sections:
  - Unstoppable section
  - Next Steps
  - Investment Terms
  - What You Get
- Update reports without changing URLs
- Delete reports when no longer needed

## 🎨 UI Components

### Card System

The application uses a sophisticated card component system:

- **Card** - Base card component
- **CardWithName** - Card with optional name overlay
- **GridCard** - Standard cards with visibility control
- **CollapsibleGridCard** - Large cards with expand/collapse
- **ConditionalCard** - Wrap components with visibility control

See [CARD_COMPONENTS_GUIDE.md](./CARD_COMPONENTS_GUIDE.md) for detailed usage.

### Context Management

- **AuthContext** - User authentication and session
- **UIPreferencesContext** - Card visibility and UI preferences

See [CONTEXT_USAGE_GUIDE.md](./CONTEXT_USAGE_GUIDE.md) for details.

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure root directory as `nextjs-app`
4. Deploy automatically on push to main branch

See [../VERCEL_QUICK_START.md](../VERCEL_QUICK_START.md) for detailed instructions.

### Environment Variables

Required environment variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_gemini_api_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 📚 Documentation

- **[CARD_COMPONENTS_GUIDE.md](./CARD_COMPONENTS_GUIDE.md)** - Card component system
- **[CONTEXT_USAGE_GUIDE.md](./CONTEXT_USAGE_GUIDE.md)** - Context and state management
- **[UPDATE_REPORT_FEATURE.md](./UPDATE_REPORT_FEATURE.md)** - Shareable reports feature
- **[CODE_REVIEW_IMPROVEMENTS.md](./CODE_REVIEW_IMPROVEMENTS.md)** - Recent improvements
- **[PRE_PUSH_FIXES.md](./PRE_PUSH_FIXES.md)** - Pre-deployment fixes

## 🛠️ Development

### Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript/JavaScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Google Gemini API
- **Charts**: Chart.js
- **Deployment**: Vercel

### Code Quality

- ESLint for linting
- TypeScript for type safety
- Component-based architecture
- Error boundaries for error handling
- Responsive design principles

## 📈 Performance Considerations

- **API Routes**: Configured for Vercel serverless deployment
- **LLM Processing**: Optimized for serverless functions
- **Charts**: Client-side rendering with Chart.js
- **File Processing**: Server-side CSV analysis
- **Caching**: Supabase caching for database queries

## 🐛 Troubleshooting

**Can't authenticate?**
- Ensure your email ends with `@misfits.capital`
- Check Supabase authentication configuration
- Verify environment variables

**Report not generating?**
- Ensure profile has analysis data
- Check if LLM analysis completed successfully
- Verify Supabase database permissions

**Cards not showing?**
- Check Card Visibility Settings
- Verify card IDs in CARD_DEFINITIONS
- Review UIPreferencesContext configuration

## 📝 Recent Updates

### Latest Features
- ✅ Update report functionality without changing URLs
- ✅ Editable content sections in reports
- ✅ Card visibility controls
- ✅ Supabase authentication integration
- ✅ Multi-profile management
- ✅ Shareable report generation

### Recent Improvements
- ✅ Fixed race conditions in profile loading
- ✅ Added error boundaries
- ✅ Improved card component system
- ✅ Better error handling in API routes
- ✅ Enhanced responsive design

## 🎯 Future Enhancements

- [ ] Export reports as PDF
- [ ] Bulk operations on profiles
- [ ] Advanced filtering and sorting
- [ ] Export charts as images
- [ ] Scheduled report generation
- [ ] Email notifications
- [ ] Custom dashboard layouts

## 📄 License

Private project for GTM analytics.

---

**Last Updated**: January 2025
