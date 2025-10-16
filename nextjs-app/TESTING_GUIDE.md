# 🧪 Next.js LinkedIn Analysis - Testing Guide

## 🚀 Quick Start Testing

### 1. Start the Development Server
```bash
cd nextjs-app
npm run dev
```
The server should start at `http://localhost:3000`

### 2. Test Basic Functionality

#### ✅ **Test 1: Health Check**
- Visit: `http://localhost:3000/api/health`
- Expected: JSON response with status, timestamp, and geminiConfigured

#### ✅ **Test 2: Home Page**
- Visit: `http://localhost:3000`
- Expected: LinkedIn Yearly Wrap page with upload button
- Should show empty state with feature highlights

#### ✅ **Test 3: CSV Upload**
- Click "📊 Upload CSV" button
- Upload the test file: `data/linkedin/Amit Singh LI Post 1 Year.csv`
- Expected: Loading state, then metrics and charts

### 3. Test Chart Functionality

#### ✅ **Test 4: Chart Rendering**
After CSV upload, verify these charts appear:
- **Posting cadence** - Bar chart showing monthly posts
- **Engagement over time** - Line chart with trends
- **Format mix** - Doughnut chart showing content types
- **Post vs Reshare** - Doughnut chart showing actions

#### ✅ **Test 5: Chart Export**
- Hover over any chart
- Click "📥 PNG" button
- Expected: PNG file downloads with chart title

### 4. Test LLM Features

#### ✅ **Test 6: Narrative Insights**
- Click "✨ Generate Insights" button
- Expected: AI-powered insights about posting patterns
- Should show loading state during processing

#### ✅ **Test 7: Topic Analysis**
- Click "🎯 Analyze with AI" button
- Expected: Topic breakdown with frequency and engagement

#### ✅ **Test 8: Post Evaluation**
- Click "🎯 Evaluate Posts" button
- Expected: Scoring rubric with strengths/improvements

#### ✅ **Test 9: Positioning Analysis**
- Click "🚀 Analyze Positioning" button
- Expected: Current and future positioning recommendations

## 🔧 Environment Setup

### Required Environment Variables
Create `.env.local` in the `nextjs-app` directory:
```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Test Data
Use the sample CSV file: `data/linkedin/Amit Singh LI Post 1 Year.csv`

## 🐛 Troubleshooting

### Common Issues

#### 1. **Server Won't Start**
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID> /F
```

#### 2. **Charts Not Rendering**
- Check browser console for errors
- Verify Chart.js is loaded
- Check if data is properly formatted

#### 3. **LLM Features Not Working**
- Verify GEMINI_API_KEY is set
- Check API routes are responding
- Look for CORS errors in browser console

#### 4. **CSV Upload Failing**
- Check file format matches expected columns
- Verify PapaParse is working
- Check for JavaScript errors

## 📊 Expected Results

### Metrics Display
After CSV upload, you should see:
- **Posts**: Number of posts in last 12 months
- **Active months**: Number of months with posts
- **Median engagement**: Median engagement score
- **P90 engagement**: 90th percentile engagement

### Chart Data
- **Posts per month**: Should show posting frequency over time
- **Engagement trends**: Should show engagement patterns
- **Format mix**: Should show distribution of content types
- **Action mix**: Should show posts vs reshares ratio

### LLM Insights
- **Narrative Insights**: 3-5 actionable insights
- **Topic Analysis**: Top topics with frequency/engagement
- **Post Evaluation**: Score out of 100 with rubric breakdown
- **Positioning**: Current and recommended positioning

## 🎯 Success Criteria

### ✅ Basic Functionality
- [ ] Server starts without errors
- [ ] Home page loads correctly
- [ ] CSV upload works
- [ ] Data processing completes
- [ ] Metrics display correctly

### ✅ Chart Functionality
- [ ] All 4 charts render
- [ ] Charts are responsive
- [ ] Export functionality works
- [ ] Chart data is accurate

### ✅ LLM Integration
- [ ] All 4 LLM features work
- [ ] Loading states display
- [ ] Results are meaningful
- [ ] Error handling works

### ✅ Performance
- [ ] Page loads quickly
- [ ] Charts render smoothly
- [ ] API responses are fast
- [ ] No memory leaks

## 📝 Test Report Template

```
## Test Results - [Date]

### Environment
- Node.js Version: 
- Browser: 
- GEMINI_API_KEY: [Set/Not Set]

### Basic Tests
- [ ] Health Check API
- [ ] Home Page Load
- [ ] CSV Upload
- [ ] Data Processing

### Chart Tests
- [ ] Posts Per Month Chart
- [ ] Engagement Over Time Chart
- [ ] Format Mix Chart
- [ ] Action Mix Chart
- [ ] Chart Export

### LLM Tests
- [ ] Narrative Insights
- [ ] Topic Analysis
- [ ] Post Evaluation
- [ ] Positioning Analysis

### Issues Found
1. [Issue description]
2. [Issue description]

### Performance Notes
- Page load time: 
- Chart render time: 
- API response time: 
```

## 🚀 Next Steps

After successful testing:
1. **Phase 6**: Deploy to Vercel
2. **Production Testing**: Test deployed version
3. **Performance Optimization**: Based on test results
4. **Documentation**: Update README with setup instructions

---

**Note**: This testing guide ensures the Next.js app has complete feature parity with the original Flask application.
