import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const open = await prisma.battle.findMany({ where: { status: 'OPEN' }, include: { entries: true } })
  return NextResponse.json({ battles: open })
}
