# YouTube Downloader

A modern, user-friendly YouTube downloader with a web interface. Download videos and audio from YouTube in various formats and bitrates.

## Features

- Clean, modern web interface
- Download videos in multiple resolutions (720p, 1080p, 4K, etc.)
- Download audio-only files (automatically converted to MP3)
- Multiple bitrate options for both video and audio
- Video preview with thumbnail, title, uploader, and duration
- Real-time format information including file size estimates
- Downloads saved to local filesystem
- **Real-time download progress** - See download progress in terminal logs
- **Smart error messages** - Specific error messages for different failure scenarios
- **Security hardened** - Filename sanitization and URL validation
- **Auto-updated** - Uses latest yt-dlp version for YouTube compatibility

## Tech Stack

**Backend:**
- Python 3.8+
- FastAPI
- yt-dlp

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn
- FFmpeg (required for audio conversion)

### Installing FFmpeg

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd ai-youtube-downloader
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

pip install -r requirements.txt
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

## Running the Application

You need to run both the backend and frontend servers.

### Terminal 1 - Backend

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

The backend API will be available at `http://localhost:8000`

**Note:** Download progress will be displayed in this terminal window, showing:
- Download percentage
- Download speed
- Estimated time remaining

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. Open your browser and go to `http://localhost:5173`
2. Paste a YouTube URL into the input field
3. Click "Fetch Info" to retrieve video information
4. Choose between "Video" or "Audio Only" download
5. Select your preferred format/quality from the list
6. Click "Download" to start the download
7. Files will be saved to the `downloads/` directory

## API Endpoints

### GET /
Health check endpoint

### POST /api/video-info
Fetch video information and available formats

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "title": "Video Title",
  "duration": 300,
  "thumbnail": "https://...",
  "uploader": "Channel Name",
  "video_formats": [...],
  "audio_formats": [...]
}
```

### POST /api/download
Download video or audio in specified format

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "format_id": "137",
  "download_type": "video"
}
```

**Response:**
```json
{
  "success": true,
  "filename": "video.mp4",
  "path": "/path/to/downloads/video.mp4",
  "message": "Download completed successfully"
}
```

### GET /api/downloads
List all downloaded files

## Project Structure

```
ai-youtube-downloader/
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.tsx          # Main application component
│   │   ├── main.tsx         # Entry point
│   │   ├── types.ts         # TypeScript type definitions
│   │   └── index.css        # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── downloads/               # Downloaded files location
└── README.md
```

## Features Explained

### Video Download
- Automatically fetches all available video formats
- Shows resolution, FPS, codec information
- Displays approximate file size
- Downloads video with audio embedded

### Audio Download
- Extracts audio-only streams
- Automatically converts to MP3 format
- Multiple bitrate options (128kbps, 192kbps, 256kbps, etc.)
- Smaller file sizes compared to video

### Format Selection
- Clear display of quality options
- File size estimates for bandwidth planning
- Codec information for compatibility checking
- Sorted by quality (highest first)

## Troubleshooting

### Backend won't start
- Ensure Python 3.8+ is installed: `python --version`
- Activate virtual environment
- Install dependencies: `pip install -r requirements.txt`
- If you see import errors, try: `pip install --upgrade -r requirements.txt`

### Frontend won't start
- Ensure Node.js 16+ is installed: `node --version`
- Install dependencies: `npm install`
- Check if port 5173 is available

### Downloads fail
- Ensure FFmpeg is installed: `ffmpeg -version`
- Check YouTube URL is valid (must be youtube.com or youtu.be)
- The app will show specific error messages:
  - "Video is unavailable, private, or has been removed" - Video doesn't exist or is private
  - "Video cannot be downloaded due to copyright restrictions" - Copyright protected
  - "Video is not available in your region" - Geo-blocked content
  - "Selected format is not available" - Try a different quality
- Some videos may be age-restricted or require sign-in

### CORS errors
- Ensure backend is running on port 8000
- Check frontend proxy configuration in `vite.config.ts`

### yt-dlp errors
- YouTube frequently changes their API, update yt-dlp:
  ```bash
  pip install --upgrade yt-dlp
  ```

## Development

### Backend Development
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - The amazing YouTube download library
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React](https://react.dev/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
