# Scripts Folder

This folder contains one-time utility scripts that were used during development to set up and fix various aspects of the LangTube application.

## 📁 Script Descriptions

### **Structure & Layout Scripts:**
- `add_dropdown_to_all.js` - Adds language dropdown to all HTML files
- `add_marquee_to_all.js` - Adds language marquee to all HTML files  
- `add_navigation.js` - Adds navigation elements to all HTML files
- `fix_all_structure.js` - Fixes HTML structure issues across all files
- `fix_marquee_and_structure.js` - Fixes marquee and structural problems
- `verify_structure.js` - Verifies HTML structure consistency

### **Styling & Layout Scripts:**
- `ensure_consistent_width.js` - Ensures consistent width across elements
- `fix_width_inconsistencies.js` - Fixes width-related styling issues
- `update_marquee_simple.js` - Updates marquee implementation

### **Content & Functionality Scripts:**
- `update_all_dropdowns.js` - Updates dropdown functionality across files
- `update_language_names.js` - Updates language names and translations

## 🚀 How to Use

These scripts are designed to be run from the **project root directory** (not from within the scripts folder).

### **Example Usage:**
```bash
# From the project root directory
node scripts/add_dropdown_to_all.js
node scripts/fix_all_structure.js
node scripts/verify_structure.js
```

## ⚠️ Important Notes

- **All paths have been updated** to work with the new folder structure
- **Language files** are now in `languages/` folder
- **Main files** (index.html, styles.css, app.js) are in the root
- **Scripts expect to be run from project root**, not from within scripts folder

## 🔧 File Structure Reference

```
langtube-Leland/
├── index.html (main English page)
├── styles.css
├── app.js
├── language-dropdown.js
├── languages/ (all language pages)
│   ├── spanish.html
│   ├── french.html
│   └── ... (other languages)
└── scripts/ (this folder)
    ├── add_dropdown_to_all.js
    ├── add_marquee_to_all.js
    └── ... (other scripts)
```

## 🎯 When to Use These Scripts

- **Adding new features** to all language pages
- **Fixing structural issues** across multiple files
- **Updating styling** consistently across all pages
- **Verifying consistency** after manual changes
- **Bulk operations** on multiple HTML files

## 📝 Development Notes

These scripts were created during the development process to:
1. **Automate repetitive tasks** across multiple language files
2. **Ensure consistency** when making changes
3. **Fix structural issues** that affected multiple files
4. **Verify integrity** of the codebase

All scripts have been updated to work with the current folder structure and can be safely re-run if needed.
