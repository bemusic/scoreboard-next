import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { z, ZodType } from 'zod'
import { miniTracer, otel } from '@bemuse/otel'
import { createLogger } from '../logger'
import createHttpError from 'http-errors'
import Cors from 'cors'
import { initMiddleware } from 'init-middleware'

const tracer = otel.trace.getTracer('next-endpoint')
const logger = createLogger('next-endpoint')
const cors = initMiddleware(Cors())

// Include the registration script in the build output to allow invoking
// node with `-r @bemuse/otel/register` to register the OpenTelemetry SDK.
require.resolve('@bemuse/otel/register')

/**
 * Trace an async function
 */
function traceAsync<R>(
  tracer: otel.Tracer,
  name: string,
  f: (span: otel.Span) => PromiseLike<R>,
): Promise<R> {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      const result = await f(span)
      span.setStatus({ code: otel.SpanStatusCode.OK })
      return result
    } catch (err) {
      span.setStatus({ code: otel.SpanStatusCode.ERROR })
      span.recordException(err as any)
      throw err
    } finally {
      span.end()
    }
  })
}

/**
 * Create an endpoint
 *
 * @param options The options
 */
export function createEndpoint<T extends ZodType>(
  options: EndpointOptions<T>,
): Endpoint<T> {
  return {
    handler: (f) => {
      const diag: Record<string, any> = {}
      const handler: NextApiHandler = async (req, res) => {
        await cors(req, res)
        try {
          const result = await traceAsync(
            tracer,
            'Execute endpoint',
            async (span) => {
              const listener = miniTracer.createSpanListener(span)
              try {
                return await f({
                  input: options.input?.parse(req.body),
                  req,
                  res,
                })
              } catch (error) {
                if (error instanceof z.ZodError) {
                  throw new createHttpError.BadRequest(error.message)
                }
                throw error
              } finally {
                if (req.query.trace === '1') {
                  diag._trace = listener.toJSON()
                }
                setTimeout(() => {
                  console.log(
                    listener.toString({
                      title: req.method + ' ' + req.url,
                    }),
                  )
                  listener.dispose()
                }, 100)
              }
            },
          )
          if (result) {
            res.json({ ...result, ...diag, ...result })
          }
        } catch (error) {
          const statusCode = createHttpError.isHttpError(error)
            ? error.statusCode
            : 500
          if (statusCode >= 500) {
            logger.error({ err: error, req, res }, String(error))
          } else {
            logger.warn({ err: error, req, res }, String(error))
          }
          res.status(statusCode).json({
            ...diag,
            message:
              statusCode === 500 ? 'Internal server error' : String(error),
          })
        }
      }
      return handler
    },
  }
}

/**
 * Endpoint options
 */
interface EndpointOptions<T extends ZodType> {
  /**
   * The input schema
   */
  input?: T
}

/**
 * Endpoint
 */
interface Endpoint<T extends ZodType> {
  /**
   * Create a handler
   */
  handler: (handler: EndpointHandler<z.infer<T>>) => NextApiHandler
}

/**
 * Endpoint handler
 */
type EndpointHandler<T> = (params: EndpointHandlerParams<T>) => Promise<any>

/**
 * Endpoint handler params
 */
interface EndpointHandlerParams<T> {
  input: T
  req: NextApiRequest
  res: NextApiResponse
}
