# Environment Setup

To fix the "GEMINI_API_KEY not configured" error:

1. **Create `.env.local` file** in the `nextjs-app` directory
2. **Add your Gemini API key**:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

3. **Restart the development server**:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

**Note**: The LLM features (AI insights, topic analysis, etc.) require a valid Gemini API key to work. Basic functionality (CSV upload, charts, metrics) works without it.
