#!/usr/bin/env python3
"""
PhantomBuster Login Automation Script
Automates the login process for PhantomBuster using Selenium WebDriver
"""

import time
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import os
from typing import Optional, List
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PhantomBusterLogin:
    def __init__(self, headless: bool = False, wait_timeout: int = 10):
        """
        Initialize the PhantomBuster login automation
        
        Args:
            headless (bool): Run browser in headless mode
            wait_timeout (int): Maximum time to wait for elements (seconds)
        """
        self.wait_timeout = wait_timeout
        self.driver = None
        self.setup_driver(headless)
    
    def setup_driver(self, headless: bool = False):
        """Setup Chrome WebDriver with appropriate options"""
        chrome_options = Options()
        
        if headless:
            chrome_options.add_argument("--headless")
        
        # Additional options for better compatibility
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
        
        try:
            # Try to use ChromeDriverManager for automatic driver management
            try:
                from webdriver_manager.chrome import ChromeDriverManager
                service = Service(ChromeDriverManager().install())
                self.driver = webdriver.Chrome(service=service, options=chrome_options)
                logger.info("ChromeDriver initialized with ChromeDriverManager")
            except ImportError:
                # Fallback to system ChromeDriver
                self.driver = webdriver.Chrome(options=chrome_options)
                logger.info("ChromeDriver initialized with system driver")
        except Exception as e:
            logger.error(f"Failed to initialize ChromeDriver: {e}")
            raise
    
    def navigate_to_login(self) -> bool:
        """Navigate to PhantomBuster login page"""
        try:
            login_url = "https://phantombuster.com/login"
            logger.info(f"Navigating to {login_url}")
            self.driver.get(login_url)
            
            # Wait for page to load
            WebDriverWait(self.driver, self.wait_timeout).until(
                EC.presence_of_element_located((By.TAG_NAME, "form"))
            )
            logger.info("Login page loaded successfully")
            return True
            
        except TimeoutException:
            logger.error("Timeout waiting for login page to load")
            return False
        except Exception as e:
            logger.error(f"Error navigating to login page: {e}")
            return False
    
    def fill_login_form(self, email: str, password: str) -> bool:
        """Fill the login form with credentials"""
        try:
            # Wait for form elements to be present
            wait = WebDriverWait(self.driver, self.wait_timeout)
            
            # Find email input field
            email_input = wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="email"][name="email"]'))
            )
            
            # Find password input field
            password_input = wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="password"][name="password"]'))
            )
            
            # Clear and fill email field
            email_input.clear()
            email_input.send_keys(email)
            logger.info("Email entered successfully")
            
            # Clear and fill password field
            password_input.clear()
            password_input.send_keys(password)
            logger.info("Password entered successfully")
            
            return True
            
        except TimeoutException:
            logger.error("Timeout waiting for form elements")
            return False
        except Exception as e:
            logger.error(f"Error filling login form: {e}")
            return False
    
    def submit_login(self) -> bool:
        """Submit the login form"""
        try:
            # Find and click the login button
            login_button = WebDriverWait(self.driver, self.wait_timeout).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, 'button[analyticsid="loginLoginBtn"]'))
            )
            
            login_button.click()
            logger.info("Login button clicked")
            
            # Wait a moment for the request to process
            time.sleep(2)
            
            return True
            
        except TimeoutException:
            logger.error("Timeout waiting for login button")
            return False
        except Exception as e:
            logger.error(f"Error submitting login form: {e}")
            return False
    
    def check_login_success(self) -> bool:
        """Check if login was successful"""
        try:
            # Wait a bit for potential redirects
            time.sleep(3)
            
            # Check if we're still on login page (indicates failure)
            current_url = self.driver.current_url
            if "login" in current_url.lower():
                logger.warning("Still on login page - login may have failed")
                return False
            
            # Check for success indicators - PhantomBuster redirects to phantoms page after login
            try:
                # Look for success indicators: phantoms page, dashboard, or account-related elements
                WebDriverWait(self.driver, 5).until(
                    lambda driver: "phantoms" in driver.current_url.lower() or 
                                 "dashboard" in driver.current_url.lower() or 
                                 "account" in driver.current_url.lower() or
                                 driver.find_elements(By.CSS_SELECTOR, "[data-testid*='dashboard']") or
                                 driver.find_elements(By.CSS_SELECTOR, "[class*='dashboard']")
                )
                logger.info(f"Login successful - redirected to: {current_url}")
                return True
            except TimeoutException:
                # Check if there are any error messages
                error_elements = self.driver.find_elements(By.CSS_SELECTOR, "[class*='error'], [class*='alert'], [class*='message']")
                if error_elements:
                    for element in error_elements:
                        if element.is_displayed() and element.text.strip():
                            logger.error(f"Login error: {element.text.strip()}")
                            return False
                
                # If we're not on login page and no errors, consider it successful
                if "login" not in current_url.lower():
                    logger.info(f"Login appears successful - current URL: {current_url}")
                    return True
                
                logger.warning("Login status unclear - no clear success or failure indicators")
                return False
                
        except Exception as e:
            logger.error(f"Error checking login success: {e}")
            return False
    
    def login(self, email: str, password: str) -> bool:
        """Complete login process"""
        try:
            logger.info("Starting PhantomBuster login process")
            
            # Navigate to login page
            if not self.navigate_to_login():
                return False
            
            # Fill login form
            if not self.fill_login_form(email, password):
                return False
            
            # Submit login
            if not self.submit_login():
                return False
            
            # Check if login was successful
            success = self.check_login_success()
            
            if success:
                logger.info("Login completed successfully!")
            else:
                logger.error("Login failed!")
            
            return success
            
        except Exception as e:
            logger.error(f"Unexpected error during login: {e}")
            return False
    
    def get_page_source(self) -> str:
        """Get current page source for debugging"""
        return self.driver.page_source if self.driver else ""
    
    def take_screenshot(self, filename: str = "login_screenshot.png") -> bool:
        """Take a screenshot for debugging"""
        try:
            if self.driver:
                self.driver.save_screenshot(filename)
                logger.info(f"Screenshot saved as {filename}")
                return True
        except Exception as e:
            logger.error(f"Error taking screenshot: {e}")
        return False
    
    def navigate_to_console(self, console_url: str) -> bool:
        """Navigate to the PhantomBuster console page"""
        try:
            logger.info(f"Navigating to console: {console_url}")
            self.driver.get(console_url)
            
            # Wait for the page to load and table to be present
            WebDriverWait(self.driver, self.wait_timeout).until(
                EC.presence_of_element_located((By.TAG_NAME, "table"))
            )
            logger.info("Console page loaded successfully")
            return True
            
        except TimeoutException:
            logger.error("Timeout waiting for console page to load")
            return False
        except Exception as e:
            logger.error(f"Error navigating to console page: {e}")
            return False
    
    def get_pagination_buttons(self) -> List[dict]:
        """Get all pagination buttons and their page numbers"""
        try:
            # Find all pagination buttons
            pagination_buttons = self.driver.find_elements(
                By.CSS_SELECTOR, 
                'button[analyticsid="CsvInteractiveTablePaginationButton"]'
            )
            
            pages = []
            for button in pagination_buttons:
                try:
                    # Get the page number from analyticsval1 attribute
                    page_num = button.get_attribute("analyticsval1")
                    if page_num and page_num.isdigit():
                        pages.append({
                            'element': button,
                            'page_number': int(page_num),
                            'label': button.get_attribute("label")
                        })
                except Exception as e:
                    logger.warning(f"Error processing pagination button: {e}")
                    continue
            
            # Sort by page number
            pages.sort(key=lambda x: x['page_number'])
            logger.info(f"Found {len(pages)} pagination pages")
            return pages
            
        except Exception as e:
            logger.error(f"Error getting pagination buttons: {e}")
            return []
    
    def extract_table_html(self) -> str:
        """Extract HTML content of the table on current page"""
        try:
            # Find the table element
            table = self.driver.find_element(By.TAG_NAME, "table")
            table_html = table.get_attribute('outerHTML')
            logger.info("Table HTML extracted successfully")
            return table_html
            
        except NoSuchElementException:
            logger.error("No table found on current page")
            return ""
        except Exception as e:
            logger.error(f"Error extracting table HTML: {e}")
            return ""
    
    def click_pagination_button(self, page_number: int) -> bool:
        """Click a pagination button by page number and wait for content to load"""
        try:
            # Find the pagination button by page number (re-find to avoid stale element)
            pagination_button = WebDriverWait(self.driver, self.wait_timeout).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, f'button[analyticsid="CsvInteractiveTablePaginationButton"][analyticsval1="{page_number}"]'))
            )
            
            # Scroll to button to ensure it's visible
            self.driver.execute_script("arguments[0].scrollIntoView(true);", pagination_button)
            time.sleep(0.5)
            
            # Click the button
            pagination_button.click()
            logger.info(f"Pagination button for page {page_number} clicked")
            
            # Wait for table to reload
            WebDriverWait(self.driver, self.wait_timeout).until(
                EC.presence_of_element_located((By.TAG_NAME, "table"))
            )
            
            # Additional wait for content to fully load
            time.sleep(2)
            return True
            
        except TimeoutException:
            logger.error(f"Timeout waiting for page {page_number} content to load after pagination click")
            return False
        except Exception as e:
            logger.error(f"Error clicking pagination button for page {page_number}: {e}")
            return False
    
    def extract_all_paginated_tables(self, console_url: str, output_file: str = "html_input.txt") -> bool:
        """Extract table HTML from all paginated pages"""
        try:
            # Navigate to console page
            if not self.navigate_to_console(console_url):
                return False
            
            # Get initial pagination buttons to determine total pages
            initial_pagination = self.get_pagination_buttons()
            if not initial_pagination:
                logger.warning("No pagination buttons found, extracting single page")
                # Extract single page if no pagination
                table_html = self.extract_table_html()
                if table_html:
                    self.save_table_html(table_html, output_file)
                    return True
                return False
            
            # Find the maximum page number from initial pagination
            max_page = max(page_info['page_number'] for page_info in initial_pagination)
            logger.info(f"Detected {max_page} total pages")
            
            all_table_html = []
            successful_pages = 0
            
            # Extract table from each page sequentially
            for page_num in range(1, max_page + 1):
                logger.info(f"Extracting table from page {page_num}")
                
                # Click pagination button using page number
                if self.click_pagination_button(page_num):
                    # Extract table HTML
                    table_html = self.extract_table_html()
                    if table_html:
                        all_table_html.append(f"<!-- Page {page_num} -->\n{table_html}\n")
                        successful_pages += 1
                        logger.info(f"Successfully extracted table from page {page_num}")
                    else:
                        logger.warning(f"Failed to extract table from page {page_num}")
                else:
                    logger.warning(f"Failed to navigate to page {page_num}")
            
            # Save all extracted HTML
            if all_table_html:
                combined_html = "\n".join(all_table_html)
                self.save_table_html(combined_html, output_file)
                logger.info(f"Successfully extracted tables from {successful_pages} pages")
                return True
            else:
                logger.error("No table HTML extracted from any page")
                return False
                
        except Exception as e:
            logger.error(f"Error extracting paginated tables: {e}")
            return False
    
    def save_table_html(self, html_content: str, output_file: str) -> bool:
        """Save table HTML content to file"""
        try:
            # Add timestamp header
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            header = f"<!-- Extracted on {timestamp} -->\n"
            full_content = header + html_content
            
            # Write to file
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(full_content)
            
            logger.info(f"Table HTML saved to {output_file}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving table HTML: {e}")
            return False
    
    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()
            logger.info("Browser closed")

