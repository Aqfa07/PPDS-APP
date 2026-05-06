import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    if (session.user.role === 'admin_prodi' || session.user.role === 'admin_fakultas') {
      redirect('/admin/dashboard')
    }
    redirect('/peserta/dashboard')
  }

  redirect('/login')
}
