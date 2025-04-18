import { randomUUID } from 'crypto'

type SessionData = {
  userId: string
  username: string
  createdAt: number
}

export const getSessionFromRequest = (
  req: Request
): (SessionData & { sessionId: string }) | null => {
  const cookie = req.headers.get('cookie')
  const sessionId = cookie
    ?.split('; ')
    .find((c) => c.startsWith('session_id='))
    ?.split('=')[1]
  if (!sessionId) return null

  const session = getSession(sessionId)
  if (!session) return null

  return { ...session, sessionId }
}

const sessions = new Map<string, SessionData>()

export const createSession = (data: Omit<SessionData, 'createdAt'>) => {
  const sessionId = randomUUID()
  sessions.set(sessionId, {
    ...data,
    createdAt: Date.now(),
  })
  return sessionId
}

export const getSession = (sessionId: string | undefined) => {
  if (!sessionId) return null
  return sessions.get(sessionId) || null
}

export const deleteSession = (sessionId: string | undefined) => {
  if (!sessionId) return
  sessions.delete(sessionId)
}
