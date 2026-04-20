export async function POST(request: Request) {
  try {
    const { password } = await request.json() as { password: string }
    const valid = password === process.env.ADMIN_PASSWORD
    return Response.json({ valid })
  } catch {
    return Response.json({ valid: false }, { status: 500 })
  }
}
