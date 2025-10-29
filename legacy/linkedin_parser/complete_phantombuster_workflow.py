#!/usr/bin/env python3
"""
Complete PhantomBuster to CSV Workflow
1. Login to PhantomBuster
2. Extract paginated table HTML from console
3. Parse HTML using existing LinkedIn parser
4. Generate CSV file with LinkedIn post data
"""

import os
import sys
import argparse
from phantombuster_login_automation import PhantomBusterLogin
from phantombuster_config import CREDENTIALS, BROWSER_SETTINGS, URLS, OUTPUT_SETTINGS
from parse_and_append import parse_html_table, append_to_csv
import logging

# Simple print function to avoid emoji encoding issues
def safe_print(text):
    """Print text safely, replacing emojis with text on Windows"""
    if sys.platform == "win32":
        # Replace common emojis with text equivalents
        text = text.replace("🚀", "[START]")
        text = text.replace("🔐", "[LOGIN]")
        text = text.replace("✅", "[SUCCESS]")
        text = text.replace("❌", "[ERROR]")
        text = text.replace("📊", "[DATA]")
        text = text.replace("📁", "[FILE]")
        text = text.replace("🖥️", "[BROWSER]")
        text = text.replace("📋", "[URL]")
        text = text.replace("🔒", "[CLOSE]")
        text = text.replace("🎉", "[DONE]")
        text = text.replace("💥", "[FAILED]")
        text = text.replace("⚠️", "[WARNING]")
        text = text.replace("🔧", "[PARSE]")
        text = text.replace("📄", "[HTML]")
        text = text.replace("📊", "[ROWS]")
        text = text.replace("🔍", "[STEP]")
        text = text.replace("💾", "[SAVE]")
    print(text)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class CompletePhantomBusterWorkflow:
    def __init__(self, console_url: str, headless: bool = False, csv_output: str = None):
        """Initialize the complete workflow"""
        self.bot = PhantomBusterLogin(headless=headless)
        self.console_url = console_url
        self.html_output_file = OUTPUT_SETTINGS["html_output_file"]
        self.csv_output_file = csv_output or "linkedin_posts_phantombuster.csv"
        
    def extract_table_data(self) -> bool:
        """Step 1: Extract paginated table HTML from PhantomBuster"""
        try:
            safe_print("🔐 Step 1: Logging into PhantomBuster...")
            login_success = self.bot.login(
                email=CREDENTIALS["email"],
                password=CREDENTIALS["password"]
            )
            
            if not login_success:
                safe_print("❌ Login failed! Cannot proceed with data extraction.")
                return False
            
            safe_print("✅ Login successful!")
            
            safe_print("📊 Step 2: Extracting paginated table data...")
            safe_print(f"Console URL: {self.console_url}")
            safe_print(f"HTML output: {self.html_output_file}")
            
            extraction_success = self.bot.extract_all_paginated_tables(
                console_url=self.console_url,
                output_file=self.html_output_file
            )
            
            if extraction_success:
                safe_print("✅ Table HTML extraction completed!")
                return True
            else:
                safe_print("❌ Table HTML extraction failed!")
                return False
                
        except Exception as e:
            safe_print(f"❌ Error during extraction: {e}")
            logger.error(f"Error during extraction: {e}")
            return False
    
    def parse_and_generate_csv(self) -> bool:
        """Step 3: Parse HTML and generate CSV using existing LinkedIn parser"""
        try:
            safe_print("🔍 Step 3: Parsing HTML and generating CSV...")
            
            # Check if HTML file exists
            if not os.path.exists(self.html_output_file):
                safe_print(f"❌ HTML file not found: {self.html_output_file}")
                return False
            
            # Read HTML content
            with open(self.html_output_file, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            safe_print(f"📄 HTML file size: {len(html_content)} characters")
            
            # Parse the HTML table using existing parser
            safe_print("🔧 Parsing HTML table...")
            headers, data_rows = parse_html_table(html_content)
            
            if not data_rows:
                safe_print("❌ No data rows found in HTML!")
                return False
            
            safe_print(f"📊 Found {len(data_rows)} rows with {len(headers)} columns")
            # Safe print for headers to avoid Unicode issues
            try:
                safe_print(f"📋 Headers: {', '.join(headers)}")
            except UnicodeEncodeError:
                safe_print("📋 Headers: [Unicode characters detected - check CSV file for details]")
            
            # Generate author-based filename if using default name
            if self.csv_output_file == "linkedin_posts_phantombuster.csv":
                author_name = self.extract_author_name(data_rows)
                if author_name:
                    self.csv_output_file = f"linkedin_posts_{author_name}.csv"
                    safe_print(f"📁 Auto-generated filename: {self.csv_output_file}")
            
            # Generate CSV using existing append function
            safe_print(f"💾 Generating CSV: {self.csv_output_file}")
            success = append_to_csv(headers, data_rows, self.csv_output_file)
            
            if success:
                # Count total rows in the generated CSV
                with open(self.csv_output_file, 'r', encoding='utf-8') as f:
                    import csv
                    reader = csv.DictReader(f)
                    total_rows = sum(1 for row in reader)
                
                safe_print(f"✅ CSV generation completed!")
                safe_print(f"📁 Output file: {self.csv_output_file}")
                safe_print(f"📊 Total rows: {total_rows}")
                
                # Show sample data
                self.show_sample_data(data_rows)
                return True
            else:
                safe_print("❌ CSV generation failed!")
                return False
                
        except Exception as e:
            safe_print(f"❌ Error during parsing: {e}")
            logger.error(f"Error during parsing: {e}")
            return False
    
    def extract_author_name(self, data_rows):
        """Extract the most common author name for filename generation"""
        try:
            if data_rows and len(data_rows) > 0:
                from collections import Counter
                
                # Count all authors
                authors = [row.get('author', '') for row in data_rows if row.get('author')]
                if authors:
                    author_counts = Counter(authors)
                    # Get the most common author
                    most_common_author = author_counts.most_common(1)[0][0]
                    
                    # Clean the author name for filename
                    import re
                    # Remove special characters and replace spaces with underscores
                    clean_name = re.sub(r'[^\w\s-]', '', most_common_author)
                    clean_name = re.sub(r'[-\s]+', '_', clean_name)
                    return clean_name.strip('_')
            return None
        except Exception as e:
            safe_print(f"⚠️ Warning: Could not extract author name: {e}")
            return None
    
    def show_sample_data(self, data_rows, sample_count=3):
        """Show sample of extracted data"""
        safe_print(f"\n📋 Sample of extracted data (first {min(sample_count, len(data_rows))} rows):")
        safe_print("-" * 80)
        
        for i, row in enumerate(data_rows[:sample_count]):
            safe_print(f"\n  Row {i+1}:")
            for key, value in row.items():
                # Truncate long values for display and handle Unicode
                try:
                    display_value = str(value)[:50] + "..." if len(str(value)) > 50 else str(value)
                    safe_print(f"    {key}: {display_value}")
                except UnicodeEncodeError:
                    # Handle Unicode characters that can't be displayed
                    safe_print(f"    {key}: [Unicode content - check CSV file]")
    
    def run_complete_workflow(self) -> bool:
        """Run the complete workflow from extraction to CSV generation"""
        try:
            safe_print("🚀 Starting Complete PhantomBuster to CSV Workflow")
            safe_print("=" * 60)
            
            # Step 1 & 2: Extract table data
            if not self.extract_table_data():
                return False
            
            # Step 3: Parse and generate CSV
            if not self.parse_and_generate_csv():
                return False
            
            safe_print("\n🎉 Complete workflow finished successfully!")
            safe_print(f"📁 HTML data: {self.html_output_file}")
            safe_print(f"📁 CSV data: {self.csv_output_file}")
            return True
            
        except KeyboardInterrupt:
            safe_print("\n⚠️ Process interrupted by user")
            return False
        except Exception as e:
            safe_print(f"❌ Unexpected error: {e}")
            logger.error(f"Unexpected error: {e}")
            return False
        finally:
            # Always close the browser
            self.bot.close()
            safe_print("🔒 Browser closed")

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description="Complete PhantomBuster to CSV Workflow",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python complete_phantombuster_workflow.py --url "https://phantombuster.com/123/phantoms/456/console"
  python complete_phantombuster_workflow.py --url "https://phantombuster.com/123/phantoms/456/console" --output "my_data.csv"
  python complete_phantombuster_workflow.py --url "https://phantombuster.com/123/phantoms/456/console" --headless
        """
    )
    
    parser.add_argument(
        '--url', 
        required=True,
        help='PhantomBuster console URL (e.g., https://phantombuster.com/123/phantoms/456/console)'
    )
    
    parser.add_argument(
        '--output', '-o',
        default='linkedin_posts_phantombuster.csv',
        help='Output CSV filename (default: linkedin_posts_phantombuster.csv)'
    )
    
    parser.add_argument(
        '--headless',
        action='store_true',
        help='Run browser in headless mode (no GUI)'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose logging'
    )
    
    return parser.parse_args()

def main():
    """Main function to run the complete workflow"""
    
    # Parse command line arguments
    args = parse_arguments()
    
    # Configure logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Validate URL
    if not args.url.startswith('https://phantombuster.com/'):
        safe_print("❌ Error: URL must be a valid PhantomBuster console URL")
        safe_print("   Example: https://phantombuster.com/123/phantoms/456/console")
        sys.exit(1)
    
    if '/console' not in args.url:
        safe_print("❌ Error: URL must be a PhantomBuster console URL (must contain '/console')")
        safe_print("   Example: https://phantombuster.com/123/phantoms/456/console")
        sys.exit(1)
    
    safe_print(f"🚀 Starting PhantomBuster to CSV Workflow")
    safe_print(f"📋 Console URL: {args.url}")
    safe_print(f"📁 Output CSV: {args.output}")
    safe_print(f"🖥️  Headless mode: {'Yes' if args.headless else 'No'}")
    safe_print("=" * 60)
    
    # Initialize workflow
    workflow = CompletePhantomBusterWorkflow(
        console_url=args.url,
        headless=args.headless,
        csv_output=args.output
    )
    
    # Run complete workflow
    success = workflow.run_complete_workflow()
    
    if success:
        safe_print(f"\n✅ All done! Your LinkedIn post data is ready in: {args.output}")
    else:
        safe_print("\n💥 Workflow failed! Check the logs for details.")
        sys.exit(1)

if __name__ == "__main__":
    main()
