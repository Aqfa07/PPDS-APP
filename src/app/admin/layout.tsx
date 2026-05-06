import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/db'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default async function AdminLayout({
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

  if (!profile || !['admin_prodi', 'admin_fakultas'].includes(profile.role)) {
    redirect('/peserta/dashboard')
  }

  return (
    <DashboardLayout 
      userRole={profile.role} 
      userName={profile.full_name ?? 'Admin PPDS'}
      userAvatar={profile.avatar_url ?? undefined}
    >
      {children}
    </DashboardLayout>
  )
}
