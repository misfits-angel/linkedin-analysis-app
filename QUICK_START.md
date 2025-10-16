# 🚀 Quick Start Guide

Get up and running in 5 minutes!

## Step 1: Setup API Key (2 min)

1. Get your Gemini API key: https://makersuite.google.com/app/apikey
2. Create a `.env` file in the project root:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

## Step 2: Install Dependencies (1 min)

```bash
pip install -r api/requirements.txt
```

## Step 3: Start the Server (1 min)

**Windows:**
```bash
scripts\start_insights_server.bat
```

**Mac/Linux:**
```bash
bash scripts/start_insights_server.sh
```

Keep this terminal window open!

## Step 4: Open Web Interface (1 min)

Open `web/index.html` in your browser.

## Step 5: Upload Your Data

### Option A: Use Sample Data (Fastest)
The app loads with sample data by default. Just explore!

### Option B: Upload Your LinkedIn CSV
1. Click the menu button (⋮) in the top-right
2. Select "Upload CSV"
3. Choose your LinkedIn CSV file
4. Wait for analysis to complete

### Option C: Export from LinkedIn (Most Comprehensive)
1. Go to `linkedin_parser/` folder
2. Read `FOLDER_STRUCTURE.txt` for instructions
3. Use `parse_and_append.py` to extract data
4. Upload the generated CSV

## 🎉 That's It!

You should now see:
- ✅ Your posting metrics
- ✅ Engagement charts
- ✅ Top performing posts

## 🤖 Generate AI Insights

1. Click **"✨ Generate Insights"** button
2. Wait 10-15 seconds
3. Get personalized observations about your posting patterns!

## 📊 Analyze Topics

1. Click **"🎯 Analyze with AI"** button
2. Wait 10-15 seconds
3. See which topics perform best!

---

## 🆘 Troubleshooting

**Server won't start?**
- Check `.env` file exists in project root
- Verify your API key is correct

**Can't generate insights?**
- Make sure the server is running
- Check browser console (F12) for errors

**CSV upload fails?**
- Use the LinkedIn parser to ensure proper format
- Check that CSV has `postTimestamp` column

---

## 📁 Project Structure

```
GTM/
├── api/              ← Backend server
├── web/              ← Frontend (open index.html)
├── scripts/          ← Start server scripts
├── data/linkedin/    ← Your CSV files
└── linkedin_parser/  ← Data extraction tool
```

## 📚 Need More Help?

- **Full Documentation**: `README.md`
- **LinkedIn Parser Guide**: `linkedin_parser/README.md`
- **API Details**: `api/linkedin_analysis_api.py`

---

**Ready to dive deeper?** Check out `README.md` for comprehensive documentation!

