# LinkedIn Yearly Wrap - Modular Structure

This project has been refactored from a single large `index.html` file into multiple, more manageable files for better maintainability and LLM readability.

## File Structure

### HTML
- **`index.html`** - Main HTML template with clean structure and external file imports

### CSS
- **`styles.css`** - All custom CSS styles, including responsive design and print styles

### JavaScript Modules
- **`config.js`** - Configuration constants and utility functions
- **`charts.js`** - Chart management and rendering functions
- **`ui.js`** - UI interactions and event handlers
- **`data-handlers.js`** - CSV analysis and file upload handlers
- **`llm-insights.js`** - LLM-powered insights and topic analysis
- **`main.js`** - Main application logic and initialization

## Benefits of This Structure

1. **LLM-Friendly**: Each file is now small enough for LLMs to read and understand completely
2. **Maintainable**: Related functionality is grouped together
3. **Modular**: Easy to modify specific features without affecting others
4. **Testable**: Individual modules can be tested separately
5. **Readable**: Clear separation of concerns

## Usage

Simply open `index.html` in a web browser. All JavaScript modules will be loaded automatically in the correct order.

## Dependencies

- Chart.js for data visualization
- Papa Parse for CSV handling
- html2pdf.js for PDF generation
- Tailwind CSS for styling

## Rollback

If needed, the original large file is backed up in `backups/web/index_2_working.html`.
