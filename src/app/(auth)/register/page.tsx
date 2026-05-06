'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, Stethoscope, CheckCircle2 } from 'lucide-react'
import { registerUser } from '@/lib/actions/auth'
import { RegisterSchema, type RegisterInput } from '@/lib/validations/schemas'

export default function RegisterPage() {
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true)
    const formData = new FormData()
    Object.entries(data).forEach(([k, v]) => formData.append(k, v))
    const result = await registerUser(formData)
    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="card max-w-md w-full text-center animate-in">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Registrasi Berhasil!</h2>
          <p className="text-slate-500 text-sm mb-6">
            Kami mengirim email konfirmasi ke alamat Anda. Silakan cek inbox dan klik link verifikasi.
          </p>
          <Link href="/login" className="btn-primary inline-flex">Kembali ke Halaman Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="card max-w-md w-full animate-in">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-800">PPDS FK UNAND</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-1">Buat Akun Baru</h1>
        <p className="text-slate-500 text-sm mb-6">Daftarkan diri untuk mengakses portal pendaftaran PPDS.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label" htmlFor="reg-name">Nama Lengkap</label>
            <input id="reg-name" type="text" className={`input-field ${errors.full_name ? 'error' : ''}`}
              placeholder="dr. Nama Anda" {...register('full_name')} />
            {errors.full_name && <p className="error-msg">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="reg-email">Alamat Email</label>
            <input id="reg-email" type="email" className={`input-field ${errors.email ? 'error' : ''}`}
              placeholder="dokter@email.com" {...register('email')} />
            {errors.email && <p className="error-msg">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="reg-password">Password</label>
            <div className="relative">
              <input id="reg-password" type={showPwd ? 'text' : 'password'}
                className={`input-field pr-11 ${errors.password ? 'error' : ''}`}
                placeholder="Min. 8 karakter" {...register('password')} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="error-msg">{errors.password.message}</p>}
          </div>

          <button id="btn-register" type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Mendaftar...</> : 'Buat Akun'}
          </button>
        </form>

        <div className="divider" />
        <p className="text-center text-sm text-slate-500">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-emerald-600 font-semibold hover:underline">Masuk di sini</Link>
        </p>
      </div>
    </div>
  )
}
