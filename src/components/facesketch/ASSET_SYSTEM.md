# Asset System Documentation

## Overview
The FaceSketch component now uses a dynamic asset loading system that automatically discovers and loads numbered assets from the `public/assets/` folder.

## Asset Structure
```
public/assets/
├── head/           # Face shapes
│   ├── 01.png
│   ├── 02.png
│   └── ...
├── eyes/           # Eye variations
│   ├── 01.png
│   ├── 02.png
│   └── ...
├── eyebrows/       # Eyebrow styles
│   ├── 01.png
│   ├── 02.png
│   └── ...
├── nose/           # Nose shapes
│   ├── 01.png
│   ├── 02.png
│   └── ...
├── lips/           # Lip styles
│   ├── 01.png
│   ├── 02.png
│   └── ...
├── hair/           # Hair styles
│   ├── 01.png
│   ├── 02.png
│   └── ...
├── mustach/        # Facial hair
│   ├── 01.png
│   ├── 02.png
│   └── ...
└── more/           # Accessories
    ├── 01.png
    ├── 02.png
    └── ...
```

## How It Works

### 1. Asset Discovery
- The system automatically scans each category folder for numbered assets
- Only files that start with numbers (01.png, 02.png, etc.) are loaded
- Files like "Group 41.png" are ignored
- The system checks up to 50 assets per category by default

### 2. Dynamic Loading
- Assets are loaded asynchronously when the component mounts
- Each asset is checked for existence before being added to the library
- Missing assets are skipped gracefully
- The system handles gaps in numbering (e.g., 01, 02, 05, 07)

### 3. Production Compatibility
- Uses relative paths (`/assets/folder/01.png`) that work in production
- No hardcoded domain URLs
- Assets are served from the public folder

## Adding New Assets

### To add new assets:
1. Place numbered PNG files in the appropriate category folder
2. Use the format: `01.png`, `02.png`, `03.png`, etc.
3. The system will automatically detect and load them
4. Refresh the page or click the refresh button to reload assets

### Example:
- Add `15.png` to `public/assets/eyes/` folder
- The system will automatically detect it and show it in the Eyes category
- No code changes required

## Asset Categories

| Category | Folder | Description |
|----------|--------|-------------|
| Face Shapes | `head/` | Basic face outlines and shapes |
| Eyes | `eyes/` | Eye variations and styles |
| Eyebrows | `eyebrows/` | Eyebrow shapes and styles |
| Nose | `nose/` | Nose shapes and variations |
| Lips | `lips/` | Lip styles and shapes |
| Hair | `hair/` | Hair styles and colors |
| Mustach | `mustach/` | Facial hair and mustaches |
| More | `more/` | Accessories and additional items |

## Technical Details

### Asset Loading Process
1. Component mounts and triggers asset discovery
2. For each category folder, the system checks for numbered assets
3. Each asset is validated by attempting to load it
4. Valid assets are added to the category's asset list
5. The UI updates to show available assets

### Error Handling
- Missing assets are silently skipped
- Network errors are logged but don't break the system
- Empty categories are handled gracefully
- A refresh button allows manual asset reloading

### Performance
- Assets are loaded asynchronously to prevent UI blocking
- Image existence is checked before adding to the library
- Only numbered assets are processed (filters out non-asset files)
- Maximum 50 assets per category to prevent excessive loading

## Troubleshooting

### Assets Not Showing
1. Check that files are in the correct folder
2. Ensure files are named with numbers (01.png, 02.png, etc.)
3. Verify files are PNG format
4. Check browser console for errors
5. Try refreshing the page or clicking the refresh button

### Production Issues
1. Ensure assets are in the `public/assets/` folder
2. Check that the build process includes the public folder
3. Verify that the server serves static files from the public directory
4. Check network tab for 404 errors on asset requests
