import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'dev_secret'

export async function getUserFromAuthHeader(authorization?: string) {
  if (!authorization) return null
  const m = authorization.match(/^Bearer (.+)$/)
  if (!m) return null
  try {
    const payload = jwt.verify(m[1], JWT_SECRET) as any
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    return user
  } catch (e) {
    return null
  }
}
