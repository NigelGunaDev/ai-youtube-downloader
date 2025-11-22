// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::process::Command;
use regex::Regex;

#[derive(Debug, Serialize, Deserialize)]
struct VideoFormat {
    format_id: String,
    ext: String,
    filesize: Option<u64>,
    filesize_approx: Option<u64>,
    tbr: Option<f64>,
    resolution: Option<String>,
    fps: Option<u32>,
    vcodec: Option<String>,
    acodec: Option<String>,
    vbr: Option<f64>,
    abr: Option<f64>,
    asr: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
struct VideoInfo {
    title: String,
    duration: u64,
    thumbnail: String,
    uploader: String,
    video_formats: Vec<VideoFormat>,
    audio_formats: Vec<VideoFormat>,
}

#[derive(Debug, Serialize)]
struct DownloadResponse {
    success: bool,
    filename: String,
    message: String,
}

// Validate YouTube URL
fn validate_youtube_url(url: &str) -> bool {
    let patterns = [
        r"(https?://)?(www\.)?youtube\.com/watch\?v=[\w-]+",
        r"(https?://)?(www\.)?youtu\.be/[\w-]+",
        r"(https?://)?(www\.)?youtube\.com/embed/[\w-]+",
    ];

    patterns.iter().any(|pattern| {
        Regex::new(pattern)
            .unwrap()
            .is_match(url)
    })
}

// Get the path to yt-dlp executable
fn get_ytdlp_path() -> String {
    // In production, yt-dlp will be bundled in the resources folder
    // In development, assume it's in PATH or specify full path
    #[cfg(debug_assertions)]
    {
        "yt-dlp".to_string() // Use system yt-dlp in dev mode
    }
    #[cfg(not(debug_assertions))]
    {
        use tauri::api::path::resource_dir;
        use std::env;

        let resource_path = resource_dir(&tauri::Config::default(), &Default::default())
            .expect("Failed to get resource directory");

        #[cfg(target_os = "windows")]
        let ytdlp_name = "yt-dlp.exe";
        #[cfg(not(target_os = "windows"))]
        let ytdlp_name = "yt-dlp";

        resource_path.join(ytdlp_name)
            .to_str()
            .unwrap()
            .to_string()
    }
}

#[tauri::command]
async fn get_video_info(url: String) -> Result<VideoInfo, String> {
    // Validate URL
    if !validate_youtube_url(&url) {
        return Err("Invalid YouTube URL. Please provide a valid YouTube link (youtube.com or youtu.be)".to_string());
    }

    let ytdlp_path = get_ytdlp_path();

    // Execute yt-dlp to get video info
    let output = Command::new(&ytdlp_path)
        .args(&[
            "--dump-json",
            "--no-warnings",
            &url,
        ])
        .output()
        .map_err(|e| format!("Failed to execute yt-dlp: {}. Make sure yt-dlp is installed.", e))?;

    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Failed to fetch video info: {}", error));
    }

    let json_str = String::from_utf8_lossy(&output.stdout);
    let info: serde_json::Value = serde_json::from_str(&json_str)
        .map_err(|e| format!("Failed to parse video info: {}", e))?;

    // Process formats
    let mut video_formats = Vec::new();
    let mut audio_formats = Vec::new();

