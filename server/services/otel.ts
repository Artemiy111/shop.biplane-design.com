import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import {
  ConsoleMetricExporter,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node'

const metricExporter = new PrometheusExporter({
  port: 8888, // Порт для метрик Prometheus
})

export const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: 'http://localhost:4317/v1/traces' }),
  // metricReader: new PeriodicExportingMetricReader({
  // exporter: metricExporter,
  // exportIntervalMillis: 1000,
  // }),
  instrumentations: [getNodeAutoInstrumentations()],
})
