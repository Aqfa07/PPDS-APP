'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, Stethoscope } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LoginSchema, type LoginInput } from '@/lib/validations/schemas'

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
    })

    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
    } else {
      router.push('/peserta/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ─ Left Panel ─ */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-brand flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white rounded-full" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[30rem] h-[30rem] bg-white rounded-full" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">PPDS FK UNAND</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Portal Pendaftaran<br />Program Spesialis
          </h1>
          <p className="text-emerald-100 text-lg leading-relaxed">
            Fakultas Kedokteran Universitas Andalas.<br />
            Wujudkan karier spesialis Anda bersama kami.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { label: 'Program Studi', value: '12+' },
              { label: 'Tahun Berdiri', value: '1955' },
              { label: 'Alumni Aktif', value: '5K+' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-emerald-100 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-emerald-200 text-sm">
          © {new Date().getFullYear()} FK Universitas Andalas. All rights reserved.
        </p>
      </div>

      {/* ─ Right Panel ─ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800">PPDS FK UNAND</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Selamat datang</h2>
            <p className="text-slate-500 mt-1">Masuk ke akun pendaftaran Anda</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label" htmlFor="email">Alamat Email</label>
              <input
                id="email"
                type="email"
                className={`input-field ${errors.email ? 'error' : ''}`}
                placeholder="dokter@email.com"
                {...register('email')}
              />
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="label mb-0" htmlFor="password">Password</label>
                <Link href="/forgot-password" className="text-xs text-emerald-600 hover:underline font-medium">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className={`input-field pr-11 ${errors.password ? 'error' : ''}`}
                  placeholder="Minimal 8 karakter"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="error-msg">{errors.password.message}</p>}
            </div>

            <button id="btn-login" type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
              ) : 'Masuk ke Dashboard'}
            </button>
          </form>

          <div className="divider" />

          <p className="text-center text-sm text-slate-500">
            Belum punya akun?{' '}
            <Link href="/register" className="text-emerald-600 font-semibold hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
