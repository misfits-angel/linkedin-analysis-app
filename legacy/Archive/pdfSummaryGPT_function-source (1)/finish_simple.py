#!/usr/bin/env python3
import os, csv, json, sys, time
from pathlib import Path
try:
    import pdfplumber
    import google.generativeai as genai
except:
    print("Missing dependencies!")
    sys.exit(1)

csv_file = "startup_founders_complete.csv"
pdf_folder = r"C:\Users\anrg2\Downloads\Pitch decks"
api_key = "AIzaSyCVUY23QoKhrmyvhGEH-NFvRokgg0MNdCw"

# Get processed
processed = set()
try:
    with open(csv_file, 'r', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            processed.add(row.get('file_name', ''))
except:
    pass

print(f"Processed: {len(processed)} files\n")

# Get remaining
all_pdfs = sorted(Path(pdf_folder).glob("*.pdf"))
remaining = [p for p in all_pdfs if p.name not in processed]

print(f"Remaining: {len(remaining)}\n")

if len(remaining) == 0:
    print("✅ All done!")
    sys.exit(0)

genai.configure(api_key=api_key)

for idx, pdf_path in enumerate(remaining, 1):
    fname = pdf_path.name
    print(f"[{idx}/{len(remaining)}] {fname[:40]}... ", end="", flush=True)
    
    try:
        # Extract text
        text = ""
        try:
            with pdfplumber.open(str(pdf_path)) as pdf:
                for page in pdf.pages:
                    t = page.extract_text()
                    if t:
                        text += t
        except:
            pass
        
        if not text or len(text) < 20:
            # Write error
            with open(csv_file, 'a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow([fname, 'Error - No Text', '', '', '', '', 'failed'])
            print("❌")
            continue
        
        # Call Gemini
        model = genai.GenerativeModel('gemini-2.5-flash-lite')
        prompt = f'Extract JSON: {{"startup_name": "", "industry": "", "business_model": "", "founders": [{{"name": "", "linkedin_profile": null}}]}}. TEXT: {text[:2000]}'
        
        try:
            response = model.generate_content(prompt)
            resp_text = response.text.strip()
            
            start = resp_text.find('{')
            end = resp_text.rfind('}') + 1
            
            if start != -1 and end > start:
                data = json.loads(resp_text[start:end])
                founders = data.get('founders', [])
                
                if not founders:
                    with open(csv_file, 'a', newline='', encoding='utf-8') as f:
                        writer = csv.writer(f)
                        writer.writerow([fname, data.get('startup_name', ''), data.get('industry', ''), data.get('business_model', ''), '', '', 'gemini'])
                else:
                    for founder in founders:
                        name = founder.get('name', '') if isinstance(founder, dict) else founder
                        linkedin = founder.get('linkedin_profile', '') if isinstance(founder, dict) else ''
                        with open(csv_file, 'a', newline='', encoding='utf-8') as f:
                            writer = csv.writer(f)
                            writer.writerow([fname, data.get('startup_name', ''), data.get('industry', ''), data.get('business_model', ''), name, linkedin if linkedin else '', 'gemini'])
                
                print("✅")
            else:
                raise ValueError("No JSON")
        except Exception as e:
            print(f"❌ {str(e)[:15]}")
    
    except Exception as e:
        print(f"❌ Error")
    
    if idx % 50 == 0:
        print(f"  Progress: {idx}/{len(remaining)}")
        time.sleep(2)

print(f"\n✅ Done!")
