/**
 * OpenTelemetry bootstrap for baeu-backend (Express).
 *
 * Loaded BEFORE the app via `node --import=./src/instrumentation.js src/server.js`
 * so auto-instrumentations patch `http`, `express`, `pg`, `undici` before any
 * module imports them.
 *
 * Gating: SDK only starts when OTEL_EXPORTER_OTLP_ENDPOINT is defined, so local
 * dev without OTel env vars is a no-op (zero overhead, no errors).
 *
 * Required env vars (Railway):
 *   OTEL_SERVICE_NAME=baeu-backend
 *   OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-central-0.grafana.net/otlp
 *   OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
 *   OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <BASE64>
 *
 * Token lives only in Railway secrets — never in this repo.
 */

import "dotenv/config";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import {
  LoggerProvider,
  BatchLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import { logs } from "@opentelemetry/api-logs";

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

if (endpoint && endpoint.trim().length > 0) {
  // Logs → Loki (Grafana Cloud). Set up BEFORE NodeSDK so the global logger
  // provider is in place when any winston/pino instrumentation attaches.
  // @opentelemetry/sdk-logs >=0.200 expects processors via constructor (em vez
  // do addLogRecordProcessor que existia até 0.55). npm install resolveu >=0.215
  // via peer dep chain do sdk-node/auto-instrumentations.
  const loggerProvider = new LoggerProvider({
    processors: [new BatchLogRecordProcessor(new OTLPLogExporter())],
  });
  logs.setGlobalLoggerProvider(loggerProvider);

  const sdk = new NodeSDK({
    serviceName: process.env.OTEL_SERVICE_NAME ?? "baeu-backend",
    traceExporter: new OTLPTraceExporter(),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
      exportIntervalMillis: 60_000,
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        // fs spans are extremely noisy for an API server.
        "@opentelemetry/instrumentation-fs": { enabled: false },
      }),
    ],
  });

  try {
    sdk.start();
    console.log(
      `[otel] started — service=${process.env.OTEL_SERVICE_NAME ?? "baeu-backend"} endpoint=${endpoint}`
    );
  } catch (err) {
    // Never let observability bootstrap crash the API.
    console.error("[otel] failed to start SDK:", err);
  }

  const shutdown = () => {
    sdk
      .shutdown()
      .catch((err) => console.error("[otel] shutdown error:", err));
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
} else {
  console.log("[otel] disabled (OTEL_EXPORTER_OTLP_ENDPOINT not set)");
}
