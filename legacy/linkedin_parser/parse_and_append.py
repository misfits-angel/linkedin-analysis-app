import csv
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import re
import os

def parse_relative_date(date_str):
    """Convert relative dates like '4mo', '1w' to approximate months ago"""
    if not date_str:
        return 0
    if 'mo' in date_str:
        months = int(re.search(r'\d+', date_str).group())
        return months
    elif 'w' in date_str:
        weeks = int(re.search(r'\d+', date_str).group())
        return weeks / 4
    elif 'd' in date_str:
        days = int(re.search(r'\d+', date_str).group())
        return days / 30
    elif 'h' in date_str:
        return 0  # Same day
    return 0

def calculate_approximate_date(relative_date_str):
    """Convert relative date string like '9mo' to actual date"""
    if not relative_date_str or relative_date_str.strip() == '':
        return ''
    
    try:
        # Handle different formats
        if 'mo' in relative_date_str:
            months = int(re.search(r'\d+', relative_date_str).group())
            approx_date = datetime.now() - timedelta(days=months * 30)
        elif 'w' in relative_date_str:
            weeks = int(re.search(r'\d+', relative_date_str).group())
            approx_date = datetime.now() - timedelta(weeks=weeks)
        elif 'd' in relative_date_str:
            days = int(re.search(r'\d+', relative_date_str).group())
            approx_date = datetime.now() - timedelta(days=days)
        elif 'h' in relative_date_str:
            hours = int(re.search(r'\d+', relative_date_str).group())
            approx_date = datetime.now() - timedelta(hours=hours)
        elif 'y' in relative_date_str or 'yr' in relative_date_str:
            years = int(re.search(r'\d+', relative_date_str).group())
            approx_date = datetime.now() - timedelta(days=years * 365)
        else:
            return ''
        
        return approx_date.strftime('%Y-%m-%d')
    except:
        return ''

def convert_timestamp(timestamp_str, post_date_str):
    """Convert 'Today at HH:MM' to ISO format"""
    if not timestamp_str or timestamp_str == '':
        return ''
    
    months_ago = parse_relative_date(post_date_str)
    base_date = datetime.now() - timedelta(days=int(months_ago * 30))
    
    time_match = re.search(r'(\d+):(\d+)', timestamp_str)
    if time_match:
        hour = int(time_match.group(1))
        minute = int(time_match.group(2))
        result_date = base_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
    else:
        result_date = base_date.replace(hour=12, minute=0, second=0, microsecond=0)
    
    return result_date.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'

def convert_post_timestamp(post_timestamp_str, post_date_str):
    """Convert 'Dec 22, 2024' to ISO format"""
    if not post_timestamp_str or post_timestamp_str == '':
        return ''
    
    try:
        # Try parsing with full date format first (e.g., "Dec 22, 2024")
        date_obj = datetime.strptime(post_timestamp_str, "%b %d, %Y")
        return date_obj.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
    except:
        # Fallback: try old format without year (e.g., "Jun 07")
        try:
            months_ago = parse_relative_date(post_date_str)
            approximate_date = datetime.now() - timedelta(days=int(months_ago * 30))
            year = approximate_date.year
            
            date_obj = datetime.strptime(f"{post_timestamp_str} {year}", "%b %d %Y")
            if date_obj > datetime.now():
                date_obj = datetime.strptime(f"{post_timestamp_str} {year-1}", "%b %d %Y")
            return date_obj.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
        except:
            return ''

