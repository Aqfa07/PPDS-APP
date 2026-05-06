'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/lib/actions/profile'
import { Camera, Save, User, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function SettingsForm({ initialData }: { initialData: any }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatar_url || null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran foto maksimal 2MB')
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Profil berhasil diperbarui!')
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-emerald-100 shadow-sm flex items-center justify-center relative">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-slate-400" />
            )}
            
            <div 
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <input 
            type="file" 
            name="avatar" 
            accept="image/png, image/jpeg, image/jpg" 
            ref={fileInputRef}
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>
        <div className="text-center sm:text-left">
          <h3 className="font-semibold text-slate-800">Foto Profil</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Unggah pas foto formal terbaru. Format JPG/PNG maksimal 2MB.
          </p>
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Pilih Foto Baru
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nama Lengkap (Sesuai KTP/Ijazah)</label>
            <input 
              type="text" 
              name="full_name" 
              defaultValue={initialData?.full_name ?? ''}
              required
              className="input-field"
              placeholder="Contoh: Dr. Budi Santoso, Sp.A"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Email Akun (Tidak dapat diubah)</label>
            <input 
              type="email" 
              disabled
              defaultValue={initialData?.email ?? ''}
              className="input-field bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          type="submit" 
          disabled={isPending}
          className="btn-primary w-full sm:w-auto"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
          ) : (
            <><Save className="w-4 h-4" /> Simpan Profil</>
          )}
        </button>
      </div>
    </form>
  )
}
