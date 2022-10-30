import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { z, ZodType } from 'zod'
import { Span, SpanStatusCode, trace, Tracer } from '@opentelemetry/api'
import { miniTracer } from '../tracing'
import { createLogger } from '../logger'

const tracer = trace.getTracer('next-endpoint')
const logger = createLogger('next-endpoint')

function traceAsync<R>(
  tracer: Tracer,
  name: string,
  f: (span: Span) => PromiseLike<R>,
): Promise<R> {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      const result = await f(span)
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (err) {
      span.setStatus({ code: SpanStatusCode.ERROR })
      span.recordException(err as any)
      throw err
    } finally {
      span.end()
    }
  })
}

export function createEndpoint<T extends ZodType>(
  options: EndpointOptions<T>,
): Endpoint<T> {
  return {
    handler: (f) => {
      const diag: Record<string, any> = {}
      const handler: NextApiHandler = async (req, res) => {
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
          if ((error as any).response) {
            console.log('Error response', (error as any).response.data)
          }
          logger.error({ err: error, req, res }, String(error))
          res.status(500).json({ ...diag, message: String(error) })
        }
      }
      return handler
    },
  }
}

interface EndpointOptions<T extends ZodType> {
  input?: T
}

interface Endpoint<T extends ZodType> {
  handler: (handler: EndpointHandler<z.infer<T>>) => NextApiHandler
}

type EndpointHandler<T> = (params: EndpointHandlerParams<T>) => Promise<any>

interface EndpointHandlerParams<T> {
  input: T
  req: NextApiRequest
  res: NextApiResponse
}
