import React, { useRef, useState } from 'react'
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react'

interface PhotoUploadProps {
  onPhotoSelected: (file: File | null) => void
  error?: string
}

export function PhotoUpload({ onPhotoSelected, error }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, or WebP).')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.')
      return
    }

    setFileName(file.name)
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB')

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    onPhotoSelected(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
    setFileName(null)
    setFileSize(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onPhotoSelected(null)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="font-display font-bold text-sm text-brand-ink uppercase tracking-wider flex items-center gap-1.5">
        <ImageIcon size={16} />
        Evidence Photograph <span className="text-brand-red">*</span>
      </label>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onDrop={handleDrop}
        className={[
          'relative border-2 border-dashed border-brand-ink p-6 transition-colors cursor-pointer',
          'flex flex-col items-center justify-center text-center gap-3',
          preview ? 'bg-white' : 'bg-brand-sage/40 hover:bg-brand-sage',
          error ? 'border-brand-red' : '',
        ].join(' ')}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0])
            }
          }}
        />

        {preview ? (
          <div className="w-full flex flex-col items-center gap-3">
            <div className="relative border-2 border-brand-ink bg-brand-offwhite max-h-64 overflow-hidden">
              <img
                src={preview}
                alt="Selected evidence preview"
                className="max-h-64 object-contain"
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 p-1.5 bg-brand-red text-white border-2 border-brand-ink shadow-brutal-sm hover:scale-105 transition-transform"
                title="Remove photo"
              >
                <X size={16} />
              </button>
            </div>
            <div className="text-xs font-semibold text-brand-ink flex items-center gap-2">
              <span>{fileName}</span>
              <span className="text-brand-ink/50">({fileSize})</span>
            </div>
            <span className="text-xs text-brand-ink/60 underline">Click or drop to replace</span>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-white border-2 border-brand-ink flex items-center justify-center shadow-brutal-sm">
              <UploadCloud size={24} className="text-brand-ink" />
            </div>
            <div>
              <p className="font-semibold text-sm text-brand-ink">
                Click to browse or drag and drop a photograph
              </p>
              <p className="text-xs text-brand-ink/60 mt-1">
                JPG, PNG, or WebP up to 10MB
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-brand-red font-semibold flex items-center gap-1 mt-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  )
}
