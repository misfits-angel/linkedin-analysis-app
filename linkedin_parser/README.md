# LinkedIn Posts Parser

Extract LinkedIn posts from HTML tables and save them to CSV with ISO timestamps.

---

## 📋 Quick Start

### Step 1: Get Your HTML
1. Go to your LinkedIn profile or search results page
2. Open Browser Developer Tools (F12)
3. Find the table element containing posts
4. **Right-click on the `<table>` tag** → Copy → Copy element
5. Paste into `html_input.txt`

### Step 2: Run the Parser
```bash
python parse_and_append.py
```

### Step 3: Get Your Data
- Output saved to: `linkedin_posts_combined.csv`
- All posts from multiple pages combined in one file

---

## 📥 How to Provide HTML Input

### **BEST METHOD: Copy Full Table Element**

1. **Open LinkedIn page** with posts
2. **Press F12** to open Developer Tools
3. **Click the "Select Element" tool** (top-left of dev tools)
4. **Click on any post** in the table
5. **In the Elements tab, scroll up** until you see `<table class="min-w-full...">`
6. **Right-click the `<table>` tag** → Copy → Copy element
7. **Paste into `html_input.txt`** file

### ✅ What You Should Copy

Your HTML should start with:
```html
<table class="min-w-full flex-none table-fixed border-separate border-spacing-0" ...>
  <thead>
    <tr>
      <th data-testid="postUrl">...</th>
      <th data-testid="imgUrl">...</th>
      ...
    </tr>
  </thead>
  <tbody>
    <tr>
      <td data-testid="10_postUrl">...</td>
      ...
    </tr>
  </tbody>
</table>
```

### ❌ Don't Copy

- ❌ Just the visible text
- ❌ Partial HTML
- ❌ Only `<tbody>` or `<tr>` elements
- ❌ Screenshots or images

---

## 🔄 Processing Multiple Pages

**Example: Getting 40 rows from 4 pages**

```bash
# Page 1 (rows 1-10)
# 1. Copy HTML table from page 1
# 2. Paste into html_input.txt
python parse_and_append.py
# Output: "Total rows in CSV: 10"

# Page 2 (rows 11-20)
# 1. Go to next page
# 2. Copy HTML table from page 2
# 3. Replace content in html_input.txt
python parse_and_append.py
# Output: "Total rows in CSV: 20"

# Page 3 (rows 21-30)
# ... repeat ...
python parse_and_append.py
# Output: "Total rows in CSV: 30"

# Page 4 (rows 31-40)
# ... repeat ...
python parse_and_append.py
# Output: "Total rows in CSV: 40"
```

---

## 📊 Output Format

### Columns (17 total)
1. postUrl
2. imgUrl
3. type
4. postContent
5. likeCount
6. commentCount
7. repostCount
8. postDate
9. action
10. author
11. authorUrl
12. profileUrl
13. timestamp (ISO format: YYYY-MM-DDTHH:MM:SS.000Z)
14. viewCount
15. postTimestamp (ISO format: YYYY-MM-DDTHH:MM:SS.000Z)
16. videoUrl
17. sharedPostUrl

### Sample Output
```csv
postUrl,imgUrl,type,postContent,likeCount,...,timestamp,postTimestamp
https://www.linkedin.com/feed/update/urn:li:activity:123,https://...,Image,"Post content here...",90,0,3,4mo,Post,Akshar Shah,...,2025-06-16T22:13:00.000Z,2025-06-07T00:00:00.000Z
```

---

## 📁 Files

- **`parse_and_append.py`** - Main parser script
- **`html_input.txt`** - Your HTML input (you create this)
- **`linkedin_posts_combined.csv`** - Output CSV (auto-created)

---

## 🔧 Features

✅ Automatically converts timestamps to ISO format
✅ Appends data (no duplicates if you don't re-run same page)
✅ Handles multiline content correctly
✅ Shows progress after each run
✅ Preserves all 17 columns

---

## 🆕 Starting Fresh

To start a new CSV file:
```bash
del linkedin_posts_combined.csv
```

Then run the parser again.

---

## ⚠️ Troubleshooting

### "No data rows found in HTML!"
- Make sure you copied the full `<table>` element
- Check that `html_input.txt` contains HTML (not just text)

### "Headers don't match existing file!"
- You might be mixing data from different table formats
- Delete `linkedin_posts_combined.csv` and start fresh

### Wrong timestamp formats
- Timestamps are approximated from relative dates ("4mo", "1w")
- Dates should be accurate to the month

---

## 💡 Tips

1. **Always copy the full `<table>` element** - not just rows
2. **Save each page before moving to next** - to avoid losing data
3. **Check row count after each run** - to verify data was added
4. **Don't edit html_input.txt manually** - always paste fresh HTML

---

## 📞 Need Help?

If you encounter issues:
1. Check that your HTML starts with `<table`
2. Verify you see `<thead>` and `<tbody>` sections
3. Make sure all `data-testid` attributes are present

