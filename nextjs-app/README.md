# LinkedIn Analysis - Next.js Version

This is the Next.js migration of the LinkedIn analysis application, built alongside the existing Flask/vanilla JS version.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   cd nextjs-app
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Add your Gemini API key
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
nextjs-app/
├── src/
│   ├── app/                    # Next.js 13+ App Router
│   │   ├── api/               # API Routes (backend)
│   │   │   ├── generate-insights/
│   │   │   ├── analyze-topics/
│   │   │   ├── evaluate-posts/
│   │   │   └── analyze-positioning/
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── FileUpload.tsx
│   │   ├── MetricsDisplay.tsx
│   │   ├── ChartSection.tsx
│   │   └── InsightsPanel.tsx
│   └── lib/                   # Utility functions and hooks
│       └── hooks/
│           └── useDataAnalysis.ts
├── public/                    # Static assets
├── package.json
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## 🔧 Features

### ✅ Implemented
- [x] Basic Next.js project structure
- [x] API routes for all 4 LLM endpoints
- [x] React components for UI
- [x] Tailwind CSS styling
- [x] TypeScript configuration
- [x] Vercel deployment configuration

### 🚧 In Progress
- [ ] CSV processing logic migration
- [ ] Chart.js integration
- [ ] LLM API integration (Google Gemini)
- [ ] PDF generation
- [ ] Data persistence

### 📋 TODO
- [ ] Migrate CSV analysis from `data-handlers.js`
- [ ] Implement Chart.js rendering in React
- [ ] Connect LLM functions to API routes
- [ ] Add error handling and loading states
- [ ] Implement file upload functionality
- [ ] Add PDF export feature
- [ ] Test all functionality end-to-end

## 🔌 API Endpoints

All API routes are configured with 60-second timeout for Vercel deployment:

- `POST /api/generate-insights` - Generate narrative insights
- `POST /api/analyze-topics` - Analyze post topics with AI
- `POST /api/evaluate-posts` - Evaluate post quality with scoring rubric
- `POST /api/analyze-positioning` - Analyze personal branding and positioning

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

## 🔄 Migration Status

This Next.js version is being developed alongside the existing Flask/vanilla JS application to ensure:
- ✅ No disruption to existing functionality
- ✅ Feature parity testing
- ✅ Easy rollback if needed
- ✅ Gradual migration approach

## 📊 Performance Considerations

- **API Routes**: Configured for 60-second timeout (Vercel Pro plan)
- **LLM Processing**: Will be optimized for serverless deployment
- **Charts**: Client-side rendering with Chart.js
- **File Processing**: Server-side CSV analysis

## 🛠️ Development Notes

- Uses Next.js 13+ App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Server-side API routes for LLM processing
- Client-side components for UI interactions

## 📝 Next Steps

1. **Phase 2**: Migrate LLM functions to API routes
2. **Phase 3**: Implement CSV processing in React hooks
3. **Phase 4**: Add Chart.js integration
4. **Phase 5**: Test and optimize for production
5. **Phase 6**: Deploy to Vercel and verify functionality
