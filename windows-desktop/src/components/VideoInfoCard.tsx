import { VideoInfo } from '../types'

interface VideoInfoCardProps {
  videoInfo: VideoInfo
}

const VideoInfoCard = ({ videoInfo }: VideoInfoCardProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex gap-4">
        {videoInfo.thumbnail && (
          <img
            src={videoInfo.thumbnail}
            alt={videoInfo.title}
            className="w-40 h-24 object-cover rounded-lg"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-800 mb-1">{videoInfo.title}</h3>
          <p className="text-sm text-gray-600 mb-1">Uploader: {videoInfo.uploader}</p>
          <p className="text-sm text-gray-600">
            Duration: {formatDuration(videoInfo.duration)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default VideoInfoCard
