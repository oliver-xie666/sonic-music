# Sonic Music Icons

This directory contains all icon assets for the Sonic Music project.

## Icon Design Concept

The Sonic Music logo features a modern, minimalist design combining:
- **Sound waves**: Representing audio and music
- **Circular motion**: Symbolizing continuous playback
- **Gradient colors**: Modern, vibrant aesthetic

## Color Palette

Primary colors:
- **Primary Blue**: #3B82F6 (Sonic blue)
- **Accent Purple**: #8B5CF6 (Energy and creativity)
- **Gradient**: Linear gradient from blue to purple

## Icon Sizes

### Desktop (Electron)
- `icon.icns` - macOS icon (512x512@2x)
- `icon.ico` - Windows icon (256x256)
- `icon.png` - Linux icon (512x512)

### Web (PWA)
- `icon-192.png` - Android icon (192x192)
- `icon-512.png` - Android icon (512x512)
- `favicon.ico` - Browser favicon (32x32)
- `apple-touch-icon.png` - iOS icon (180x180)

### Mobile (uni-app x)
- `logo.png` - App logo (1024x1024)
- Various sizes for different devices

## Usage

Icons are automatically referenced in build configurations:
- Electron: `electron-builder` config in `apps/electron/package.json`
- Web: PWA manifest in `apps/web/public/manifest.json`
- Mobile: uni-app x config in `apps/mobile/manifest.json`