    if let Some(formats) = info["formats"].as_array() {
        for fmt in formats {
            let format_info = VideoFormat {
                format_id: fmt["format_id"].as_str().unwrap_or("").to_string(),
                ext: fmt["ext"].as_str().unwrap_or("").to_string(),
                filesize: fmt["filesize"].as_u64(),
                filesize_approx: fmt["filesize_approx"].as_u64(),
                tbr: fmt["tbr"].as_f64(),
                resolution: fmt["resolution"].as_str().map(|s| s.to_string()),
                fps: fmt["fps"].as_u64().map(|f| f as u32),
                vcodec: fmt["vcodec"].as_str().map(|s| s.to_string()),
                acodec: fmt["acodec"].as_str().map(|s| s.to_string()),
                vbr: fmt["vbr"].as_f64(),
                abr: fmt["abr"].as_f64(),
                asr: fmt["asr"].as_u64().map(|a| a as u32),
            };

            // Video formats (has both video and audio)
            if let (Some(vcodec), Some(acodec)) = (&format_info.vcodec, &format_info.acodec) {
                if vcodec != "none" && acodec != "none" {
                    video_formats.push(format_info);
                    continue;
                }
            }

            // Audio-only formats
            if let (Some(acodec), Some(vcodec)) = (&format_info.acodec, &format_info.vcodec) {
                if acodec != "none" && vcodec == "none" {
                    audio_formats.push(format_info);
                }
            }
        }
    }

    // Sort formats by bitrate
    video_formats.sort_by(|a, b| {
        let a_tbr = a.tbr.unwrap_or(0.0);
        let b_tbr = b.tbr.unwrap_or(0.0);
        b_tbr.partial_cmp(&a_tbr).unwrap()
    });

    audio_formats.sort_by(|a, b| {
        let a_abr = a.abr.unwrap_or(0.0);
        let b_abr = b.abr.unwrap_or(0.0);
        b_abr.partial_cmp(&a_abr).unwrap()
    });

    Ok(VideoInfo {
        title: info["title"].as_str().unwrap_or("Unknown").to_string(),
        duration: info["duration"].as_u64().unwrap_or(0),
        thumbnail: info["thumbnail"].as_str().unwrap_or("").to_string(),
        uploader: info["uploader"].as_str().unwrap_or("Unknown").to_string(),
        video_formats,
        audio_formats,
    })
}

#[tauri::command]
async fn download_video(
    url: String,
    format_id: String,
    download_type: String,
    save_path: String,
) -> Result<DownloadResponse, String> {
    // Validate URL
    if !validate_youtube_url(&url) {
        return Err("Invalid YouTube URL. Please provide a valid YouTube link (youtube.com or youtu.be)".to_string());
    }

    // Validate format_id
    let format_regex = Regex::new(r"^[a-zA-Z0-9+_-]+$").unwrap();
    if !format_regex.is_match(&format_id) {
        return Err("Invalid format ID".to_string());
    }

    let ytdlp_path = get_ytdlp_path();

    // Build command arguments
    let mut args = vec![
        "-f".to_string(),
        format_id.clone(),
        "-o".to_string(),
        save_path.clone(),
        "--no-warnings".to_string(),
    ];

    // For audio downloads, convert to mp3
    if download_type == "audio" {
        args.extend(vec![
            "--extract-audio".to_string(),
            "--audio-format".to_string(),
            "mp3".to_string(),
            "--audio-quality".to_string(),
            "192K".to_string(),
        ]);
    }

    args.push(url.clone());

    // Execute download
    let output = Command::new(&ytdlp_path)
        .args(&args)
        .output()
        .map_err(|e| format!("Failed to execute yt-dlp: {}. Make sure yt-dlp is installed.", e))?;

    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);

        // Provide specific error messages
        let error_lower = error.to_lowercase();
        let detail = if error_lower.contains("private") || error_lower.contains("unavailable") {
            "Video is unavailable, private, or has been removed.".to_string()
        } else if error_lower.contains("copyright") {
            "Video cannot be downloaded due to copyright restrictions.".to_string()
        } else if error_lower.contains("geo") || error_lower.contains("region") {
            "Video is not available in your region.".to_string()
        } else if error_lower.contains("format") {
            "Selected format is not available. Please try a different quality.".to_string()
        } else {
            format!("Download failed: {}", error)
        };

        return Err(detail);
    }

    let filename = std::path::Path::new(&save_path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("downloaded_file")
        .to_string();

    Ok(DownloadResponse {
        success: true,
        filename,
        message: "Download completed successfully".to_string(),
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_video_info, download_video])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
