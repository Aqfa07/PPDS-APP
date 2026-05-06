'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { validateDokumen } from '@/lib/actions/dokumen'
import { toast } from 'sonner'

export function DokumenAction({ dokumenId, currentStatus }: { dokumenId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition()
  
  const handleValidate = (status: 'valid' | 'ditolak') => {
    let catatan = ''
    if (status === 'ditolak') {
      const reason = prompt('Masukkan alasan penolakan dokumen ini:')
      if (reason === null) return // cancelled
      catatan = reason
    }

    startTransition(async () => {
      const res = await validateDokumen(dokumenId, status, catatan)
      if (res.error) toast.error(res.error)
      else toast.success(`Dokumen ditandai ${status}`)
    })
  }

  if (currentStatus === 'valid') {
    return (
      <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-2 text-xs font-semibold">
        <CheckCircle2 className="w-4 h-4" /> Dokumen Valid
      </div>
    )
  }

  if (currentStatus === 'ditolak') {
    return (
      <div className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg border border-rose-100 flex items-center gap-2 text-xs font-semibold">
        <XCircle className="w-4 h-4" /> Dokumen Ditolak
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 w-full mt-2">
      <button 
        disabled={isPending}
        onClick={() => handleValidate('valid')}
        className="flex-1 btn-ghost text-xs px-2 py-2 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-100 border border-emerald-100"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4" />}
        Setujui
      </button>
      <button 
        disabled={isPending}
        onClick={() => handleValidate('ditolak')}
        className="flex-1 btn-ghost text-xs px-2 py-2 text-rose-600 bg-rose-50/50 hover:bg-rose-100 border border-rose-100"
      >
        <XCircle className="w-4 h-4" /> Tolak
      </button>
    </div>
  )
}
