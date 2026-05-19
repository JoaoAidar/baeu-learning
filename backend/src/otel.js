// Optional OpenTelemetry bootstrap. Activates only when OTEL_EXPORTER_OTLP_ENDPOINT
// is set AND the OTEL packages are present. Lazy-loaded so the runtime doesn't
// fail when deps are absent — keeps deploys cheap until Joao decides to plug
// into Grafana Cloud.
//
// Required env to enable:
//   OTEL_EXPORTER_OTLP_ENDPOINT  e.g. https://otlp-gateway-...grafana.net/otlp
//   OTEL_EXPORTER_OTLP_HEADERS   e.g. "Authorization=Basic base64(user:token)"
//   OTEL_SERVICE_NAME            defaults to "baeu-backend"
//
// To install the deps when ready:
//   npm i @opentelemetry/api @opentelemetry/sdk-node \
//         @opentelemetry/exporter-trace-otlp-http \
//         @opentelemetry/auto-instrumentations-node

export async function startOtel() {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (!endpoint) {
    console.log('[baeu][otel] disabled (OTEL_EXPORTER_OTLP_ENDPOINT not set)');
    return null;
  }
  try {
    const [{ NodeSDK }, { OTLPTraceExporter }, { getNodeAutoInstrumentations }] =
      await Promise.all([
        import('@opentelemetry/sdk-node'),
        import('@opentelemetry/exporter-trace-otlp-http'),
        import('@opentelemetry/auto-instrumentations-node'),
      ]);
    const sdk = new NodeSDK({
      serviceName: process.env.OTEL_SERVICE_NAME || 'baeu-backend',
      traceExporter: new OTLPTraceExporter({ url: endpoint }),
      instrumentations: [
        getNodeAutoInstrumentations({
          // pg + http + express are the ones we care about; drop fs noise.
          '@opentelemetry/instrumentation-fs': { enabled: false },
        }),
      ],
    });
    await sdk.start();
    console.log(`[baeu][otel] started, exporting to ${endpoint}`);
    const shutdown = async () => {
      try {
        await sdk.shutdown();
      } catch (err) {
        console.error('[baeu][otel] shutdown error', err);
      }
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    return sdk;
  } catch (err) {
    // Missing deps or boot failure — never crash the API for telemetry.
    console.warn(
      '[baeu][otel] disabled (deps missing or init failed):',
      err && err.message ? err.message : err
    );
    return null;
  }
}
