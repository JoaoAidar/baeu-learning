// Lightweight Korean text-to-speech via the Web Speech API. Zero dependencies,
// zero cost — the browser does the synthesis. No-ops gracefully where the API
// is unavailable (older browsers, some mobile webviews) so callers can render
// the speaker button unconditionally and let it degrade.

const HANGUL_RE = /[가-힯ᄀ-ᇿ㄰-㆏]/;

export function hasHangul(text) {
  return HANGUL_RE.test(String(text ?? ''));
}

export function speechSupported() {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance === 'function'
  );
}

// Speak the given text in Korean. Cancels any in-flight utterance first so
// rapid taps don't queue up. Safe to call when unsupported (returns false).
export function speak(text, { lang = 'ko-KR', rate = 0.9 } = {}) {
  if (!speechSupported()) return false;
  const value = String(text ?? '').trim();
  if (!value) return false;
  try {
    window.speechSynthesis.cancel();
    const u = new window.SpeechSynthesisUtterance(value);
    u.lang = lang;
    u.rate = rate;
    // Prefer a Korean voice when the platform exposes one.
    const koVoice = window.speechSynthesis
      .getVoices()
      .find((v) => v.lang && v.lang.toLowerCase().startsWith('ko'));
    if (koVoice) u.voice = koVoice;
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}
