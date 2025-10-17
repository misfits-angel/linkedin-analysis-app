# LinkedIn GTM Analytics Platform

A comprehensive analytics platform for analyzing LinkedIn post performance with AI-powered insights.

## 🌐 Live Demo

**🚀 [Try the Live App](https://linkedin-analysis-c8178u52f-anurags-projects-7932c64f.vercel.app)**

The application is now live and ready to use! Upload your LinkedIn data and get AI-powered insights instantly.

## 📁 Project Structure

```
GTM/
├── api/                          # Backend API
│   ├── linkedin_analysis_api.py  # Flask API for comprehensive LinkedIn analysis
│   └── requirements.txt          # Python dependencies
│
├── web/                          # Frontend Application
│   ├── index.html                # Main web interface
│   └── assets/
│       └── sample-data.json      # Sample data for demo
│
├── data/                         # Data Storage
│   └── linkedin/                 # LinkedIn CSV files
│       ├── *.csv                 # Your LinkedIn post data
│
├── scripts/                      # Utility Scripts
│   ├── start_insights_server.bat # Windows launcher
│   └── start_insights_server.sh  # Mac/Linux launcher
│
├── backups/                      # Stable Working Versions
│   ├── api/                      # API backups
│   └── web/                      # Frontend backups
│
├── linkedin_parser/              # LinkedIn Data Parser
│   ├── parse_and_append.py       # CSV parser
│   ├── html_input.txt            # Input file for HTML
│   └── README.md                 # Parser documentation
│
├── Archive/                      # Old/Deprecated Files
└── YC - alums/                   # YC Founders Data
```

## 🚀 Quick Start

### 1. Setup Environment

Create a `.env` file in the project root:
```bash
GEMINI_API_KEY=your_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### 2. Install Dependencies

```bash
pip install -r api/requirements.txt
```

### 3. Start the Server

**Windows:**
```bash
scripts\start_insights_server.bat
```

**Mac/Linux:**
```bash
bash scripts/start_insights_server.sh
```

### 4. Open the Web Interface

Open `web/index.html` in your browser.

## 📊 Features

### AI-Powered Insights
- **Narrative Insights**: Human-friendly observations about your posting patterns
- **Topic Analysis**: Identify which topics perform best
- **Post Quality Evaluation**: Thought-leadership scoring and feedback
- **Positioning Analysis**: Current vs future personal branding recommendations
- **Engagement Patterns**: Understand what drives comments vs likes

### Analytics Dashboard
- Posting cadence over time
- Engagement metrics (median, P90)
- Format performance (text, image, video, carousel)
- Best posting days
- Top performing posts

### Data Processing
- CSV upload and analysis
- Automatic timestamp conversion
- Multi-page data aggregation
- Export to PDF

## 📁 Working with Data

### Upload Your LinkedIn Data

1. **Export from LinkedIn**: Use the `linkedin_parser` tool
2. **Upload CSV**: Click the menu (⋮) → "Upload CSV"
3. **Analyze**: Generate insights with AI

### Data Location

All your CSV files are stored in:
```
data/linkedin/
```

## 🔧 Development

### File Organization

- **Production files**: `api/` and `web/`
- **Backup files**: `backups/` (stable working versions)
- **Experiments**: Work on production files, rollback from backups if needed

### API Endpoints

- `GET  /health` - Health check
- `POST /generate-insights` - Generate narrative insights
- `POST /analyze-topics` - Analyze post topics
- `POST /evaluate-posts` - Evaluate post quality with rubric
- `POST /analyze-positioning` - Analyze current and future positioning

### Running Locally

```bash
# Start API server
python api/linkedin_analysis_api.py

# Open web interface
# Just open web/index.html in your browser
```

## 📝 Key Files

| File | Purpose |
|------|---------|
| `web/index.html` | Main web interface |
| `api/linkedin_analysis_api.py` | Flask API server |
| `api/requirements.txt` | Python dependencies |
| `scripts/start_insights_server.*` | Launcher scripts |
| `data/linkedin/*.csv` | Your LinkedIn data |
| `.env` | API keys (create this) |

## 🔄 Backup Strategy

The `backups/` folder contains stable working versions:
- `backups/api/linkedin_analysis_api_working.py`
- `backups/web/index_improved_working.html`

Use these to rollback if experiments go wrong.

## 📦 Dependencies

See `api/requirements.txt` for full list:
- Flask (API server)
- Flask-CORS (CORS support)
- google-generativeai (Gemini AI)
- python-dotenv (Environment variables)

## 🎯 Next Steps

1. ✅ Export your LinkedIn data using `linkedin_parser`
2. ✅ Create `.env` file with your Gemini API key
3. ✅ Start the server using `scripts/start_insights_server.*`
4. ✅ Upload your CSV and generate insights!

## 📚 Additional Resources

- **LinkedIn Parser Guide**: `linkedin_parser/README.md`
- **API Documentation**: See docstrings in `api/linkedin_analysis_api.py`
- **Sample Data**: `web/assets/sample-data.json`

## 🐛 Troubleshooting

**Server won't start?**
- Check if `.env` file exists in project root
- Verify GEMINI_API_KEY is set correctly
- Install dependencies: `pip install -r api/requirements.txt`

**Can't generate insights?**
- Ensure server is running (green in console)
- Check browser console for errors
- Verify API key has credits

**CSV upload fails?**
- Check CSV format (use LinkedIn parser)
- Ensure postTimestamp column exists
- Try with sample data first

## 📄 License

Private project for GTM analytics.

---

**Last Updated**: October 2025

