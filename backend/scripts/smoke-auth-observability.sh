#!/usr/bin/env bash
set -euo pipefail

required=(BETTER_AUTH_SECRET BETTER_AUTH_URL CORS_ORIGIN OTEL_SERVICE_NAME OTEL_EXPORTER_OTLP_ENDPOINT OTEL_EXPORTER_OTLP_HEADERS)
optional=(GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET RESEND_API_KEY ADMIN_TOKEN)

missing=0
for key in "${required[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    echo "[baeu-auth-obs] missing env name at runtime: $key"
    missing=1
  fi
done

for key in "${optional[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    echo "[baeu-auth-obs] optional/provider gate open: $key not configured"
  fi
done

echo "[baeu-auth-obs] TraceQL: { resource.service.name = \"${OTEL_SERVICE_NAME:-baeu-backend}\" }"

if [[ "$missing" -ne 0 ]]; then
  echo "[baeu-auth-obs] core auth/otel contract incomplete."
  exit 2
fi

echo "[baeu-auth-obs] core contract complete; still requires OAuth/Resend/Tempo live proof."
