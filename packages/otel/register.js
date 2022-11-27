// @ts-check
const opentelemetry = require('@opentelemetry/sdk-node')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http')
const { miniTracer } = require('./api')

// Instrumentation modules
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')
const { NetInstrumentation } = require('@opentelemetry/instrumentation-net')
const { PinoInstrumentation } = require('@opentelemetry/instrumentation-pino')
const { HoneycombSDK } = require('@honeycombio/opentelemetry-node')
const {
  MongoDBInstrumentation,
} = require('@opentelemetry/instrumentation-mongodb')

function getSdk() {
  if (process.env.HONEYCOMB_API_KEY) {
    console.log(
      'Note: Using Honeycomb SDK with dataset "%s" and service name "%s"',
      process.env.HONEYCOMB_DATASET,
      process.env.OTEL_SERVICE_NAME,
    )
    return new HoneycombSDK({
      instrumentations: getInstrumentations(),
      debug: true,
    })
  } else {
    console.warn('Note: Honeycomb API key not found, just sending to OTLP')
    // For troubleshooting, set the log level to DiagLogLevel.DEBUG
    opentelemetry.api.diag.setLogger(
      new opentelemetry.api.DiagConsoleLogger(),
      opentelemetry.api.DiagLogLevel.INFO,
    )
    const exporter = new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    })
    const baseSpanProcessor = new opentelemetry.tracing.BatchSpanProcessor(
      exporter,
    )
    return new opentelemetry.NodeSDK({
      spanProcessor: miniTracer.createSpanProcessor(baseSpanProcessor),
      instrumentations: getInstrumentations(),
    })
  }
}

function getInstrumentations() {
  return [
    new HttpInstrumentation(),
    new NetInstrumentation(),
    new PinoInstrumentation(),
    new MongoDBInstrumentation(),
  ]
}

const sdk = getSdk()
sdk.start()
