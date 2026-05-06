'use client'

import { useTransition } from 'react'
import { cancelPendaftaran } from '@/lib/actions/pendaftaran'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { usePendaftaranStore } from '@/lib/store/pendaftaranStore'

export function CancelDraftButton({ pendaftaranId }: { pendaftaranId: string }) {
  const [isPending, startTransition] = useTransition()
  const resetStore = usePendaftaranStore((state) => state.resetStore)

  const handleCancel = () => {
    if (!confirm('Anda yakin ingin membatalkan dan menghapus draft pendaftaran ini? Semua data dan dokumen yang telah diunggah akan dihapus secara permanen.')) {
      return
    }

    startTransition(async () => {
      const result = await cancelPendaftaran(pendaftaranId)
      if (result.error) {
        toast.error(result.error)
      } else {
        resetStore() // Reset local Zustand state
        toast.success('Draft pendaftaran berhasil dibatalkan')
      }
    })
  }

  return (
    <button 
      onClick={handleCancel}
      disabled={isPending}
      className="btn-ghost text-sm whitespace-nowrap text-rose-600 hover:bg-rose-50 hover:text-rose-700"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      Batalkan Draft
    </button>
  )
}
