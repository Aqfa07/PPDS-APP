'use server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export async function checkProfileComplete() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return false

  try {
    const profile = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { full_name: true, avatar_url: true }
    })

    if (!profile || !profile.full_name || !profile.avatar_url) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}
