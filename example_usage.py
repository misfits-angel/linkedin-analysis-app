#!/usr/bin/env python3
"""
Example usage of PhantomBuster login automation
"""

from phantombuster_login_automation import PhantomBusterLogin
from phantombuster_config import CREDENTIALS, BROWSER_SETTINGS

def main():
    """Example of how to use the login automation"""
    
    # Initialize the login automation
    login_bot = PhantomBusterLogin(
        headless=BROWSER_SETTINGS["headless"],
        wait_timeout=BROWSER_SETTINGS["wait_timeout"]
    )
    
    try:
        # Perform login
        success = login_bot.login(
            email=CREDENTIALS["email"],
            password=CREDENTIALS["password"]
        )
        
        if success:
            print("🎉 Successfully logged into PhantomBuster!")
            
            # Example: Wait a bit and take a screenshot
            import time
            time.sleep(3)
            login_bot.take_screenshot("successful_login.png")
            
            # Example: Get current page source for analysis
            page_source = login_bot.get_page_source()
            print(f"Current page source length: {len(page_source)} characters")
            
            # You can add more actions here after successful login
            # For example:
            # - Navigate to specific pages
            # - Extract data from the dashboard
            # - Interact with specific elements
            
        else:
            print("❌ Login failed. Check the logs for details.")
            login_bot.take_screenshot("failed_login.png")
            
    except Exception as e:
        print(f"❌ Error occurred: {e}")
        
    finally:
        # Always close the browser
        login_bot.close()

if __name__ == "__main__":
    main()
