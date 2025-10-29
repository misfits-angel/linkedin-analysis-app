#!/usr/bin/env python3
"""
Dedicated script for extracting paginated table data from PhantomBuster console
"""

import argparse
from phantombuster_login_automation import PhantomBusterLogin
from phantombuster_config import CREDENTIALS, BROWSER_SETTINGS, URLS, OUTPUT_SETTINGS
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def extract_phantombuster_data(console_url: str, output_file: str = None):
    """Extract all paginated table data from PhantomBuster console"""
    
    # Initialize the automation
    bot = PhantomBusterLogin(
        headless=BROWSER_SETTINGS["headless"],
        wait_timeout=BROWSER_SETTINGS["wait_timeout"]
    )
    
    html_output = output_file or OUTPUT_SETTINGS["html_output_file"]
    
    try:
        # Step 1: Login
        print("🔐 Logging into PhantomBuster...")
        login_success = bot.login(
            email=CREDENTIALS["email"],
            password=CREDENTIALS["password"]
        )
        
        if not login_success:
            print("❌ Login failed! Cannot proceed with data extraction.")
            return False
        
        print("✅ Login successful!")
        
        # Step 2: Extract paginated table data
        print("📊 Starting table data extraction...")
        print(f"Console URL: {console_url}")
        print(f"Output file: {html_output}")
        
        extraction_success = bot.extract_all_paginated_tables(
            console_url=console_url,
            output_file=html_output
        )
        
        if extraction_success:
            print("✅ Data extraction completed successfully!")
            print(f"📁 Table HTML saved to: {html_output}")
            return True
        else:
            print("❌ Data extraction failed!")
            bot.take_screenshot("extraction_failed.png")
            return False
            
    except KeyboardInterrupt:
        print("\n⚠️ Process interrupted by user")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        logger.error(f"Unexpected error: {e}")
        return False
    finally:
        # Always close the browser
        bot.close()
        print("🔒 Browser closed")

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description="Extract paginated table data from PhantomBuster console",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python extract_phantombuster_tables.py --url "https://phantombuster.com/123/phantoms/456/console"
  python extract_phantombuster_tables.py --url "https://phantombuster.com/123/phantoms/456/console" --output "my_data.html"
  python extract_phantombuster_tables.py --url "https://phantombuster.com/123/phantoms/456/console" --headless
        """
    )
    
    parser.add_argument(
        '--url', 
        required=True,
        help='PhantomBuster console URL (e.g., https://phantombuster.com/123/phantoms/456/console)'
    )
    
    parser.add_argument(
        '--output', '-o',
        default=OUTPUT_SETTINGS["html_output_file"],
        help=f'Output HTML filename (default: {OUTPUT_SETTINGS["html_output_file"]})'
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
    """Main function"""
    # Parse command line arguments
    args = parse_arguments()
    
    # Configure logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Validate URL
    if not args.url.startswith('https://phantombuster.com/'):
        print("❌ Error: URL must be a valid PhantomBuster console URL")
        print("   Example: https://phantombuster.com/123/phantoms/456/console")
        return
    
    if '/console' not in args.url:
        print("❌ Error: URL must be a PhantomBuster console URL (must contain '/console')")
        print("   Example: https://phantombuster.com/123/phantoms/456/console")
        return
    
    print("🚀 Starting PhantomBuster Table Extraction")
    print(f"📋 Console URL: {args.url}")
    print(f"📁 Output HTML: {args.output}")
    print(f"🖥️  Headless mode: {'Yes' if args.headless else 'No'}")
    print("=" * 50)
    
    # Update browser settings if headless is specified
    if args.headless:
        BROWSER_SETTINGS["headless"] = True
    
    success = extract_phantombuster_data(args.url, args.output)
    
    if success:
        print("\n🎉 Process completed successfully!")
        print("You can now process the extracted HTML data using your existing parser.")
    else:
        print("\n💥 Process failed!")
        print("Check the logs and screenshots for debugging information.")

if __name__ == "__main__":
    main()
