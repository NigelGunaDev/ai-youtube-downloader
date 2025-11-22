# YouTube Downloader - Windows Desktop Application

A native Windows desktop application for downloading YouTube videos and audio, built with Tauri + React + TypeScript.

## Features

- 🎥 Download YouTube videos in multiple formats and qualities
- 🎵 Extract audio and convert to MP3
- 🖥️ Native Windows application (small ~15MB size)
- 🎨 Modern, clean UI with Tailwind CSS
- 💾 Choose download location with native file dialog
- ⚡ Fast and lightweight
- 🔒 Secure (no web server required, everything runs locally)

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Rust (Tauri)
- **Downloader**: yt-dlp
- **UI Framework**: Tauri (native desktop)

## Prerequisites

Before you begin, ensure you have the following installed:

### Required:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/

2. **Rust** (latest stable)
   - Download from: https://rustup.rs/
   - After installation, restart your terminal

3. **yt-dlp**
   - For development/testing
   - Install via winget: `winget install yt-dlp`
   - Or download from: https://github.com/yt-dlp/yt-dlp/releases

### Optional (for building):

4. **Visual Studio Build Tools** (for Windows)
   - Download from: https://visualstudio.microsoft.com/downloads/
   - Select "Desktop development with C++" workload

## Installation & Setup

### 1. Clone or navigate to the project

```bash
cd windows-desktop
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run in development mode

```bash
npm run tauri:dev
```

This will:
- Start the Vite dev server
- Compile the Rust backend
- Launch the application in development mode

**Note**: In development mode, the app uses the system-installed `yt-dlp` from your PATH.

## Building for Production

### 1. Download yt-dlp executable

For production builds, you need to bundle yt-dlp with the application:

1. Download the latest Windows executable: https://github.com/yt-dlp/yt-dlp/releases/latest
2. Look for `yt-dlp.exe` in the Assets section
3. Place `yt-dlp.exe` in `src-tauri/resources/` directory

### 2. Generate application icons (optional)

Place your icons in `src-tauri/icons/`:
- `icon.ico` - Windows icon (required)
- `32x32.png`, `128x128.png`, `128x128@2x.png` - Various sizes

You can use Tauri's default icons or generate custom ones:
- https://tauri.app/v1/guides/features/icons

### 3. Build the application

```bash
npm run tauri:build
```

This will:
- Build the React frontend for production
- Compile the Rust backend with optimizations
- Bundle yt-dlp with the application
- Create installers in `src-tauri/target/release/bundle/`

### Build outputs:

- **MSI Installer**: `src-tauri/target/release/bundle/msi/YouTube Downloader_1.0.0_x64_en-US.msi`
- **Executable**: `src-tauri/target/release/youtube-downloader-desktop.exe`
- **NSIS Installer**: `src-tauri/target/release/bundle/nsis/` (if configured)

## Project Structure

```
windows-desktop/
├── src/                          # React frontend source
│   ├── components/              # React components
│   │   ├── VideoInfoCard.tsx   # Video information display
│   │   └── FormatSelector.tsx  # Format/quality selector
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # React entry point
│   ├── types.ts                # TypeScript type definitions
│   └── index.css               # Global styles (Tailwind)
├── src-tauri/                   # Rust backend
│   ├── src/
│   │   └── main.rs             # Rust application code
│   ├── icons/                  # Application icons
│   ├── resources/              # Bundled resources (yt-dlp)
│   ├── Cargo.toml              # Rust dependencies
│   ├── tauri.conf.json         # Tauri configuration
│   └── build.rs                # Build script
├── index.html                   # HTML entry point
├── package.json                 # Node.js dependencies
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## How It Works

### Architecture:

1. **Frontend (React)**:
   - User enters YouTube URL
   - Clicks "Fetch Info" → calls Rust backend via Tauri IPC
   - Displays video information and available formats
   - User selects format and clicks "Download"
   - Native file dialog opens for save location
   - Download starts and shows progress

