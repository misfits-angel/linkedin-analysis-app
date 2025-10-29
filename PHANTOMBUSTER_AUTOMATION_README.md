# PhantomBuster Login Automation

This project provides automated login functionality for PhantomBuster using Selenium WebDriver.

## Features

- ✅ Automated login to PhantomBuster
- ✅ Robust error handling and logging
- ✅ Screenshot capture for debugging
- ✅ Configurable browser settings
- ✅ Wait strategies for dynamic content
- ✅ Support for both headless and GUI modes

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements_phantombuster.txt
```

### 2. Install Chrome Browser

Make sure you have Google Chrome installed on your system. The script will automatically download the appropriate ChromeDriver.

### 3. Configure Credentials

Update the credentials in `phantombuster_config.py`:

```python
CREDENTIALS = {
    "email": "your-email@example.com",
    "password": "your-password"
}
```

## Usage

### Basic Usage

```python
from phantombuster_login_automation import PhantomBusterLogin

# Initialize
login_bot = PhantomBusterLogin(headless=False)

# Login
success = login_bot.login("your-email@example.com", "your-password")

if success:
    print("Login successful!")
    # Add your post-login actions here
else:
    print("Login failed!")

# Always close the browser
login_bot.close()
```

### Run the Example

```bash
python example_usage.py
```

### Run the Main Script

```bash
python phantombuster_login_automation.py
```

## Configuration Options

### Browser Settings

```python
BROWSER_SETTINGS = {
    "headless": False,        # Run without browser window
    "wait_timeout": 10,       # Element wait timeout (seconds)
    "window_size": "1920,1080" # Browser window size
}
```

### Custom Selectors

If PhantomBuster updates their HTML structure, you can update the selectors in `phantombuster_config.py`:

```python
SELECTORS = {
    "email_input": 'input[type="email"][name="email"]',
    "password_input": 'input[type="password"][name="password"]',
    "login_button": 'button[analyticsid="loginLoginBtn"]',
    "error_message": "[class*='error'], [class*='alert'], [class*='message']"
}
```

## Error Handling

The script includes comprehensive error handling:

- **TimeoutException**: When elements don't load within the specified time
- **NoSuchElementException**: When expected elements are not found
- **Login validation**: Checks for successful login indicators
- **Screenshot capture**: Automatically captures screenshots on errors

## Debugging

### Enable Debug Logging

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Take Screenshots

```python
login_bot.take_screenshot("debug_screenshot.png")
```

### Get Page Source

```python
page_source = login_bot.get_page_source()
print(page_source)
```

## Troubleshooting

### Common Issues

1. **ChromeDriver not found**: The script uses `webdriver-manager` to automatically download ChromeDriver
2. **Element not found**: Check if PhantomBuster has updated their HTML structure
3. **Login fails**: Verify credentials and check for CAPTCHA or 2FA requirements
4. **Timeout errors**: Increase the `wait_timeout` value in configuration

### Headless Mode Issues

If you encounter issues in headless mode, try running with `headless=False` to see what's happening in the browser.

## Security Notes

- Never commit credentials to version control
- Consider using environment variables for sensitive data
- The script stores credentials in plain text - use appropriate security measures

## Dependencies

- `selenium>=4.15.0`: Web automation framework
- `webdriver-manager>=4.0.0`: Automatic ChromeDriver management

## License

This project is for educational and automation purposes. Please ensure you comply with PhantomBuster's terms of service.
