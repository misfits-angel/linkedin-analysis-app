"""
Configuration file for PhantomBuster login automation
"""

# Login credentials
CREDENTIALS = {
    "email": "anurag@misfits.capital",
    "password": "Metal@321"
}

# Browser settings
BROWSER_SETTINGS = {
    "headless": False,  # Set to True to run without browser window
    "wait_timeout": 10,  # Maximum time to wait for elements (seconds)
    "window_size": "1920,1080"
}

# PhantomBuster URLs
URLS = {
    "login": "https://phantombuster.com/login",
    "dashboard": "https://phantombuster.com/dashboard",
    "console": "https://phantombuster.com/6707023177096457/phantoms/405868001478685/console"
}

# Selectors for form elements
SELECTORS = {
    "email_input": 'input[type="email"][name="email"]',
    "password_input": 'input[type="password"][name="password"]',
    "login_button": 'button[analyticsid="loginLoginBtn"]',
    "error_message": "[class*='error'], [class*='alert'], [class*='message']",
    "pagination_button": 'button[analyticsid="CsvInteractiveTablePaginationButton"]',
    "table": "table"
}

# Output settings
OUTPUT_SETTINGS = {
    "html_output_file": "html_input.txt",
    "screenshot_on_error": True
}
