import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getUserFromAuthHeader } from '../../../../lib/auth'

export async function POST(req: Request) {
  const user = await getUserFromAuthHeader(req.headers.get('authorization') || undefined)
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 })

  const { title } = await req.json()
  if (!title) return NextResponse.json({ error: 'missing_title' }, { status: 400 })

  const battle = await prisma.battle.create({ data: { title } })
  return NextResponse.json({ battle })
}
