# LangTube Language Pages

This document describes the language-specific pages created for LangTube.

## Available Languages

The following language pages have been created:

### Major Languages
- **English** (`index.html`) - Default language
- **Spanish** (`spanish.html`) - Español
- **French** (`french.html`) - Français  
- **German** (`german.html`) - Deutsch
- **Chinese** (`chinese.html`) - 中文
- **Japanese** (`japanese.html`) - 日本語
- **Korean** (`korean.html`) - 한국어

### Additional Languages
- **Arabic** (`arabic.html`) - العربية
- **Hindi** (`hindi.html`) - हिन्दी
- **Portuguese** (`portuguese.html`) - Português
- **Russian** (`russian.html`) - Русский
- **Italian** (`italian.html`) - Italiano

## Features

### Navigation System
- Each language page includes a navigation bar with links to all other languages
- The current language is highlighted with an "active" class
- Navigation text is localized for each language

### Localized Content
Each language page includes:
- Translated page title and meta tags
- Localized UI text for all buttons and labels
- Translated placeholder text and instructions
- Language-specific error messages
- Localized quiz and summary content

### Language Selection
- Each page defaults to its native language in the quiz/summary dropdown
- Users can still select any of the 35+ supported languages for quiz generation
- The language selection dropdown includes all supported languages with native names

## File Structure

```
langtube-Leland/
├── index.html              # English (default)
├── spanish.html           # Spanish
├── french.html            # French
├── german.html            # German
├── chinese.html           # Chinese
├── japanese.html          # Japanese
├── korean.html            # Korean
├── arabic.html            # Arabic
├── hindi.html             # Hindi
├── portuguese.html        # Portuguese
├── russian.html           # Russian
├── italian.html           # Italian
├── languages.html         # Language selection page
├── styles.css             # Shared styles
├── app.js                 # Shared JavaScript
└── LANGUAGE_PAGES_README.md
```

## Usage

1. **Direct Access**: Users can directly access any language page by navigating to the specific HTML file
2. **Navigation**: Use the language navigation bar on any page to switch between languages
3. **Language Selection Page**: Visit `languages.html` for a comprehensive overview of all available languages

## Technical Details

### Shared Resources
- All language pages use the same `styles.css` and `app.js` files
- The JavaScript functionality remains the same across all languages
- Only the UI text and language defaults change between pages

### Responsive Design
- All language pages are fully responsive
- Navigation adapts to mobile screens
- Language selection works on all device sizes

### SEO and Accessibility
- Each page has proper `lang` attributes
- Meta tags are localized for each language
- ARIA labels are translated appropriately
- Semantic HTML structure is maintained

## Adding New Languages

To add a new language page:

1. Copy an existing language page (e.g., `spanish.html`)
2. Rename it to the new language code (e.g., `dutch.html`)
3. Update the `lang` attribute in the HTML tag
4. Translate all UI text in the page
5. Update the language navigation in all existing pages
6. Test the page functionality

## Browser Support

All language pages support:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers
- Screen readers and accessibility tools
- Keyboard navigation

## Notes

- The core functionality (YouTube transcript fetching, AI processing, quiz generation) remains the same across all languages
- Language selection for quiz/summary output is independent of the page language
- All pages maintain the same visual design and user experience
- Navigation between languages preserves the user's current state where possible
