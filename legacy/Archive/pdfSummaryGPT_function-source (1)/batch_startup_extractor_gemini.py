"""
Local Startup Information Extractor - Gemini Version
Processes all PDFs in a LOCAL folder and extracts:
- File name
- Startup name
- Founder names

Uses Gemini 2.5 Flash Lite for accurate extraction
"""

import re
import csv
import os
import sys
import json
from pathlib import Path
from typing import Dict, List


def extract_text_from_pdf_pdfplumber(pdf_path: str) -> str:
    """
    Extract text from PDF using pdfplumber - ALL PAGES.
    """
    try:
        import pdfplumber
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            # Get ALL pages for complete context
            for page_num, page in enumerate(pdf.pages):
                page_text = page.extract_text() or ""
                if page_text.strip():  # Only add non-empty pages
                    text += f"\n--- PAGE {page_num + 1} ---\n{page_text}"
        return text
    except Exception as e:
        print(f"      ⚠️  Text extraction error: {str(e)[:50]}")
        return ""


def extract_startup_info_with_gemini(content: str, file_name: str, api_key: str) -> Dict:
    """
    Use Gemini 2.5 Flash Lite to extract startup name and founder names.
    
    Args:
        content: Extracted text from PDF
        file_name: Name of the PDF file
        api_key: Gemini API key
    
    Returns:
        Dict with startup_name, founders, and extraction_method
    """
    try:
        import google.generativeai as genai
        
        if not api_key:
            print("❌ GEMINI_API_KEY not provided")
            return {
                "file_name": file_name,
                "startup_name": "Error - No API Key",
                "founders": [],
                "extraction_method": "failed"
            }
        
        genai.configure(api_key=api_key)
        
        # Use Gemini 2.5 Flash Lite
        model = genai.GenerativeModel('gemini-2.5-flash-lite')
        
        extraction_prompt = f"""You are an expert at extracting startup information from pitch decks.

CRITICAL: You MUST respond with ONLY valid JSON, nothing else. No markdown, no explanations, no code blocks.

TASK: Extract the following from the COMPLETE pitch deck:
1. Official startup name
2. Industry/Sector 
3. Business Model (B2B, B2C, B2B2C, D2C, etc.)
4. ALL founder names and their LinkedIn profiles

EXTRACTION RULES:
- Extract ONLY actual founder/co-founder names
- For LinkedIn: search for "linkedin.com/in/[username]" URLs
- If LinkedIn not found, use null
- If field is not found, use empty string ""
- Industry examples: FinTech, EdTech, HealthTech, AgriTech, AI/ML, SaaS, Logistics or whatever is relevant
- Business Model examples: B2B, B2C, B2B2C, D2C, Marketplace or whatever is relevant

RESPONSE FORMAT - STRICT JSON ONLY (no other text):

{{
  "startup_name": "Company Name Here",
  "industry": "Industry/Sector Here",
  "business_model": "B2B or B2C etc",
  "founders": [
    {{
      "name": "John Doe",
      "linkedin_profile": "https://linkedin.com/in/johndoe"
    }},
    {{
      "name": "Jane Smith",
      "linkedin_profile": null
    }}
  ]
}}

COMPLETE DOCUMENT TEXT:
{content}"""
        
        print(f"      🤖 Calling Gemini... ", end="", flush=True)
        response = model.generate_content(extraction_prompt)
        
        print("✓")
        
        # Parse JSON from response
        start_idx = response.text.find('{')
        end_idx = response.text.rfind('}') + 1
        
        if start_idx != -1 and end_idx > start_idx:
            json_str = response.text[start_idx:end_idx]
            extracted_data = json.loads(json_str)
            
            return {
                "file_name": file_name,
                "startup_name": extracted_data.get("startup_name", ""),
                "industry": extracted_data.get("industry", ""),
                "business_model": extracted_data.get("business_model", ""),
                "founders": extracted_data.get("founders", []),
                "extraction_method": "gemini"
            }
        else:
            raise ValueError("Could not find JSON in Gemini response")
    
    except Exception as e:
        print(f"❌ Gemini error: {str(e)[:100]}")
        return {
            "file_name": file_name,
            "startup_name": "Error",
            "founders": [],
            "extraction_method": "error"
        }


