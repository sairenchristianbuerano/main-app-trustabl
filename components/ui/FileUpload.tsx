'use client'
import { useState, useRef } from 'react'
import { Upload, File, X } from 'lucide-react'

type FileState = 'uploading' | 'complete' | 'error'

interface UploadedFile {
  id: string
  name: string
  size: number
  state: FileState
  errorMessage?: string
}

interface FileUploadProps {
  accept?: string
  maxSize?: number
  multiple?: boolean
  onChange?: (files: File[]) => void
}

export function FileUpload({ accept, maxSize, multiple, onChange }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (newFiles: FileList) => {
    const fileArr = Array.from(newFiles)
    onChange?.(fileArr)
    const mapped: UploadedFile[] = fileArr.map((f, i) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2,9)}-${i}`,
      name: f.name,
      size: f.size,
      state: maxSize && f.size > maxSize ? 'error' : 'uploading',
      errorMessage: maxSize && f.size > maxSize ? 'File exceeds size limit.' : undefined,
    }))
    setFiles(prev => [...prev, ...mapped])
    mapped.filter(f => f.state === 'uploading').forEach(f => {
      setTimeout(() => setFiles(prev => prev.map(p => p.id === f.id ? { ...p, state: 'complete' } : p)), 1500)
    })
  }

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id))

  return (
    <div className="flex flex-col gap-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        className={[
          'flex flex-col items-center gap-2 px-6 py-8 rounded-[var(--radius-card)] border-[1.5px] border-dashed cursor-pointer text-center',
          'transition-[border-color,background] duration-150',
          dragOver
            ? 'border-[var(--color-text-primary)] bg-[var(--color-bg-surface)]'
            : 'border-[var(--color-border-muted)] hover:border-[var(--color-border-focus)] hover:bg-[var(--color-bg-surface)]',
        ].join(' ')}
      >
        <Upload size={24} className="text-[var(--color-text-tertiary)]" />
        <p className="text-sm font-medium text-[var(--color-text-primary)]">
          {dragOver ? 'Release to upload' : 'Drop files here'}
        </p>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          {accept ? `${accept} ` : ''}
          {maxSize ? `up to ${Math.round(maxSize / 1024 / 1024)}MB` : ''}
        </p>
      </div>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="sr-only" onChange={(e) => e.target.files && handleFiles(e.target.files)} />

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map(file => (
            <div key={file.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-sharp)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)]">
              <div className="w-8 h-8 rounded-[var(--radius-sharp)] border border-[var(--color-border-muted)] bg-[var(--color-bg-raised)] flex items-center justify-center flex-shrink-0">
                <File size={16} className={file.state === 'error' ? 'text-[var(--color-danger-text)]' : file.state === 'complete' ? 'text-[var(--color-success-text)]' : 'text-[var(--color-text-tertiary)]'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-text-primary)] truncate">{file.name}</p>
                <p className={['text-[11px]', file.state === 'error' ? 'text-[var(--color-danger-text)]' : file.state === 'complete' ? 'text-[var(--color-success-text)]' : 'text-[var(--color-text-secondary)]'].join(' ')}>
                  {file.state === 'uploading' ? 'Uploading...' : file.state === 'complete' ? 'Complete' : file.errorMessage}
                </p>
              </div>
              <button onClick={() => removeFile(file.id)} aria-label={`Remove ${file.name}`} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger-text)]">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
