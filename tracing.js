// Require dependencies
const opentelemetry = require('@opentelemetry/sdk-node')
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http')
const { miniTracer } = require('./src/packlets/tracing')

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
opentelemetry.api.diag.setLogger(
  new opentelemetry.api.DiagConsoleLogger(),
  opentelemetry.api.DiagLogLevel.INFO,
)

const exporter = new OTLPTraceExporter({ url: 'http://db:4318/v1/traces' })
const baseSpanProcessor = new opentelemetry.tracing.BatchSpanProcessor(exporter)

const sdk = new opentelemetry.NodeSDK({
  spanProcessor: miniTracer.createSpanProcessor(baseSpanProcessor),
  instrumentations: [getNodeAutoInstrumentations()],
})

sdk.start()
