import fs from 'fs'
import path from 'path'

const logDir = path.resolve(process.cwd(), 'logs')
const serverLogFile = path.join(logDir, 'server.log')
const dbLogFile = path.join(logDir, 'db.log')

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

const formatLog = (level: string, message: string) => {
  const now = new Date().toISOString()
  return `[${now}] [${level.toUpperCase()}]: ${message}`
}

const writeToFile = (file: string, message: string) => {
  fs.appendFileSync(file, message + '\n', { encoding: 'utf8' })
}

export const Logger = {
  info: (msg: string) => {
    const formatted = formatLog('info', msg)
    console.log(formatted)
    writeToFile(serverLogFile, formatted)
  },
  warn: (msg: string) => {
    const formatted = formatLog('warn', msg)
    console.warn(formatted)
    writeToFile(serverLogFile, formatted)
  },
  error: (msg: string) => {
    const formatted = formatLog('error', msg)
    console.error(formatted)
    writeToFile(serverLogFile, formatted)
  },
  custom: (level: string, msg: string) => {
    const formatted = formatLog(level, msg)
    console.log(formatted)
    writeToFile(serverLogFile, formatted)
  },

  db: (msg: string) => {
    const formatted = formatLog('db', msg)
    console.log(formatted)
    writeToFile(dbLogFile, formatted)
  },

  dbConnect: (msg: string) => {
    const formatted = formatLog('db:connect', msg)
    console.log(formatted)
    writeToFile(dbLogFile, formatted)
  },

  dbWrite: (msg: string) => {
    const formatted = formatLog('db:write', msg)
    console.log(formatted)
    writeToFile(dbLogFile, formatted)
  },

  dbRead: (msg: string) => {
    const formatted = formatLog('db:read', msg)
    console.log(formatted)
    writeToFile(dbLogFile, formatted)
  }
}
