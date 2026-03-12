import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getUserFromAuthHeader } from '../../../../lib/auth'

export async function POST(req: Request) {
  const user = await getUserFromAuthHeader(req.headers.get('authorization') || undefined)
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 })

  const { battleId, amount, choice } = await req.json()
  if (!battleId || !amount || !choice) return NextResponse.json({ error: 'missing' }, { status: 400 })

  // simple numeric checks
  const amt = Number(amount)
  if (isNaN(amt) || amt <= 0) return NextResponse.json({ error: 'bad_amount' }, { status: 400 })

  // reload user to get latest balance
  const fresh = await prisma.user.findUnique({ where: { id: user.id } })
  if (!fresh) return NextResponse.json({ error: 'unauth' }, { status: 401 })
  if (Number(fresh.balance) < amt) return NextResponse.json({ error: 'insufficient' }, { status: 402 })

  const battle = await prisma.battle.findUnique({ where: { id: battleId } })
  if (!battle || battle.status !== 'OPEN') return NextResponse.json({ error: 'bad_battle' }, { status: 400 })

  await prisma.$transaction([
    prisma.battleEntry.create({ data: { battleId, userId: user.id, amount: amt.toString(), choice } }),
    prisma.user.update({ where: { id: user.id }, data: { balance: { decrement: amt } } }),
    prisma.transaction.create({ data: { userId: user.id, amount: amt.toString(), type: 'BET' } }),
    prisma.battle.update({ where: { id: battleId }, data: { pot: { increment: amt } } })
  ])

  return NextResponse.json({ ok: true })
}