def extract_startup_info(pdf_path: str, api_key: str) -> Dict:
    """
    Extract startup info using Gemini API.
    
    Args:
        pdf_path: Path to the PDF file
        api_key: Gemini API key
    
    Returns:
        Dict with startup_name, founders, extraction_method
    """
    file_name = os.path.basename(pdf_path)
    print(f"\n📄 Processing: {file_name}")
    
    # Extract text from PDF
    print(f"   Extracting text... ", end="", flush=True)
    content = extract_text_from_pdf_pdfplumber(pdf_path)
    
    if not content:
        print("❌ Could not extract text")
        return {
            "file_name": file_name,
            "startup_name": "Error - No Text",
            "founders": [],
            "extraction_method": "failed"
        }
    
    print("✓")
    
    # Extract using Gemini
    result = extract_startup_info_with_gemini(content, file_name, api_key)
    
    # Display result
    if result["extraction_method"] == "gemini":
        founders = result['founders']
        if founders:
            if isinstance(founders[0], dict):
                # New format with name and linkedin_profile
                founder_names = [f.get('name', '') for f in founders]
                display_names = ", ".join(founder_names)
            else:
                # Old format with just names
                display_names = ", ".join(founders)
            print(f"   ✅ {result['startup_name']} | {result.get('industry', 'N/A')} | {result.get('business_model', 'N/A')} | {len(founders)} founders: {display_names}")
        else:
            print(f"   ✅ {result['startup_name']} | {result.get('industry', 'N/A')} | {result.get('business_model', 'N/A')} | No founders found")
    else:
        print(f"   ⚠️  Failed to extract")
    
    return result


def get_all_pdfs_from_folder(folder_path: str) -> List[str]:
    """
    Get all PDF files from a local folder.
    
    Args:
        folder_path: Local folder path containing PDFs
    
    Returns:
        List of PDF file paths
    """
    print(f"\n🔍 Searching for PDFs in folder...")
    
    folder = Path(folder_path)
    if not folder.exists():
        print(f"   ❌ Folder not found: {folder_path}")
        return []
    
    pdf_files = list(folder.glob("*.pdf"))
    print(f"   Found {len(pdf_files)} PDFs")
    
    return sorted([str(f) for f in pdf_files])


