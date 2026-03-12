import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '../../../../lib/prisma'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'missing' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'email_taken' }, { status: 409 })

  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, passwordHash: hash }
  })

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
}
