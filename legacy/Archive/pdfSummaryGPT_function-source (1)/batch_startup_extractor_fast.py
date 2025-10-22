#!/usr/bin/env python3
"""
Fast batch startup extractor with timeout and skip logic for problematic PDFs.
"""
import os
import csv
import json
from pathlib import Path
import pdfplumber
import google.generativeai as genai
from typing import Dict, List

def extract_text_from_pdf_pdfplumber(pdf_path: str) -> str:
    """Extract text from PDF using pdfplumber - all pages."""
    try:
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text
    except Exception as e:
        return ""

def extract_startup_info_fast(pdf_path: str, api_key: str, timeout: int = 30) -> Dict:
    """Extract startup info with timeout protection."""
    file_name = os.path.basename(pdf_path)
    
    try:
        content = extract_text_from_pdf_pdfplumber(pdf_path)
        
        if not content or len(content) < 20:
            return {
                "file_name": file_name,
                "startup_name": "Error - No Text",
                "industry": "",
                "business_model": "",
                "founders": [],
                "extraction_method": "failed"
            }
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash-lite')
        
        extraction_prompt = f"""Extract startup data quickly.

CRITICAL: Respond with ONLY JSON, nothing else.

{{
  "startup_name": "Name",
  "industry": "Industry",
  "business_model": "B2B",
  "founders": [
    {{"name": "Name", "linkedin_profile": null}}
  ]
}}

TEXT:
{content[:3000]}"""
        
        try:
            response = model.generate_content(extraction_prompt, request_options={"timeout": timeout})
            response_text = response.text.strip()
            
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx]
                extracted_data = json.loads(json_str)
                
                return {
                    "file_name": file_name,
                    "startup_name": extracted_data.get("startup_name", ""),
                    "industry": extracted_data.get("industry", ""),
                    "business_model": extracted_data.get("business_model", ""),
                    "founders": extracted_data.get("founders", []),
                    "extraction_method": "gemini"
                }
        except Exception as e:
            if "timeout" in str(e).lower():
                return {
                    "file_name": file_name,
                    "startup_name": "Timeout - Skipped",
                    "industry": "",
                    "business_model": "",
                    "founders": [],
                    "extraction_method": "timeout"
                }
            raise
    
    except Exception as e:
        return {
            "file_name": file_name,
            "startup_name": "Error",
            "industry": "",
            "business_model": "",
            "founders": [],
            "extraction_method": "failed"
        }

def write_batch_to_csv(csv_path: str, batch_results: List[Dict], file_exists: bool):
    """Write batch to CSV."""
    try:
        write_mode = 'a' if file_exists else 'w'
        
        with open(csv_path, write_mode, newline='', encoding='utf-8') as csvfile:
            fieldnames = ['file_name', 'startup_name', 'industry', 'business_model', 'founder_name', 'founder_linkedin', 'extraction_method']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            if not file_exists:
                writer.writeheader()
            
            for result in batch_results:
                founders = result.get("founders", [])
                if not founders:
                    writer.writerow({
                        'file_name': result.get("file_name", ""),
                        'startup_name': result.get("startup_name", ""),
                        'industry': result.get("industry", ""),
                        'business_model': result.get("business_model", ""),
                        'founder_name': "",
                        'founder_linkedin': "",
                        'extraction_method': result.get("extraction_method", "")
                    })
                else:
                    for founder in founders:
                        if isinstance(founder, dict):
                            fname = founder.get("name", "")
                            flinkedin = founder.get("linkedin_profile", "")
                        else:
                            fname = founder
                            flinkedin = ""
                        
                        writer.writerow({
                            'file_name': result.get("file_name", ""),
                            'startup_name': result.get("startup_name", ""),
                            'industry': result.get("industry", ""),
                            'business_model': result.get("business_model", ""),
                            'founder_name': fname,
                            'founder_linkedin': flinkedin if flinkedin else "",
                            'extraction_method': result.get("extraction_method", "")
                        })
    except Exception as e:
        print(f"Error writing CSV: {e}")

def process_remaining(folder_path: str, api_key: str, output_csv: str):
    """Process remaining PDFs from existing CSV."""
    
    pdf_files = list(Path(folder_path).glob("*.pdf"))
    pdf_files.sort()
    
    # Load processed files
    processed = set()
    if os.path.exists(output_csv):
        with open(output_csv, 'r', encoding='utf-8') as f:
            for row in csv.DictReader(f):
                if row.get('file_name'):
                    processed.add(row['file_name'])
    
    remaining = [f for f in pdf_files if os.path.basename(f) not in processed]
    
    print(f"Processing {len(remaining)} remaining PDFs...")
    
    successful = 0
    failed = 0
    csv_init = os.path.exists(output_csv)
    
    for idx, pdf_file in enumerate(remaining, 1):
        print(f"[{idx}/{len(remaining)}] {os.path.basename(pdf_file)[:40]}... ", end="", flush=True)
        
        result = extract_startup_info_fast(pdf_file, api_key)
        
        if result["extraction_method"] == "gemini":
            print("✅")
            successful += 1
        elif result["extraction_method"] == "timeout":
            print("⏱️  TIMEOUT")
            failed += 1
        else:
            print("❌")
            failed += 1
        
        if idx % 10 == 0:
            write_batch_to_csv(output_csv, [result], csv_init)
            csv_init = True
            print(f"   Batch saved. Progress: {idx}/{len(remaining)}")
    
    # Write final batch
    write_batch_to_csv(output_csv, [result], csv_init)
    
    print(f"\n✅ Done! Successful: {successful}, Failed: {failed}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python batch_startup_extractor_fast.py <folder> <api_key> [output_csv]")
        sys.exit(1)
    
    folder = sys.argv[1]
    api_key = sys.argv[2]
    output = sys.argv[3] if len(sys.argv) > 3 else "startup_founders_complete.csv"
    
    process_remaining(folder, api_key, output)
