// Require dependencies
const opentelemetry = require('@opentelemetry/sdk-node')
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node')
const { PrismaInstrumentation } = require('@prisma/instrumentation')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http')
const { miniTracer } = require('./src/packlets/tracing')

// miniTracer.spanListeners.add({
//   onStart: (span) => {
//     console.log(
//       '>> onStart "%s" (parent=%s, id=%s, trace=%s)',
//       span.name,
//       span.parentSpanId,
//       span.spanContext().spanId,
//       span.spanContext().traceId,
//     )
//   },
//   onEnd: (span) => {},
// })

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
opentelemetry.api.diag.setLogger(
  new opentelemetry.api.DiagConsoleLogger(),
  opentelemetry.api.DiagLogLevel.INFO,
)

const exporter = new OTLPTraceExporter({ url: 'http://db:4318/v1/traces' })
const baseSpanProcessor = new opentelemetry.tracing.BatchSpanProcessor(exporter)

const sdk = new opentelemetry.NodeSDK({
  spanProcessor: miniTracer.createSpanProcessor(baseSpanProcessor),
  instrumentations: [
    getNodeAutoInstrumentations(),
    new PrismaInstrumentation(),
  ],
})

sdk.start()
