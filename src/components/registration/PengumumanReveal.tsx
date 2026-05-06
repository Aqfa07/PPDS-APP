'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle2, XCircle, Trophy } from 'lucide-react'
import Confetti from 'react-dom-confetti'

interface Props {
  status: string
  prodiName: string
}

const config = {
  angle: 90,
  spread: 360,
  startVelocity: 40,
  elementCount: 70,
  dragFriction: 0.12,
  duration: 3000,
  stagger: 3,
  width: "10px",
  height: "10px",
  perspective: "500px",
  colors: ["#10b981", "#34d399", "#059669", "#fbbf24", "#f59e0b"]
}

export function PengumumanReveal({ status, prodiName }: Props) {
  const [revealed, setRevealed] = useState(false)
  const isLulus = status === 'lulus_final' || status === 'lulus_administrasi' || status === 'lulus_ujian'

  // Persist state
  useEffect(() => {
    const saved = sessionStorage.getItem(`pengumuman_revealed_${status}`)
    if (saved === 'true') {
      setRevealed(true)
    }
  }, [status])

  const handleReveal = () => {
    setRevealed(true)
    sessionStorage.setItem(`pengumuman_revealed_${status}`, 'true')
  }

  let title = 'Pengumuman Tersedia!'
  let desc = 'Hasil seleksi Anda sudah dapat dilihat.'
  
  if (status === 'lulus_administrasi') {
    title = 'Hasil Seleksi Administrasi'
    desc = `Selamat! Anda telah lulus tahap seleksi administrasi untuk program studi ${prodiName}. Silakan bersiap untuk tahap Ujian.`
  } else if (status === 'lulus_ujian') {
    title = 'Hasil Seleksi Ujian'
    desc = `Selamat! Anda telah lulus tahap ujian tertulis/wawancara untuk program studi ${prodiName}.`
  } else if (status === 'lulus_final') {
    title = 'Hasil Seleksi Akhir'
    desc = `Selamat! Anda telah diterima sebagai peserta Program Pendidikan Dokter Spesialis (PPDS) ${prodiName}. Silakan pantau email Anda untuk informasi daftar ulang.`
  }

  if (!revealed) {
    return (
      <div className="card border-2 border-dashed border-emerald-200 bg-emerald-50/50 flex flex-col items-center justify-center py-12 px-4 text-center cursor-pointer hover:bg-emerald-50 transition-colors" onClick={handleReveal}>
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-4"
        >
          <Mail className="w-8 h-8 text-emerald-500" />
        </motion.div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Pengumuman Tersedia!</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-md">
          Hasil seleksi tahap <strong>{status.split('_')[1]?.toUpperCase() ?? ''}</strong> Anda untuk program studi {prodiName} sudah dapat dilihat.
        </p>
        <button className="btn-primary" onClick={handleReveal}>
          Buka Pengumuman
        </button>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`card text-center py-12 relative overflow-hidden ${isLulus ? 'border-emerald-200 bg-gradient-to-b from-emerald-50 to-white' : 'border-rose-200 bg-gradient-to-b from-rose-50 to-white'}`}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
          <Confetti active={isLulus} config={config} />
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, delay: 0.2 }}
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg ${isLulus ? 'bg-emerald-500' : 'bg-rose-500'}`}
          >
            {isLulus ? <Trophy className="w-10 h-10 text-white" /> : <XCircle className="w-10 h-10 text-white" />}
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`text-2xl font-bold mb-2 ${isLulus ? 'text-emerald-800' : 'text-rose-800'}`}
          >
            {isLulus ? title.toUpperCase() : 'MOHON MAAF, ANDA BELUM LULUS'}
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-slate-600 max-w-md mt-2"
          >
            {isLulus ? (
              <p>{desc}</p>
            ) : (
              <p>
                Maaf, berdasarkan hasil seleksi tahap akhir, Anda dinyatakan belum lulus pada penerimaan 
                PPDS <span className="font-medium">{prodiName}</span> kali ini. Tetap semangat dan jangan menyerah!
              </p>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
