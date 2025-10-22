#!/usr/bin/env python3
"""
Detailed debug script to identify Gemini API issues
"""
import os, csv, json, time, sys
from pathlib import Path
import pdfplumber
import google.generativeai as genai

api_key = "AIzaSyCVUY23QoKhrmyvhGEH-NFvRokgg0MNdCw"
pdf_folder = r"C:\Users\anrg2\Downloads\Pitch decks"

print("="*70)
print("🔍 GEMINI API DEBUG TEST")
print("="*70)
print(f"API Key: {api_key[:20]}...")
print(f"Model: gemini-2.5-flash-lite")
print(f"Library: google.generativeai\n")

# Check library version
try:
    import google.generativeai
    print(f"google-generativeai version: {google.generativeai.__version__ if hasattr(google.generativeai, '__version__') else 'unknown'}\n")
except:
    pass

genai.configure(api_key=api_key)

# Get unprocessed PDFs
processed = set()
try:
    with open("startup_founders_complete.csv", 'r', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            processed.add(row.get('file_name', ''))
except Exception as e:
    print(f"Warning: Could not read CSV: {e}\n")

all_pdfs = sorted(Path(pdf_folder).glob("*.pdf"))
test_pdfs = [p for p in all_pdfs if p.name not in processed][:3]

print(f"✅ Total PDFs: {len(all_pdfs)}")
print(f"✅ Already processed: {len(processed)}")
print(f"✅ Testing with: {len(test_pdfs)} files\n")

for pdf_idx, pdf_path in enumerate(test_pdfs, 1):
    print(f"\n{'='*70}")
    print(f"TEST {pdf_idx}/{len(test_pdfs)}: {pdf_path.name}")
    print(f"{'='*70}\n")
    
    # Step 1: Extract text
    print(f"[STEP 1] Extracting text...")
    text = ""
    try:
        with pdfplumber.open(str(pdf_path)) as pdf:
            pages = len(pdf.pages)
            print(f"   ✅ PDF loaded: {pages} pages")
            
            for page_num, page in enumerate(pdf.pages, 1):
                try:
                    t = page.extract_text()
                    if t:
                        text += t
                        print(f"      Page {page_num}: {len(t)} chars extracted")
                    else:
                        print(f"      Page {page_num}: 0 chars (empty page)")
                except Exception as e:
                    print(f"      Page {page_num}: ❌ Error: {str(e)[:50]}")
    except Exception as e:
        print(f"   ❌ PDF open error: {e}")
        continue
    
    print(f"\n   Total text: {len(text)} characters")
    
    if len(text) < 20:
        print(f"   ⚠️  Not enough text")
        continue
    
    # Step 2: Create model
    print(f"\n[STEP 2] Creating Gemini model...")
    try:
        model = genai.GenerativeModel('gemini-2.5-flash-lite')
        print(f"   ✅ Model created successfully")
    except Exception as e:
        print(f"   ❌ Model creation failed: {e}")
        print(f"      Error type: {type(e).__name__}")
        continue
    
    # Step 3: Create prompt
    print(f"\n[STEP 3] Creating prompt...")
    prompt = f"""Extract JSON:
{{"startup_name": "Name", "industry": "Ind", "business_model": "B2B", "founders": [{{"name": "Name", "linkedin_profile": null}}]}}

TEXT: {text[:1500]}"""
    print(f"   ✅ Prompt created ({len(prompt)} chars)")
    
    # Step 4: Call Gemini
    print(f"\n[STEP 4] Calling generate_content...")
    print(f"   Sending request to Gemini...")
    
    try:
        start_time = time.time()
        print(f"   ⏳ Waiting for response...", end="", flush=True)
        
        response = model.generate_content(prompt)
        
        elapsed = time.time() - start_time
        print(f"\r   ✅ Response received in {elapsed:.1f}s")
        
        # Step 5: Parse response
        print(f"\n[STEP 5] Parsing response...")
        print(f"   Response type: {type(response)}")
        print(f"   Response attributes: {dir(response)[:5]}...")
        
        try:
            resp_text = response.text
            print(f"   ✅ response.text retrieved: {len(resp_text)} chars")
            print(f"   First 200 chars: {resp_text[:200]}")
        except AttributeError as ae:
            print(f"   ❌ No 'text' attribute: {ae}")
            print(f"   Trying alternative access...")
            try:
                resp_text = str(response)
                print(f"   Using str(response): {resp_text[:200]}")
            except Exception as e2:
                print(f"   ❌ Also failed: {e2}")
                continue
        
        # Step 6: Extract JSON
        print(f"\n[STEP 6] Extracting JSON...")
        start = resp_text.find('{')
        end = resp_text.rfind('}') + 1
        print(f"   JSON start: {start}, end: {end}")
        
        if start != -1 and end > start:
            json_str = resp_text[start:end]
            print(f"   JSON string ({len(json_str)} chars): {json_str[:150]}...")
            
            try:
                data = json.loads(json_str)
                print(f"   ✅ JSON parsed successfully!")
                print(f"      Startup: {data.get('startup_name')}")
                print(f"      Industry: {data.get('industry')}")
                print(f"      Founders: {len(data.get('founders', []))} found")
            except json.JSONDecodeError as je:
                print(f"   ❌ JSON parse error: {je}")
        else:
            print(f"   ❌ Could not find JSON markers")
    
    except Exception as e:
        print(f"\n   ❌ API CALL FAILED!")
        print(f"      Error: {e}")
        print(f"      Error type: {type(e).__name__}")
        print(f"      Full traceback:")
        import traceback
        traceback.print_exc()
    
    if pdf_idx < len(test_pdfs):
        print(f"\n   ⏳ Waiting 5 seconds before next test...")
        time.sleep(5)

print(f"\n{'='*70}")
print(f"✅ Debug test complete!")
print(f"{'='*70}")
