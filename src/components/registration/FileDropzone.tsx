'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface FileDropzoneProps {
  label:          string
  jenisDokumen:   string
  pendaftaranId:  string
  onUploadSuccess?: (dokumenId: string) => void
  isRequired?:    boolean
  currentStatus?: 'idle' | 'uploading' | 'success' | 'error'
  currentFile?:   string
}

export function FileDropzone({
  label, jenisDokumen, pendaftaranId,
  onUploadSuccess, isRequired = false,
  currentStatus = 'idle', currentFile,
}: FileDropzoneProps) {
  const [status,   setStatus]   = useState<'idle' | 'uploading' | 'success' | 'error'>(currentStatus)
  const [fileName, setFileName] = useState<string | null>(currentFile ?? null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Client-side validation
    if (file.type !== 'application/pdf') {
      toast.error('Hanya file PDF yang diizinkan')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB')
      return
    }

    setStatus('uploading')
    setFileName(file.name)

    const formData = new FormData()
    formData.append('file',          file)
    formData.append('jenis_dokumen', jenisDokumen)
    formData.append('pendaftaran_id',pendaftaranId)

    try {
      const res = await fetch('/api/dokumen/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok || data.error) {
        setStatus('error')
        toast.error(data.error ?? 'Upload gagal')
        return
      }

      setStatus('success')
      toast.success(`${label} berhasil diunggah`)
      onUploadSuccess?.(data.dokumenId)
    } catch {
      setStatus('error')
      toast.error('Terjadi kesalahan saat upload')
    }
  }, [jenisDokumen, pendaftaranId, label, onUploadSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: status === 'uploading',
  })

  const reset = () => { setStatus('idle'); setFileName(null) }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="label mb-0 text-slate-700">{label}</label>
        {isRequired && <span className="text-rose-500 text-xs font-bold">*</span>}
        {status === 'success' && (
          <span className="badge bg-emerald-50 text-emerald-700 ml-auto">
            <CheckCircle2 className="w-3 h-3" /> Terunggah
          </span>
        )}
      </div>

      {status === 'success' ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-700 truncate">{fileName}</p>
            <p className="text-xs text-emerald-500">PDF · Berhasil diunggah</p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-emerald-400 hover:text-emerald-600 transition-colors p-1 rounded-lg hover:bg-emerald-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200',
            isDragActive
              ? 'border-emerald-400 bg-emerald-50 scale-[1.01]'
              : 'border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/50',
            status === 'uploading' && 'pointer-events-none opacity-70',
            status === 'error'     && 'border-rose-300 bg-rose-50'
          )}
        >
          <input {...getInputProps()} />

          {status === 'uploading' ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-sm text-slate-600 font-medium">Mengunggah {fileName}…</p>
            </div>
          ) : status === 'error' ? (
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 text-rose-400" />
              <p className="text-sm text-rose-600 font-medium">Upload gagal. Coba lagi?</p>
              <p className="text-xs text-slate-400">Klik atau seret file PDF (maks. 2MB)</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                isDragActive ? 'bg-emerald-100' : 'bg-slate-100'
              )}>
                <Upload className={cn(
                  'w-6 h-6 transition-colors',
                  isDragActive ? 'text-emerald-600' : 'text-slate-400'
                )} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">
                  {isDragActive ? 'Lepaskan file di sini' : 'Seret & lepas file di sini'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">atau klik untuk memilih • PDF • Maks. 2MB</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
