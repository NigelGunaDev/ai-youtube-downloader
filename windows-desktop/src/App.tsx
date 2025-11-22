import { useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { save } from '@tauri-apps/api/dialog'
import { VideoInfo, VideoFormat } from './types'
import VideoInfoCard from './components/VideoInfoCard'
import FormatSelector from './components/FormatSelector'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [error, setError] = useState('')
  const [downloadType, setDownloadType] = useState<'video' | 'audio'>('video')
  const [selectedFormat, setSelectedFormat] = useState<VideoFormat | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState('')

  const fetchVideoInfo = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL')
      return
    }

    setLoading(true)
    setError('')
    setVideoInfo(null)
    setSelectedFormat(null)
    setDownloadSuccess('')

    try {
      const response = await invoke<VideoInfo>('get_video_info', { url })
      setVideoInfo(response)

      // Auto-select first format
      if (downloadType === 'video' && response.video_formats.length > 0) {
        setSelectedFormat(response.video_formats[0])
      } else if (downloadType === 'audio' && response.audio_formats.length > 0) {
        setSelectedFormat(response.audio_formats[0])
      }
    } catch (err: any) {
      setError(err || 'Failed to fetch video information')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!selectedFormat || !videoInfo) return

    setDownloading(true)
    setError('')
    setDownloadSuccess('')

    try {
      // Open save dialog to let user choose download location
      const savePath = await save({
        defaultPath: `${videoInfo.title}.${downloadType === 'audio' ? 'mp3' : selectedFormat.ext}`,
        filters: downloadType === 'audio'
          ? [{ name: 'Audio', extensions: ['mp3'] }]
          : [{ name: 'Video', extensions: [selectedFormat.ext] }]
      })

      if (!savePath) {
        setDownloading(false)
        return // User cancelled
      }

      const response = await invoke<{ success: boolean; filename: string; message: string }>('download_video', {
        url,
        formatId: selectedFormat.format_id,
        downloadType: downloadType,
        savePath: savePath
      })

      setDownloadSuccess(`Successfully downloaded: ${response.filename}`)
    } catch (err: any) {
      setError(err || 'Failed to download video')
    } finally {
      setDownloading(false)
    }
  }

  const handleDownloadTypeChange = (type: 'video' | 'audio') => {
    setDownloadType(type)
    if (videoInfo) {
      const formats = type === 'video' ? videoInfo.video_formats : videoInfo.audio_formats
      if (formats.length > 0) {
        setSelectedFormat(formats[0])
      }
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-800 mb-2">YouTube Downloader</h1>
            <p className="text-gray-600">Download videos and audio from YouTube in various formats</p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            {/* URL Input */}
            <div className="mb-6">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL
              </label>
              <div className="flex gap-2">
                <input
                  id="url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && fetchVideoInfo()}
                />
                <button
                  onClick={fetchVideoInfo}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {loading ? 'Loading...' : 'Fetch Info'}
                </button>
              </div>
            </div>

            {/* Download Type Toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Download Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadTypeChange('video')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    downloadType === 'video'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Video
                </button>
                <button
                  onClick={() => handleDownloadTypeChange('audio')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    downloadType === 'audio'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Audio Only
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {downloadSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">{downloadSuccess}</p>
              </div>
            )}

            {/* Video Info */}
            {videoInfo && <VideoInfoCard videoInfo={videoInfo} />}

            {/* Format Selector */}
            {videoInfo && (
              <FormatSelector
                formats={downloadType === 'video' ? videoInfo.video_formats : videoInfo.audio_formats}
                selectedFormat={selectedFormat}
                onSelectFormat={setSelectedFormat}
                downloadType={downloadType}
                formatFileSize={formatFileSize}
              />
            )}

            {/* Download Button */}
            {selectedFormat && (
              <div className="mt-6">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg transition-colors"
                >
                  {downloading ? 'Downloading...' : 'Download'}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-gray-600 text-sm">
            <p>Choose your download location when you click Download</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
