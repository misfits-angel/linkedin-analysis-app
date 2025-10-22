#!/usr/bin/env python3
"""
Test script to verify Gemini 2.5 Flash Lite is working
"""
import os, csv, json, time
from pathlib import Path
import pdfplumber
import google.generativeai as genai

api_key = "AIzaSyCVUY23QoKhrmyvhGEH-NFvRokgg0MNdCw"
pdf_folder = r"C:\Users\anrg2\Downloads\Pitch decks"

print("🧪 Testing Gemini 2.5 Flash Lite API\n")
print(f"API Key: {api_key[:20]}...")
print(f"Model: gemini-2.5-flash-lite\n")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash-lite')

# Get first 2 unprocessed PDFs
processed = set()
with open("startup_founders_complete.csv", 'r', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        processed.add(row.get('file_name', ''))

all_pdfs = sorted(Path(pdf_folder).glob("*.pdf"))
test_pdfs = [p for p in all_pdfs if p.name not in processed][:2]

print(f"✅ Found {len(all_pdfs)} total PDFs")
print(f"✅ {len(processed)} already processed")
print(f"✅ Testing with {len(test_pdfs)} files\n")

for pdf_idx, pdf_path in enumerate(test_pdfs, 1):
    print(f"\n{'='*60}")
    print(f"Test {pdf_idx}/2: {pdf_path.name}")
    print(f"{'='*60}")
    
    # Extract text
    print("\n📄 Extracting text from PDF...")
    text = ""
    try:
        with pdfplumber.open(str(pdf_path)) as pdf:
            pages = len(pdf.pages)
            print(f"   ✅ PDF has {pages} pages")
            for page_num, page in enumerate(pdf.pages, 1):
                t = page.extract_text()
                if t:
                    text += t
                print(f"      Page {page_num}: {len(t) if t else 0} chars")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print(f"\n   Total text extracted: {len(text)} characters")
    
    if len(text) < 20:
        print(f"   ⚠️  Not enough text to process")
        continue
    
    # Call Gemini
    print(f"\n🤖 Calling Gemini API (gemini-2.5-flash-lite)...")
    print(f"   Sending {len(text[:2000])} characters of text...")
    
    prompt = f"""Extract startup information from this pitch deck text.

Respond ONLY with valid JSON in this format:
{{
  "startup_name": "Company Name",
  "industry": "Industry/Sector",
  "business_model": "B2B/B2C/etc",
  "founders": [
    {{"name": "Founder Name", "linkedin_profile": null}}
  ]
}}

TEXT:
{text[:2000]}"""
    
    try:
        print(f"   ⏳ Waiting for response...")
        start_time = time.time()
        response = model.generate_content(prompt)
        elapsed = time.time() - start_time
        
        print(f"   ✅ Response received in {elapsed:.1f} seconds")
        print(f"\n   Response text:\n{response.text[:500]}\n")
        
        resp_text = response.text.strip()
        start = resp_text.find('{')
        end = resp_text.rfind('}') + 1
        
        if start != -1 and end > start:
            json_str = resp_text[start:end]
            data = json.loads(json_str)
            
            print(f"   ✅ JSON parsed successfully!")
            print(f"      Startup: {data.get('startup_name', 'N/A')}")
            print(f"      Industry: {data.get('industry', 'N/A')}")
            print(f"      Business Model: {data.get('business_model', 'N/A')}")
            print(f"      Founders: {len(data.get('founders', []))} found")
        else:
            print(f"   ❌ Could not find JSON in response")
    
    except Exception as e:
        print(f"   ❌ API Error: {e}")
        print(f"      Error type: {type(e).__name__}")
    
    if pdf_idx < len(test_pdfs):
        print(f"\n⏳ Waiting 3 seconds before next test (rate limit protection)...")
        time.sleep(3)

print(f"\n{'='*60}")
print(f"✅ Test complete!")
print(f"{'='*60}")
