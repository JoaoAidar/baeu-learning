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
import { Resource } from "@opentelemetry/resources";

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

if (endpoint && endpoint.trim().length > 0) {
  const serviceName = process.env.OTEL_SERVICE_NAME ?? "baeu-backend";

  // Logs → Loki (Grafana Cloud).
  // NOTE: the installed @opentelemetry/sdk-logs is 0.55.x, whose LoggerProvider
  // takes the resource in the constructor and attaches processors via
  // addLogRecordProcessor(). The previous code passed `{ processors: [...] }`
  // (a >=0.200 API) which 0.55 silently ignored → the exporter was never
  // attached and NO logs reached Loki, and without a resource they'd land as
  // `unknown_service`. Fix both here.
  const loggerProvider = new LoggerProvider({
    resource: new Resource({ "service.name": serviceName }),
  });
  loggerProvider.addLogRecordProcessor(
    new BatchLogRecordProcessor(new OTLPLogExporter())
  );
  logs.setGlobalLoggerProvider(loggerProvider);

  // Bridge console.* → OTEL logs. Nothing emits log records on its own (no
  // winston/pino here, and auto-instrumentation doesn't capture console), so
  // the app's `[baeu]` lines would never reach Loki. Keep stdout behavior and
  // additionally emit a structured log record. Guarded so logging can't crash
  // the API or recurse.
  const otelLogger = logs.getLogger(serviceName);
  const SEVERITY = {
    debug: [5, "DEBUG"],
    log: [9, "INFO"],
    info: [9, "INFO"],
    warn: [13, "WARN"],
    error: [17, "ERROR"],
  };
  const stringifyArg = (a) => {
    if (typeof a === "string") return a;
    if (a instanceof Error) return a.stack || a.message;
    try {
      return JSON.stringify(a);
    } catch {
      return String(a);
    }
  };
  for (const method of Object.keys(SEVERITY)) {
    const original = console[method].bind(console);
    const [severityNumber, severityText] = SEVERITY[method];
    console[method] = (...args) => {
      original(...args);
      try {
        otelLogger.emit({
          severityNumber,
          severityText,
          body: args.map(stringifyArg).join(" "),
          attributes: {
            service: serviceName,
            service_name: serviceName,
          },
        });
      } catch {
        /* never let logging break the app */
      }
    };
  }

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
    // Flush both pipelines on SIGTERM (Railway sleep/redeploy) so batched
    // traces/logs aren't dropped when the container pauses.
    Promise.allSettled([sdk.shutdown(), loggerProvider.shutdown()]).then(
      (results) => {
        for (const r of results) {
          if (r.status === "rejected") console.error("[otel] shutdown error:", r.reason);
        }
      }
    );
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
} else {
  console.log("[otel] disabled (OTEL_EXPORTER_OTLP_ENDPOINT not set)");
}
