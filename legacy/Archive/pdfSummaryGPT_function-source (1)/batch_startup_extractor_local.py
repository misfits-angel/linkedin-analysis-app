"""
Local Startup Information Extractor
Processes all PDFs in a LOCAL folder and extracts:
- File name
- Startup name
- Founder names

This version works with local PDFs (no Google Drive needed)
"""

import re
import csv
import os
import sys
from pathlib import Path
from typing import Dict, List
from datetime import datetime


def extract_startup_info_with_rules(content: str, file_name: str) -> Dict:
    """
    Extract startup name and founder names using regex patterns and heuristics.
    This works without requiring API calls.
    
    Args:
        content: Extracted text from PDF
        file_name: Name of the PDF file
    
    Returns:
        Dict with startup_name, founders, and extraction_method
    """
    result = {
        "file_name": file_name,
        "startup_name": "",
        "founders": [],
        "extraction_method": "rules"
    }
    
    # Clean content
    content = content[:5000]  # Limit to first 5000 chars for efficiency
    
    # Try to extract startup name from filename
    # Pattern: remove .pdf and common suffixes
    potential_name = file_name.replace(".pdf", "").replace("_", " ").replace("-", " ").strip()
    if potential_name and len(potential_name) > 2:
        result["startup_name"] = potential_name
    
    # Pattern 1: Look for "Founders:" or "Founded by:" sections
    founders_patterns = [
        r'[Ff]ounders?:\s*([^\n]+)',
        r'[Ff]ounded\s+by:\s*([^\n]+)',
        r'[Ll]ed\s+by:\s*([^\n]+)',
        r'[Tt]eam:\s*([^\n]+)',
        r'[Mm]anagement\s+[Tt]eam:\s*([^\n]+)',
    ]
    
    for pattern in founders_patterns:
        matches = re.findall(pattern, content)
        if matches:
            # Extract names from the matched text
            for match in matches:
                # Split by comma or "and"
                names = re.split(r',\s*|and\s+|\&\s*', match)
                for name in names:
                    name = name.strip()
                    # Filter: name should be 2+ words (first name + last name)
                    if name and len(name.split()) >= 2 and len(name) > 3:
                        result["founders"].append(name)
            if result["founders"]:
                break  # Found founders, stop looking
    
    # Pattern 2: Look for capitalized names (common naming patterns)
    # Look for patterns like "John Smith" or "Dr. Jane Doe"
    if not result["founders"]:
        name_pattern = r'([A-Z][a-z]+ (?:(?:[A-Z]\.?\s+)?[A-Z][a-z]+)+)'
        potential_names = re.findall(name_pattern, content[:2000])
        
        # Filter common words that aren't names
        common_words = {'Executive', 'Founder', 'CEO', 'President', 'Chairman', 'Director', 'Team'}
        for name in potential_names[:5]:  # Take top 5
            if not any(word in name for word in common_words):
                if name not in result["founders"]:
                    result["founders"].append(name)
    
    # Remove duplicates
    result["founders"] = list(set(result["founders"]))
    
    return result


def extract_startup_info_with_gemini(content: str, file_name: str) -> Dict:
    """
    Use Gemini API to extract startup name and founder names.
    This is used when rule-based extraction doesn't find enough info.
    
    Args:
        content: Extracted text from PDF
        file_name: Name of the PDF file
    
    Returns:
        Dict with startup_name, founders, and extraction_method
    """
    try:
        import google.generativeai as genai
        
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            print("⚠️  GEMINI_API_KEY not set. Skipping Gemini extraction.")
            return {
                "file_name": file_name,
                "startup_name": "Unknown",
                "founders": [],
                "extraction_method": "failed"
            }
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        extraction_prompt = f"""
Extract the following information from this pitch deck text:

1. Startup/Company Name: The official name of the company
2. Founder Names: All individual founders mentioned (just names, as a list)

Respond ONLY in this JSON format, no other text:
{{
    "startup_name": "company name here",
    "founders": ["founder1", "founder2", "founder3"]
}}

TEXT:
{content[:4000]}
"""
        
        response = model.generate_content(extraction_prompt)
        response_text = response.text.strip()
        
        # Parse JSON from response
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        
        if start_idx != -1 and end_idx > start_idx:
            import json
            json_str = response_text[start_idx:end_idx]
            extracted_data = json.loads(json_str)
            
            return {
                "file_name": file_name,
                "startup_name": extracted_data.get("startup_name", ""),
                "founders": extracted_data.get("founders", []),
                "extraction_method": "gemini"
            }
        else:
            raise ValueError("No JSON in response")
    
    except Exception as e:
        print(f"❌ Error with Gemini extraction: {e}")
        return {
            "file_name": file_name,
            "startup_name": "Error",
            "founders": [],
            "extraction_method": "error"
        }


def extract_text_from_pdf_pdfplumber(pdf_path: str) -> str:
    """
    Extract text from PDF using pdfplumber (doesn't require API).
    """
    try:
        import pdfplumber
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text
    except Exception as e:
        print(f"      ⚠️  pdfplumber error: {str(e)[:50]}")
        return ""


