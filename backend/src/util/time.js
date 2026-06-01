// Local-day bucketing for streaks. The app is single-user (João, Brazil), so a
// fixed UTC offset is enough — no DST in Brazil since 2019. Override via
// APP_TZ_OFFSET_MINUTES if the user moves. Default -180 = UTC-3 (São Paulo).
export function tzOffsetMinutes() {
  const raw = Number(process.env.APP_TZ_OFFSET_MINUTES);
  return Number.isFinite(raw) ? raw : -180;
}

// 'YYYY-MM-DD' for the given instant in the configured local timezone.
export function localDayString(ts, offsetMinutes = tzOffsetMinutes()) {
  const base = ts instanceof Date ? ts.getTime() : ts;
  return new Date(base + offsetMinutes * 60_000).toISOString().slice(0, 10);
}
