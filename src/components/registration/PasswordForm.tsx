'use client'

import { useState, useTransition } from 'react'
import { updatePassword } from '@/lib/actions/profile'
import { KeyRound, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function PasswordForm() {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const form = e.currentTarget
    
    startTransition(async () => {
      const result = await updatePassword(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Password berhasil diperbarui!')
        form.reset()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Keamanan Akun</h3>
          <p className="text-xs text-slate-500">Perbarui kata sandi Anda secara berkala</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Password Baru</label>
          <input 
            type="password" 
            name="password" 
            required
            minLength={6}
            className="input-field"
            placeholder="Minimal 6 karakter"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Konfirmasi Password Baru</label>
          <input 
            type="password" 
            name="confirm_password" 
            required
            minLength={6}
            className="input-field"
            placeholder="Ulangi password baru"
          />
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
            <><Save className="w-4 h-4" /> Ganti Password</>
          )}
        </button>
      </div>
    </form>
  )
}
