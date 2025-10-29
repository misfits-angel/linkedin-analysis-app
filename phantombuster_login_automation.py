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
from typing import Optional

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
            
            # Check for success indicators
            try:
                # Look for dashboard or account-related elements
                WebDriverWait(self.driver, 5).until(
                    lambda driver: "dashboard" in driver.current_url.lower() or 
                                 "account" in driver.current_url.lower() or
                                 driver.find_elements(By.CSS_SELECTOR, "[data-testid*='dashboard']") or
                                 driver.find_elements(By.CSS_SELECTOR, "[class*='dashboard']")
                )
                logger.info("Login successful - redirected to dashboard/account page")
                return True
            except TimeoutException:
                # Check if there are any error messages
                error_elements = self.driver.find_elements(By.CSS_SELECTOR, "[class*='error'], [class*='alert'], [class*='message']")
                if error_elements:
                    for element in error_elements:
                        if element.is_displayed() and element.text.strip():
                            logger.error(f"Login error: {element.text.strip()}")
                            return False
                
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
    
    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()
            logger.info("Browser closed")

def main():
    """Main function to run the login automation"""
    # Configuration
    EMAIL = "anurag@misfits.capital"
    PASSWORD = "Metal@321"
    HEADLESS = False  # Set to True to run without browser window
    
    # Initialize login automation
    login_automation = PhantomBusterLogin(headless=HEADLESS)
    
    try:
        # Attempt login
        success = login_automation.login(EMAIL, PASSWORD)
        
        if success:
            print("✅ Login successful!")
            # You can add additional actions here after successful login
            # For example: navigate to specific pages, extract data, etc.
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
