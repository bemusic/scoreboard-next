import pino from 'pino'
import pretty from 'pino-pretty'

// Include pino package.json in build output for OpenTelemetry SDK
// to be able to detect its version.
require.resolve('pino/package.json')

const rootLogger = pino(
  {
    serializers: {
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
      err: pino.stdSerializers.err,
    },
  },
  process.env.NODE_ENV === 'production'
    ? pino.destination(1)
    : pretty({ translateTime: 'SYS:standard' }),
)

/**
 * Create a logger
 *
 * @param name - The name of the logger
 */
export function createLogger(name: string) {
  return rootLogger.child({ name })
}
