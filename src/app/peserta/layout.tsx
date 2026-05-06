import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/db'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default async function PesertaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const profile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, full_name: true, avatar_url: true }
  })

  // Admin yang nyasar ke /peserta → redirect ke admin dashboard
  if (profile?.role === 'admin_prodi' || profile?.role === 'admin_fakultas') {
    redirect('/admin/dashboard')
  }

  return (
    <DashboardLayout 
      userRole={profile?.role ?? 'calon_peserta'} 
      userName={profile?.full_name ?? 'Peserta PPDS'}
      userAvatar={profile?.avatar_url ?? undefined}
    >
      {children}
    </DashboardLayout>
  )
}
