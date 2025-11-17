import { VideoFormat } from '../types'

interface FormatSelectorProps {
  formats: VideoFormat[]
  selectedFormat: VideoFormat | null
  onSelectFormat: (format: VideoFormat) => void
  downloadType: 'video' | 'audio'
  formatFileSize: (bytes?: number) => string
}

const FormatSelector = ({
  formats,
  selectedFormat,
  onSelectFormat,
  downloadType,
  formatFileSize,
}: FormatSelectorProps) => {
  if (formats.length === 0) {
    return (
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">No {downloadType} formats available</p>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Format / Quality
      </label>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {formats.map((format) => (
          <button
            key={format.format_id}
            onClick={() => onSelectFormat(format)}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
              selectedFormat?.format_id === format.format_id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {downloadType === 'video' ? (
                    <>
                      {format.resolution || 'Unknown resolution'} - {format.ext}
                      {format.fps && ` @ ${format.fps}fps`}
                    </>
                  ) : (
                    <>
                      {format.ext} - {format.abr ? `${format.abr}kbps` : 'Unknown bitrate'}
                      {format.asr && ` @ ${format.asr}Hz`}
                    </>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {downloadType === 'video' && format.vcodec && (
                    <span className="mr-3">Video: {format.vcodec.split('.')[0]}</span>
                  )}
                  {format.acodec && format.acodec !== 'none' && (
                    <span className="mr-3">Audio: {format.acodec}</span>
                  )}
                  {format.tbr && <span>Bitrate: {Math.round(format.tbr)}kbps</span>}
                </div>
              </div>
              <div className="text-sm text-gray-600 ml-4">
                {formatFileSize(format.filesize || format.filesize_approx)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default FormatSelector