def parse_html_table(html_content):
    """Parse HTML table and return list of rows"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find all tables in the HTML
    tables = soup.find_all('table')
    
    if not tables:
        print("No tables found in HTML content!")
        return [], []
    
    print(f"Found {len(tables)} tables in HTML content")
    
    # Extract headers from the first table (they should be the same for all tables)
    headers = []
    first_table = tables[0]
    header_row = first_table.find('thead')
    if header_row:
        header_row = header_row.find('tr')
        if header_row:
            for th in header_row.find_all('th'):
                header_text = th.get('data-testid', '')
                headers.append(header_text)
    
    if not headers:
        print("No headers found in first table!")
        return [], []
    
    # Extract data rows from all tables
    all_data_rows = []
    
    for table_idx, table in enumerate(tables):
        print(f"Processing table {table_idx + 1}/{len(tables)}")
        
        tbody = table.find('tbody')
        if tbody:
            table_rows = []
            for tr in tbody.find_all('tr'):
                row_data = {}
                for i, td in enumerate(tr.find_all('td')):
                    if i < len(headers):
                        # Get data from span with title attribute
                        span_with_title = td.find('span', {'title': True})
                        if span_with_title:
                            row_data[headers[i]] = span_with_title.get('title', '').strip()
                        else:
                            # Fallback to get text content
                            text_content = td.get_text(strip=True)
                            row_data[headers[i]] = text_content
                
                if row_data:
                    # Convert timestamps to ISO format
                    post_date = row_data.get('postDate', '')
                    if row_data.get('timestamp'):
                        row_data['timestamp'] = convert_timestamp(row_data['timestamp'], post_date)
                    if row_data.get('postTimestamp'):
                        row_data['postTimestamp'] = convert_post_timestamp(row_data['postTimestamp'], post_date)
                    
                    # Add calculated approximate date from relative date
                    if post_date:
                        row_data['approximateDate'] = calculate_approximate_date(post_date)
                    else:
                        row_data['approximateDate'] = ''
                    
                    table_rows.append(row_data)
            
            all_data_rows.extend(table_rows)
            print(f"  Found {len(table_rows)} rows in table {table_idx + 1}")
    
    # Add approximateDate to headers if not already there
    if 'approximateDate' not in headers:
        headers.append('approximateDate')
    
    print(f"Total rows extracted: {len(all_data_rows)}")
    return headers, all_data_rows

def append_to_csv(headers, data_rows, output_file='linkedin_posts_combined.csv'):
    """Append data to CSV file"""
    file_exists = os.path.exists(output_file)
    
    # Check if we need to verify existing file has same headers
    if file_exists:
        with open(output_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            existing_headers = reader.fieldnames
            if existing_headers != headers:
                print(f"Warning: Headers don't match existing file!")
                return False
    
    # Clean data rows to handle Unicode characters
    cleaned_data_rows = []
    for row in data_rows:
        cleaned_row = {}
        for key, value in row.items():
            if isinstance(value, str):
                # Replace problematic Unicode characters
                cleaned_value = value.encode('utf-8', errors='replace').decode('utf-8')
                cleaned_row[key] = cleaned_value
            else:
                cleaned_row[key] = value
        cleaned_data_rows.append(cleaned_row)
    
    # Append to file with UTF-8 encoding and BOM for Excel compatibility
    with open(output_file, 'a', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        
        # Write header only if file is new
        if not file_exists:
            writer.writeheader()
            print(f"Created new file: {output_file}")
        else:
            print(f"Appending to existing file: {output_file}")
        
        writer.writerows(cleaned_data_rows)
    
    return True

# Main execution
if __name__ == "__main__":
    input_file = 'html_input.txt'
    output_file = 'linkedin_posts_combined.csv'
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found!")
        print("Please create 'html_input.txt' and paste your HTML table content")
        print("See README.md for detailed instructions")
        exit(1)
    
    # Read HTML from file
    with open(input_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Parse the table
    print("Parsing HTML table...")
    headers, data_rows = parse_html_table(html_content)
    
    if not data_rows:
        print("No data rows found in HTML!")
        exit(1)
    
    print(f"Found {len(data_rows)} rows with {len(headers)} columns")
    
    # Append to CSV
    success = append_to_csv(headers, data_rows, output_file)
    
    if success:
        # Count total rows in file (actual CSV rows, not lines)
        with open(output_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            total_rows = sum(1 for row in reader)
        
        print(f"\nSuccessfully added {len(data_rows)} new rows")
        print(f"Total rows in CSV: {total_rows}")
        print(f"Output file: {output_file}")
        
        # Show sample of added data
        print("\nSample of added data:")
        for i, row in enumerate(data_rows[:2]):
            print(f"\n  Row {i+1}:")
            print(f"    Author: {row.get('author', 'N/A')}")
            print(f"    Post Date (relative): {row.get('postDate', 'N/A')}")
            print(f"    Approximate Date: {row.get('approximateDate', 'N/A')}")
            print(f"    Likes: {row.get('likeCount', 'N/A')}")
            print(f"    Post Timestamp: {row.get('postTimestamp', 'N/A')}")
    else:
        print("Failed to append data to CSV")

