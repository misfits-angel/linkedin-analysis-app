import csv
import os
import re
from pathlib import Path
from collections import OrderedDict

def extract_yc_batch(file_path):
    """Extract YC batch from file path (e.g., 'YC W24', 'YC S25')."""
    # Try to extract from filename patterns like "YC W24", "YC S25", etc.
    filename = os.path.basename(file_path)
    
    # Pattern to match YC batch: YC followed by letter and 2 digits
    match = re.search(r'YC\s*([WSFX])(\d{2})', filename, re.IGNORECASE)
    if match:
        season = match.group(1).upper()
        year = match.group(2)
        return f"YC {season}{year}"
    
    return ""

def read_csv_file(file_path, yc_batch):
    """Read a CSV file and return list of dictionaries with YC batch info."""
    founders = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                row['ycBatch'] = yc_batch
                founders.append(row)
        print(f"  [OK] Read {len(founders)} founders from {file_path} ({yc_batch})")
    except Exception as e:
        print(f"  [ERROR] Error reading {file_path}: {e}")
    return founders

def get_all_csv_files(base_path):
    """Get all CSV files in a directory recursively."""
    csv_files = []
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.endswith('.csv'):
                csv_files.append(os.path.join(root, file))
    return csv_files

def merge_founders():
    """Merge all founder CSV files, prioritizing USA list and removing duplicates."""
    
    # Dictionary to store unique founders by linkedinUrl
    all_founders = OrderedDict()
    
    # Statistics
    stats = {
        'usa_only': 0,
        'other': 0,
        'duplicates_skipped': 0
    }
    
    # Process USA Only files first
    print("\n" + "="*70)
    print("STEP 1: Processing USA Only files...")
    print("="*70)
    
    usa_path = Path("YC - alums/USA Only")
    if usa_path.exists():
        usa_files = get_all_csv_files(usa_path)
        for file_path in sorted(usa_files):
            yc_batch = extract_yc_batch(file_path)
            founders = read_csv_file(file_path, yc_batch)
            for founder in founders:
                linkedin_url = founder.get('linkedinUrl', '')
                if linkedin_url and linkedin_url not in all_founders:
                    all_founders[linkedin_url] = founder
                    stats['usa_only'] += 1
    
    print(f"\n[OK] Total USA founders: {stats['usa_only']}")
    
    # Process other files (YC 2024 and YC 2025 in main folder)
    print("\n" + "="*70)
    print("STEP 2: Processing other files (checking for duplicates)...")
    print("="*70)
    
    other_folders = ["YC - alums/YC 2024", "YC - alums/YC 2025"]
    
    for folder in other_folders:
        folder_path = Path(folder)
        if folder_path.exists():
            print(f"\nProcessing folder: {folder}")
            other_files = get_all_csv_files(folder_path)
            for file_path in sorted(other_files):
                yc_batch = extract_yc_batch(file_path)
                founders = read_csv_file(file_path, yc_batch)
                added_count = 0
                skipped_count = 0
                
                for founder in founders:
                    linkedin_url = founder.get('linkedinUrl', '')
                    if linkedin_url:
                        if linkedin_url not in all_founders:
                            all_founders[linkedin_url] = founder
                            stats['other'] += 1
                            added_count += 1
                        else:
                            stats['duplicates_skipped'] += 1
                            skipped_count += 1
                
                print(f"    Added: {added_count} new, Skipped: {skipped_count} duplicates")
    
    # Write master CSV
    print("\n" + "="*70)
    print("STEP 3: Writing master CSV file...")
    print("="*70)
    
    output_file = "YC - alums/master_founders_list.csv"
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['firstName', 'lastName', 'linkedinUrl', 'company', 'ycBatch']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_founders.values())
    
    print(f"\n[OK] Master CSV created: {output_file}")
    
    # Print final statistics
    print("\n" + "="*70)
    print("FINAL STATISTICS")
    print("="*70)
    print(f"USA Only founders:        {stats['usa_only']}")
    print(f"Additional founders:      {stats['other']}")
    print(f"Duplicates skipped:       {stats['duplicates_skipped']}")
    print(f"TOTAL UNIQUE FOUNDERS:    {len(all_founders)}")
    print("="*70 + "\n")
    
    return output_file

if __name__ == "__main__":
    print("\n" + "="*70)
    print("YC FOUNDERS MASTER LIST GENERATOR")
    print("="*70)
    
    output_file = merge_founders()
    
    print(f"[SUCCESS] Master list saved to: {output_file}")
    print("\nProcess complete!\n")


