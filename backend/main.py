from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import yt_dlp
import os
from pathlib import Path
import json
import re
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="YouTube Downloader API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Download directory
DOWNLOAD_DIR = Path(__file__).parent.parent / "downloads"
DOWNLOAD_DIR.mkdir(exist_ok=True)


class VideoInfoRequest(BaseModel):
    url: str


class DownloadRequest(BaseModel):
    url: str
    format_id: str
    download_type: str  # 'video' or 'audio'


def validate_youtube_url(url: str) -> bool:
    """Validate that URL is a legitimate YouTube URL"""
    youtube_patterns = [
        r'(https?://)?(www\.)?youtube\.com/watch\?v=[\w-]+',
        r'(https?://)?(www\.)?youtu\.be/[\w-]+',
        r'(https?://)?(www\.)?youtube\.com/embed/[\w-]+',
    ]
    return any(re.match(pattern, url) for pattern in youtube_patterns)


def progress_hook(d):
    """Progress hook for download tracking"""
    if d['status'] == 'downloading':
        try:
            percent = d.get('_percent_str', 'N/A')
            speed = d.get('_speed_str', 'N/A')
            eta = d.get('_eta_str', 'N/A')
            logger.info(f"Downloading: {percent} at {speed} - ETA: {eta}")
        except:
            pass
    elif d['status'] == 'finished':
        logger.info(f"Download finished: {d.get('filename', 'unknown')}")
    elif d['status'] == 'error':
        logger.error(f"Download error occurred")


@app.get("/")
def read_root():
    return {"message": "YouTube Downloader API is running"}


@app.post("/api/video-info")
async def get_video_info(request: VideoInfoRequest):
    """Fetch video information including available formats"""
    # Validate URL
    if not validate_youtube_url(request.url):
        raise HTTPException(
            status_code=400,
            detail="Invalid YouTube URL. Please provide a valid YouTube link (youtube.com or youtu.be)"
        )

    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=False)

            # Process formats
            video_formats = []
            audio_formats = []

            for fmt in info.get('formats', []):
                format_info = {
                    'format_id': fmt.get('format_id'),
                    'ext': fmt.get('ext'),
                    'filesize': fmt.get('filesize'),
                    'filesize_approx': fmt.get('filesize_approx'),
                    'tbr': fmt.get('tbr'),  # Total bitrate
                }

                # Video formats
                if fmt.get('vcodec') != 'none' and fmt.get('acodec') != 'none':
                    format_info.update({
                        'resolution': fmt.get('resolution'),
                        'fps': fmt.get('fps'),
                        'vcodec': fmt.get('vcodec'),
                        'acodec': fmt.get('acodec'),
                        'vbr': fmt.get('vbr'),  # Video bitrate
                        'abr': fmt.get('abr'),  # Audio bitrate
                    })
                    video_formats.append(format_info)

                # Audio-only formats
                elif fmt.get('acodec') != 'none' and fmt.get('vcodec') == 'none':
                    format_info.update({
                        'acodec': fmt.get('acodec'),
                        'abr': fmt.get('abr'),
                        'asr': fmt.get('asr'),  # Audio sampling rate
                    })
                    audio_formats.append(format_info)

            # Sort formats
            video_formats.sort(key=lambda x: (x.get('tbr') or 0), reverse=True)
            audio_formats.sort(key=lambda x: (x.get('abr') or 0), reverse=True)

            return {
                'title': info.get('title'),
                'duration': info.get('duration'),
                'thumbnail': info.get('thumbnail'),
                'uploader': info.get('uploader'),
                'video_formats': video_formats,
                'audio_formats': audio_formats,
            }

    except yt_dlp.utils.DownloadError as e:
        logger.error(f"Download error for {request.url}: {e}")
        raise HTTPException(
            status_code=400,
            detail="Failed to fetch video info. The video may be unavailable, private, or region-locked."
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred. Please check the URL and try again."
        )


@app.post("/api/download")
async def download_video(request: DownloadRequest):
    """Download video or audio in specified format"""
    # Validate URL
    if not validate_youtube_url(request.url):
        raise HTTPException(
            status_code=400,
            detail="Invalid YouTube URL. Please provide a valid YouTube link (youtube.com or youtu.be)"
        )

    # Validate format_id
    if not re.match(r'^[a-zA-Z0-9+_-]+$', request.format_id):
        raise HTTPException(status_code=400, detail="Invalid format ID")

    try:
        logger.info(f"Starting download: {request.url} - Format: {request.format_id} - Type: {request.download_type}")

        # Set up download options
        ydl_opts = {
            'format': request.format_id,
            'outtmpl': str(DOWNLOAD_DIR / '%(title)s.%(ext)s'),
            'restrictfilenames': True,  # Security: Sanitize filenames
            'progress_hooks': [progress_hook],  # Track download progress
            'quiet': False,
            'no_warnings': False,
        }

        # For audio-only downloads, convert to mp3
        if request.download_type == 'audio':
            ydl_opts.update({
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
            })

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=True)

            # Get the filename
            if request.download_type == 'audio':
                filename = ydl.prepare_filename(info).rsplit('.', 1)[0] + '.mp3'
            else:
                filename = ydl.prepare_filename(info)

            logger.info(f"Download completed: {os.path.basename(filename)}")

            return {
                'success': True,
                'filename': os.path.basename(filename),
                'message': 'Download completed successfully'
            }

    except yt_dlp.utils.DownloadError as e:
        logger.error(f"Download error for {request.url}: {e}")
        error_msg = str(e).lower()

        # Provide specific error messages based on error type
        if 'private' in error_msg or 'unavailable' in error_msg:
            detail = "Video is unavailable, private, or has been removed."
        elif 'copyright' in error_msg:
            detail = "Video cannot be downloaded due to copyright restrictions."
        elif 'geo' in error_msg or 'region' in error_msg:
            detail = "Video is not available in your region."
        elif 'format' in error_msg:
            detail = "Selected format is not available. Please try a different quality."
        else:
            detail = f"Download failed: {str(e)}"

        raise HTTPException(status_code=400, detail=detail)

    except Exception as e:
        logger.exception(f"Unexpected error during download: {e}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during download. Please try again."
        )


@app.get("/api/downloads")
async def list_downloads():
    """List all downloaded files"""
    try:
        files = []
        for file in DOWNLOAD_DIR.iterdir():
            if file.is_file():
                files.append({
                    'name': file.name,
                    'size': file.stat().st_size,
                    'created': file.stat().st_ctime,
                })
        return {'files': files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
