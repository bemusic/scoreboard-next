const { MiniTracer } = require('minitracer')

/** @type {MiniTracer} */
const miniTracer =
  global.__miniTracer || (global.__miniTracer = new MiniTracer())

exports.miniTracer = miniTracer
