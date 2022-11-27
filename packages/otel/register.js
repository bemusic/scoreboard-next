// @ts-check
const opentelemetry = require('@opentelemetry/sdk-node')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http')
const { miniTracer } = require('./api')

// Instrumentation modules
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')
const { NetInstrumentation } = require('@opentelemetry/instrumentation-net')
const { PinoInstrumentation } = require('@opentelemetry/instrumentation-pino')
const {
  MongoDBInstrumentation,
} = require('@opentelemetry/instrumentation-mongodb')

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
    new HttpInstrumentation(),
    new NetInstrumentation(),
    new PinoInstrumentation(),
    new MongoDBInstrumentation(),
  ],
})

sdk.start()
