import pino from 'pino'
import pretty from 'pino-pretty'

const rootLogger = pino(process.env.NODE_ENV === 'production' ? pino.destination(1) : pretty({ translateTime: 'SYS:standard' }))

export function createLogger(name: string) {
  return rootLogger.child({ name })
}