2. **Backend (Rust)**:
   - Receives commands from frontend via Tauri IPC
   - Validates YouTube URLs for security
   - Executes yt-dlp as a child process
   - Parses JSON output from yt-dlp
   - Returns formatted data to frontend
   - Handles downloads to user-specified location

### Key Features:

- **No web server**: Everything runs locally in the desktop app
- **Native file dialogs**: Windows-native save dialogs
- **Secure**: URL validation, format ID sanitization
- **Small bundle**: ~15MB total (vs 150MB+ for Electron)
- **Fast startup**: Native performance with Rust

## Development Commands

```bash
# Install dependencies
npm install

# Run in development mode (hot reload)
npm run tauri:dev

# Build for production
npm run tauri:build

# Run frontend only (without Tauri)
npm run dev

# Build frontend only
npm run build
```

## Troubleshooting

### Error: "yt-dlp not found"

**In development mode:**
- Make sure yt-dlp is installed: `winget install yt-dlp`
- Or download from: https://github.com/yt-dlp/yt-dlp/releases
- Add to PATH or place in project directory

**In production build:**
- Ensure `yt-dlp.exe` is in `src-tauri/resources/` before building

### Error: "Failed to build Rust project"

- Ensure Rust is installed: `rustup --version`
- Install Visual Studio Build Tools with C++ workload
- Restart terminal after installing Rust

### Build is slow

First build will take 5-10 minutes as it compiles all Rust dependencies. Subsequent builds are much faster due to caching.

### Icons not showing

- Make sure `icon.ico` exists in `src-tauri/icons/`
- You can use Tauri's default icons or generate custom ones
- See: https://tauri.app/v1/guides/features/icons

## Customization

### Change window size

Edit `src-tauri/tauri.conf.json`:

```json
"windows": [{
  "width": 1000,    // Change width
  "height": 800,    // Change height
  "minWidth": 800,  // Minimum width
  "minHeight": 600  // Minimum height
}]
```

### Change application name

Edit `src-tauri/tauri.conf.json`:

```json
"package": {
  "productName": "Your App Name",
  "version": "1.0.0"
}
```

Also update `src-tauri/Cargo.toml`:

```toml
[package]
name = "your-app-name"
```

### Modify UI theme

All styles are in Tailwind CSS. Edit:
- `src/App.tsx` - Main application styles
- `src/components/*.tsx` - Component styles
- `tailwind.config.js` - Tailwind theme customization

## Differences from Web Version

| Feature | Web App | Desktop App |
|---------|---------|-------------|
| Tech | FastAPI + React | Tauri + React |
| Backend | Python | Rust |
| Size | Backend ~50MB + Frontend | ~15MB total |
| Server | Required (FastAPI) | None (all local) |
| Download location | Fixed folder | User chooses via dialog |
| Installation | Manual setup | Single .exe or .msi |
| Updates | Manual git pull | Rebuild installer |

## Security Features

- ✅ YouTube URL validation (only allows valid YouTube URLs)
- ✅ Format ID sanitization (prevents command injection)
- ✅ Tauri security allowlist (minimal permissions)
- ✅ No remote code execution
- ✅ All downloads to user-specified locations

## Performance

- **Bundle size**: ~15MB (compared to 150MB+ for Electron)
- **Memory usage**: ~50MB (compared to 150MB+ for Electron)
- **Startup time**: < 1 second
- **Download speed**: Same as yt-dlp (network limited)

## License

This project uses:
- Tauri (MIT/Apache-2.0)
- React (MIT)
- yt-dlp (Unlicense)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Check yt-dlp is working: `yt-dlp --version`
4. Check Rust is installed: `rustc --version`
5. Check Node.js is installed: `node --version`

## Future Enhancements

Potential features to add:
- [ ] Download progress bar with percentage
- [ ] Download history
- [ ] Playlist support
- [ ] Batch downloads
- [ ] Custom output templates
- [ ] Proxy support
- [ ] Dark mode toggle
- [ ] Auto-updates (Tauri updater)

## Credits

- Built with [Tauri](https://tauri.app/)
- Powered by [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- UI with [Tailwind CSS](https://tailwindcss.com/)
