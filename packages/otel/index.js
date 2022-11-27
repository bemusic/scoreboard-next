require('./tracing')

const { miniTracer } = require('./api')
exports.miniTracer = miniTracer
exports.otel = require('@opentelemetry/api')
