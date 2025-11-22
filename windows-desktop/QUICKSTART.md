# Quick Start Guide

Get the Windows YouTube Downloader running in 5 minutes!

## Step 1: Install Prerequisites (one-time setup)

### Install Node.js
```bash
# Download and install from: https://nodejs.org/
# Choose LTS version (recommended)
```

### Install Rust
```bash
# Download and install from: https://rustup.rs/
# Run the installer and follow prompts
# IMPORTANT: Restart your terminal after installation
```

### Install yt-dlp
```bash
# Option 1: Using winget (easiest)
winget install yt-dlp

# Option 2: Manual download
# Download from: https://github.com/yt-dlp/yt-dlp/releases
# Add to PATH or place in this directory
```

### Verify installations
```bash
node --version   # Should show v18.x.x or higher
rustc --version  # Should show rustc 1.x.x
yt-dlp --version # Should show year.month.day
```

## Step 2: Install Project Dependencies

```bash
cd windows-desktop
npm install
```

## Step 3: Run the App

```bash
npm run tauri:dev
```

The application window will open automatically!

## Step 4: Use the App

1. Paste a YouTube URL
2. Click "Fetch Info"
3. Select video or audio
4. Choose your preferred quality
5. Click "Download"
6. Select where to save the file
7. Wait for download to complete!

## Building for Distribution

Want to create an installer?

### 1. Download yt-dlp.exe for bundling

```bash
# Download from: https://github.com/yt-dlp/yt-dlp/releases/latest
# Look for "yt-dlp.exe" in Assets
# Place it in: src-tauri/resources/yt-dlp.exe
```

### 2. Build the installer

```bash
npm run tauri:build
```

### 3. Find your installer

```
src-tauri/target/release/bundle/msi/YouTube Downloader_1.0.0_x64_en-US.msi
```

Double-click to install!

## Troubleshooting

### "yt-dlp not found"
- Install yt-dlp: `winget install yt-dlp`
- Restart terminal
- Try again

### "Rust build failed"
- Install Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads/
- Select "Desktop development with C++"
- Restart terminal
- Try again

### "Port 1420 already in use"
- Close other instances of the app
- Or change port in `vite.config.ts`

### Still having issues?
- Read the full README.md
- Make sure all prerequisites are installed
- Restart your computer (seriously, this helps with PATH issues)

## What's Next?

- Customize the UI in `src/App.tsx`
- Modify window settings in `src-tauri/tauri.conf.json`
- Add new features in `src-tauri/src/main.rs`
- Read the full README.md for advanced features

Enjoy your YouTube Downloader! 🎉