def main():
    """Main function to run the login automation and table extraction"""
    # Configuration
    EMAIL = "anurag@misfits.capital"
    PASSWORD = "Metal@321"
    HEADLESS = False  # Set to True to run without browser window
    CONSOLE_URL = "https://phantombuster.com/6707023177096457/phantoms/405868001478685/console"
    OUTPUT_FILE = "html_input.txt"
    
    # Initialize login automation
    login_automation = PhantomBusterLogin(headless=HEADLESS)
    
    try:
        # Attempt login
        print("🔐 Starting login process...")
        success = login_automation.login(EMAIL, PASSWORD)
        
        if success:
            print("✅ Login successful!")
            
            # Extract paginated table data
            print("📊 Starting table extraction...")
            extraction_success = login_automation.extract_all_paginated_tables(
                console_url=CONSOLE_URL,
                output_file=OUTPUT_FILE
            )
            
            if extraction_success:
                print(f"✅ Table extraction completed! Data saved to {OUTPUT_FILE}")
            else:
                print("❌ Table extraction failed!")
                login_automation.take_screenshot("extraction_failed.png")
        else:
            print("❌ Login failed!")
            # Take screenshot for debugging
            login_automation.take_screenshot("login_failed.png")
            
    except KeyboardInterrupt:
        print("\n⚠️ Process interrupted by user")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    finally:
        # Always close the browser
        login_automation.close()

if __name__ == "__main__":
    main()
