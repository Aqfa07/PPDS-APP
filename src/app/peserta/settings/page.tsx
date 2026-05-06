import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { SettingsForm } from '@/components/registration/SettingsForm'
import { PasswordForm } from '@/components/registration/PasswordForm'

export const metadata = { title: 'Pengaturan Profil' }

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const profile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { full_name: true, avatar_url: true, email: true }
  })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan Profil</h1>
        <p className="text-slate-500 text-sm mt-1">
          Lengkapi data diri dasar Anda. Foto profil dan Nama Lengkap sangat disarankan untuk diisi.
        </p>
      </div>

      <div className="card p-6 md:p-8">
        <SettingsForm initialData={profile} />
      </div>

      <div className="card p-6 md:p-8">
        <PasswordForm />
      </div>
    </div>
  )
}
