# Resources

This directory should contain the yt-dlp executable for bundling with the application.

## For Windows Build:

1. Download the latest yt-dlp Windows executable from:
   https://github.com/yt-dlp/yt-dlp/releases/latest

2. Rename it to `yt-dlp.exe` and place it in this directory

3. The executable will be bundled with the application during build

## Development Mode:

During development (`npm run tauri:dev`), the application will use the system-installed yt-dlp from PATH.

Make sure you have yt-dlp installed:
```bash
# Windows (using winget)
winget install yt-dlp

# Or download from https://github.com/yt-dlp/yt-dlp/releases
```
