import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Non connecté' }, { status: 401 })
    }

    return Response.json({
      email: user.email,
      needsPassword: user.needsPassword,
      faireparts: user.faireparts,
      createdAt: user.createdAt,
    })
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
