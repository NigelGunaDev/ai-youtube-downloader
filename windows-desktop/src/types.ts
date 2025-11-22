export interface VideoFormat {
  format_id: string;
  ext: string;
  filesize?: number;
  filesize_approx?: number;
  tbr?: number;
  resolution?: string;
  fps?: number;
  vcodec?: string;
  acodec?: string;
  vbr?: number;
  abr?: number;
  asr?: number;
}

export interface VideoInfo {
  title: string;
  duration: number;
  thumbnail: string;
  uploader: string;
  video_formats: VideoFormat[];
  audio_formats: VideoFormat[];
}

export interface DownloadRequest {
  url: string;
  format_id: string;
  download_type: 'video' | 'audio';
}

export interface DownloadResponse {
  success: boolean;
  filename: string;
  path: string;
  message: string;
}
