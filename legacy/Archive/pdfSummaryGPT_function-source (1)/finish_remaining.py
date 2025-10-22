#!/usr/bin/env python3
"""
Simple script to finish the remaining PDFs
"""
import os, csv, json, sys
from pathlib import Path
import pdfplumber
import google.generativeai as genai

csv_file = "startup_founders_complete.csv"
pdf_folder = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\anrg2\Downloads\Pitch decks"
api_key = sys.argv[2] if len(sys.argv) > 2 else ""

# Get processed files
processed = set()
with open(csv_file, 'r', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        if row.get('file_name'):
            processed.add(row['file_name'])

print(f"Already processed: {len(processed)} files\n")

# Get remaining PDFs
all_pdfs = sorted(Path(pdf_folder).glob("*.pdf"))
remaining = [f for f in all_pdfs if os.path.basename(f) not in processed]

print(f"Processing {len(remaining)} remaining PDFs...")
genai.configure(api_key=api_key)

success_count = 0

for idx, pdf_path in enumerate(remaining, 1):
    fname = os.path.basename(pdf_path)
    print(f"[{idx}/{len(remaining)}] {fname[:50]}... ", end="", flush=True)
    
    try:
        # Extract text
        text = ""
        try:
            with pdfplumber.open(str(pdf_path)) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
        except:
            text = ""
        
        if not text or len(text) < 20:
            # Write error row
            with open(csv_file, 'a', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=['file_name', 'startup_name', 'industry', 'business_model', 'founder_name', 'founder_linkedin', 'extraction_method'])
                writer.writerow({'file_name': fname, 'startup_name': 'Error - No Text', 'extraction_method': 'failed'})
            print("❌")
            continue
        
        # Call Gemini
        model = genai.GenerativeModel('gemini-2.5-flash-lite')
        prompt = f"""Extract: startup name, industry, business model, founder names.
Respond ONLY with JSON:
{{"startup_name": "", "industry": "", "business_model": "", "founders": [{{"name": "", "linkedin_profile": null}}]}}

TEXT: {text[:3000]}"""
        
        try:
            response = model.generate_content(prompt, request_options={"timeout": 30})
            resp_text = response.text.strip()
            
            start_idx = resp_text.find('{')
            end_idx = resp_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx > start_idx:
                data = json.loads(resp_text[start_idx:end_idx])
                
                # Write rows
                founders = data.get('founders', [])
                if not founders:
                    with open(csv_file, 'a', newline='', encoding='utf-8') as f:
                        writer = csv.DictWriter(f, fieldnames=['file_name', 'startup_name', 'industry', 'business_model', 'founder_name', 'founder_linkedin', 'extraction_method'])
                        writer.writerow({
                            'file_name': fname,
                            'startup_name': data.get('startup_name', ''),
                            'industry': data.get('industry', ''),
                            'business_model': data.get('business_model', ''),
                            'extraction_method': 'gemini'
                        })
                else:
                    for founder in founders:
                        name = founder.get('name', '') if isinstance(founder, dict) else founder
                        linkedin = founder.get('linkedin_profile', '') if isinstance(founder, dict) else ''
                        with open(csv_file, 'a', newline='', encoding='utf-8') as f:
                            writer = csv.DictWriter(f, fieldnames=['file_name', 'startup_name', 'industry', 'business_model', 'founder_name', 'founder_linkedin', 'extraction_method'])
                            writer.writerow({
                                'file_name': fname,
                                'startup_name': data.get('startup_name', ''),
                                'industry': data.get('industry', ''),
                                'business_model': data.get('business_model', ''),
                                'founder_name': name,
                                'founder_linkedin': linkedin if linkedin else '',
                                'extraction_method': 'gemini'
                            })
                print("✅")
                success_count += 1
            else:
                raise ValueError("No JSON found")
        except Exception as e:
            if "timeout" in str(e).lower():
                print("⏱️")
            else:
                print(f"❌ {str(e)[:20]}")
    
    except Exception as e:
        print(f"❌ {str(e)[:20]}")
    
    if idx % 20 == 0:
        print(f"  Progress: {idx}/{len(remaining)}")

print(f"\n✅ Done! Processed {success_count}/{len(remaining)} successfully")