def process_all_pdfs_in_folder(folder_path: str, api_key: str, output_csv: str = None, limit: int = None):
    """
    Process all PDFs in folder and extract startup information.
    Writes results to CSV in batches to avoid data loss.
    
    Args:
        folder_path: Path to folder containing PDFs
        api_key: Gemini API key
        output_csv: Output CSV file path
        limit: Limit number of PDFs to process (for testing)
    """
    
    # Get all PDF files
    pdf_files = list(Path(folder_path).glob("*.pdf"))
    pdf_files.sort()
    
    if not pdf_files:
        print("❌ No PDF files found in folder")
        return
    
    # Load already processed files from CSV to resume
    processed_files = set()
    if os.path.exists(output_csv):
        try:
            with open(output_csv, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row.get('file_name'):
                        processed_files.add(row['file_name'])
            print(f"🔄 Resuming from previous run - {len(processed_files)} PDFs already processed")
        except Exception as e:
            print(f"⚠️  Could not read existing CSV: {e}")
    
    # Filter out already processed files
    remaining_files = [f for f in pdf_files if os.path.basename(f) not in processed_files]
    print(f"📝 Remaining to process: {len(remaining_files)}/{len(pdf_files)}")
    
    pdf_files = remaining_files
    
    if limit:
        all_pdfs = list(Path(folder_path).glob("*.pdf"))
        all_pdfs_count = len(all_pdfs)
        pdf_files = all_pdfs[:limit]
        print(f"🔍 Searching for PDFs in folder...")
        print(f"   Found {all_pdfs_count} PDFs total")
        print(f"   Testing with first {limit} PDFs")
    else:
        print("\n" + "="*60)
        print("🚀 BATCH STARTUP EXTRACTOR (GEMINI 2.5 FLASH LITE)")
        print("="*60)
        print(f"🔍 Searching for PDFs in folder...")
        print(f"   Found {len(pdf_files)} PDFs")
    
    if not output_csv:
        output_csv = "startup_founders_complete.csv"
    
    print(f"\n📊 Processing {len(pdf_files)} PDFs in batches of 10...")
    print(f"   Output: {output_csv}")
    print(f"   💾 CSV will be updated after each batch!\n")
    
    # Initialize CSV with header on first batch
    csv_initialized = False
    batch_size = 10
    successful = 0
    failed = 0
    
    # Process PDFs in batches
    for batch_start in range(0, len(pdf_files), batch_size):
        batch_end = min(batch_start + batch_size, len(pdf_files))
        batch_pdfs = pdf_files[batch_start:batch_end]
        batch_results = []
        
        # Process this batch
        for idx, pdf_file in enumerate(batch_pdfs, batch_start + 1):
            try:
                print(f"[{idx}/{len(pdf_files)}] ", end="")
                
                # Extract startup info
                result = extract_startup_info(pdf_file, api_key)
                batch_results.append(result)
                
                if result["extraction_method"] == "gemini":
                    successful += 1
                else:
                    failed += 1
                
            except Exception as e:
                print(f"❌ Error: {str(e)[:50]}")
                batch_results.append({
                    "file_name": os.path.basename(pdf_file),
                    "startup_name": "Error",
                    "industry": "",
                    "business_model": "",
                    "founders": [],
                    "extraction_method": "failed"
                })
                failed += 1
        
        # Write this batch to CSV (append mode)
        print(f"\n   💾 Writing batch {batch_start//batch_size + 1} to CSV...")
        write_batch_to_csv(output_csv, batch_results, csv_initialized)
        csv_initialized = True
        print(f"   ✅ Batch saved! Progress: {min(batch_end, len(pdf_files))}/{len(pdf_files)} PDFs\n")
    
    # Final summary
    print("\n" + "="*60)
    print("📈 PROCESSING SUMMARY")
    print("="*60)
    print(f"✅ Successful: {successful}/{len(pdf_files)}")
    print(f"❌ Failed: {failed}/{len(pdf_files)}")
    print(f"📊 CSV File: {output_csv}")
    print("="*60 + "\n")
    
    return output_csv


def write_batch_to_csv(csv_path: str, batch_results: List[Dict], file_exists: bool):
    """
    Write a batch of results to CSV file.
    If file doesn't exist, create it with header.
    If file exists, append to it.
    
    Args:
        csv_path: Path to output CSV file
        batch_results: List of extraction results for this batch
        file_exists: Whether the CSV file already has a header
    """
    try:
        # Create directory if needed
        os.makedirs(os.path.dirname(csv_path) or ".", exist_ok=True)
        
        # Determine write mode
        write_mode = 'a' if file_exists else 'w'
        
        with open(csv_path, write_mode, newline='', encoding='utf-8') as csvfile:
            fieldnames = ['file_name', 'startup_name', 'industry', 'business_model', 'founder_name', 'founder_linkedin', 'extraction_method']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            # Write header only for new file
            if not file_exists:
                writer.writeheader()
            
            total_founder_rows = 0
            
            for result in batch_results:
                file_name = result.get("file_name", "")
                startup_name = result.get("startup_name", "")
                industry = result.get("industry", "")
                business_model = result.get("business_model", "")
                extraction_method = result.get("extraction_method", "")
                founders = result.get("founders", [])
                
                # If founders list is empty, write one row with no founder info
                if not founders:
                    writer.writerow({
                        'file_name': file_name,
                        'startup_name': startup_name,
                        'industry': industry,
                        'business_model': business_model,
                        'founder_name': "",
                        'founder_linkedin': "",
                        'extraction_method': extraction_method
                    })
                    total_founder_rows += 1
                else:
                    # Write one row per founder
                    for founder in founders:
                        # Handle both old format (string) and new format (dict)
                        if isinstance(founder, dict):
                            founder_name = founder.get("name", "")
                            founder_linkedin = founder.get("linkedin_profile", "")
                        else:
                            founder_name = founder
                            founder_linkedin = ""
                        
                        writer.writerow({
                            'file_name': file_name,
                            'startup_name': startup_name,
                            'industry': industry,
                            'business_model': business_model,
                            'founder_name': founder_name,
                            'founder_linkedin': founder_linkedin if founder_linkedin else "",
                            'extraction_method': extraction_method
                        })
                        total_founder_rows += 1
    
    except Exception as e:
        print(f"   ❌ Error writing CSV: {e}")


if __name__ == "__main__":
    
    if len(sys.argv) < 2:
        print("\n❌ Usage: python batch_startup_extractor_gemini.py <FOLDER_PATH> <GEMINI_API_KEY> [--limit N] [--output CSV_PATH]\n")
        print("Example:")
        print('  python batch_startup_extractor_gemini.py "C:\\Users\\anrg2\\Downloads\\Pitch decks" "AIzaSy..."')
        print('  python batch_startup_extractor_gemini.py "C:\\Users\\anrg2\\Downloads\\Pitch decks" "AIzaSy..." --limit 5')
        print('  python batch_startup_extractor_gemini.py "C:\\Users\\anrg2\\Downloads\\Pitch decks" "AIzaSy..." --output results.csv\n')
        sys.exit(1)
    
    folder_path = sys.argv[1]
    api_key = sys.argv[2] if len(sys.argv) > 2 else None
    
    limit = None
    output_csv = None
    
    # Parse --limit argument
    if "--limit" in sys.argv:
        idx = sys.argv.index("--limit")
        if idx + 1 < len(sys.argv):
            try:
                limit = int(sys.argv[idx + 1])
            except ValueError:
                pass
    
    # Parse --output argument
    if "--output" in sys.argv:
        idx = sys.argv.index("--output")
        if idx + 1 < len(sys.argv):
            output_csv = sys.argv[idx + 1]
    
    # Run extraction
    csv_path = process_all_pdfs_in_folder(
        folder_path=folder_path,
        api_key=api_key,
        output_csv=output_csv,
        limit=limit
    )
    
    if csv_path:
        print(f"✨ Done! Check {csv_path}")