def extract_startup_info(pdf_path: str, use_gemini_fallback: bool = True) -> Dict:
    """
    Extract startup info using rules first, then optionally fall back to Gemini.
    
    Args:
        pdf_path: Path to the PDF file
        use_gemini_fallback: If True and rules find nothing, try Gemini API
    
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
            "startup_name": "Error",
            "founders": [],
            "extraction_method": "failed"
        }
    
    print("✓")
    
    # Try rule-based extraction first
    result = extract_startup_info_with_rules(content, file_name)
    
    # Check if we got good results
    has_startup_name = result["startup_name"] and result["startup_name"] != "Unknown"
    has_founders = len(result["founders"]) > 0
    
    if has_startup_name and has_founders:
        print(f"   ✅ Found using rules: {result['startup_name']} ({len(result['founders'])} founders)")
        return result
    
    # Fallback to Gemini if needed
    if use_gemini_fallback:
        print(f"   🤖 Rules incomplete, trying Gemini API...")
        gemini_result = extract_startup_info_with_gemini(content, file_name)
        
        # Use Gemini result if it's better
        if gemini_result["startup_name"] and gemini_result["startup_name"] != "Error":
            print(f"   ✅ Found using Gemini: {gemini_result['startup_name']} ({len(gemini_result['founders'])} founders)")
            return gemini_result
    
    # Return rule-based result even if incomplete
    print(f"   ⚠️  Partial data: {result['startup_name']} ({len(result['founders'])} founders)")
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
    
    return [str(f) for f in pdf_files]


def process_all_pdfs_in_folder(folder_path: str, use_gemini: bool = False, output_csv: str = None):
    """
    Process all PDFs in a local folder and export to CSV.
    
    Args:
        folder_path: Local folder path containing PDFs
        use_gemini: If True, use Gemini API as fallback for incomplete extractions
        output_csv: Output CSV file path (default: startup_founders_data.csv in current dir)
    
    Returns:
        Path to the generated CSV file and list of extracted data
    """
    print("\n" + "="*60)
    print("🚀 BATCH STARTUP EXTRACTOR (LOCAL MODE)")
    print("="*60)
    
    # Get all PDFs
    pdf_files = get_all_pdfs_from_folder(folder_path)
    
    if not pdf_files:
        print("❌ No PDFs found in folder!")
        return None, []
    
    # Set output CSV path
    if not output_csv:
        output_csv = "startup_founders_data.csv"
    
    print(f"\n📊 Processing {len(pdf_files)} PDFs...")
    print(f"   Output: {output_csv}\n")
    
    all_results = []
    successful = 0
    failed = 0
    
    # Process each PDF
    for idx, pdf_file in enumerate(pdf_files, 1):
        try:
            print(f"[{idx}/{len(pdf_files)}] ", end="")
            
            # Extract startup info
            result = extract_startup_info(pdf_file, use_gemini_fallback=use_gemini)
            all_results.append(result)
            successful += 1
            
        except Exception as e:
            print(f"❌ Error: {str(e)[:50]}")
            all_results.append({
                "file_name": os.path.basename(pdf_file),
                "startup_name": "Error",
                "founders": [],
                "extraction_method": "failed"
            })
            failed += 1
    
    # Write CSV
    print(f"\n💾 Writing results to CSV...")
    write_results_to_csv(output_csv, all_results)
    
    # Summary
    print("\n" + "="*60)
    print("📈 PROCESSING SUMMARY")
    print("="*60)
    print(f"✅ Successful: {successful}/{len(pdf_files)}")
    print(f"❌ Failed: {failed}/{len(pdf_files)}")
    print(f"📊 CSV File: {output_csv}")
    print(f"📝 Total Records: {len(all_results)}")
    print("="*60 + "\n")
    
    return output_csv, all_results


def write_results_to_csv(csv_path: str, results: List[Dict]):
    """
    Write extraction results to CSV file.
    
    Args:
        csv_path: Path to output CSV file
        results: List of extraction results
    """
    try:
        # Create directory if needed
        os.makedirs(os.path.dirname(csv_path) or ".", exist_ok=True)
        
        with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['file_name', 'startup_name', 'founders', 'extraction_method']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            
            for result in results:
                # Convert founders list to comma-separated string
                founders_str = ", ".join(result.get("founders", []))
                
                writer.writerow({
                    'file_name': result.get("file_name", ""),
                    'startup_name': result.get("startup_name", ""),
                    'founders': founders_str,
                    'extraction_method': result.get("extraction_method", "")
                })
        
        print(f"   ✅ Wrote {len(results)} records to CSV")
    
    except Exception as e:
        print(f"   ❌ Error writing CSV: {e}")


if __name__ == "__main__":
    
    if len(sys.argv) < 2:
        print("\n❌ Usage: python batch_startup_extractor_local.py <FOLDER_PATH> [--gemini] [--output CSV_PATH]\n")
        print("Example:")
        print('  python batch_startup_extractor_local.py "C:\\Users\\anrg2\\Downloads\\Pitch decks"')
        print('  python batch_startup_extractor_local.py "C:\\Users\\anrg2\\Downloads\\Pitch decks" --gemini')
        print('  python batch_startup_extractor_local.py "C:\\Users\\anrg2\\Downloads\\Pitch decks" --output results.csv\n')
        sys.exit(1)
    
    folder_path = sys.argv[1]
    use_gemini = "--gemini" in sys.argv
    output_csv = None
    
    # Parse --output argument
    if "--output" in sys.argv:
        idx = sys.argv.index("--output")
        if idx + 1 < len(sys.argv):
            output_csv = sys.argv[idx + 1]
    
    # Run extraction
    csv_path, results = process_all_pdfs_in_folder(
        folder_path=folder_path,
        use_gemini=use_gemini,
        output_csv=output_csv
    )
    
    if csv_path:
        print(f"✨ Done! Check {csv_path}")
