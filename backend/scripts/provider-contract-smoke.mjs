#!/usr/bin/env node
// Dry-run provider contract check. Reads process.env only; does not load .env,
// print values, call providers, send email, generate content, or touch Neon.

const checks = [
  {
    name: "neon-postgres",
    required: ["DATABASE_URL"],
    optional: ["PERF_SLOW_QUERY_MS"],
    note: "Presence does not prove schema, SRS writes, query latency, or production smoke persistence.",
  },
  {
    name: "better-auth",
    required: ["BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "CORS_ORIGIN"],
    optional: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    note: "Google keys are optional while the frontend flag is off; presence does not prove OAuth consent/callback.",
  },
  {
    name: "admin-llm-openrouter",
    required: ["LLM_API_KEY", "LLM_BASE_URL", "LLM_MODEL"],
    optional: ["ADMIN_TOKEN"],
    note: "Presence does not prove OpenRouter cap, billing-grade daily limit, or successful admin generation.",
  },
  {
    name: "resend-email",
    required: [],
    optional: ["RESEND_API_KEY", "EMAIL_FROM"],
    note: "Optional for learner core; presence does not prove sender domain, inbox delivery, or reset-link receipt.",
  },
];

function present(name) {
  return Boolean((process.env[name] || "").trim());
}

let failures = 0;
console.log("Baeu provider contract smoke (dry-run, names only)");
console.log("WARNING: PASS means env contract presence only; it is not runtime/provider proof.\n");

for (const check of checks) {
  const missing = check.required.filter((name) => !present(name));
  const optionalPresent = check.optional.filter((name) => present(name));
  if (missing.length) failures += 1;
  console.log(`[${missing.length ? "FAIL" : "PASS"}] ${check.name}`);
  if (check.required.length) console.log(`  required: ${check.required.join(", ")}`);
  if (missing.length) console.log(`  missing: ${missing.join(", ")}`);
  if (check.optional.length) console.log(`  optional_present: ${optionalPresent.join(", ") || "none"}`);
  console.log(`  caveat: ${check.note}\n`);
}

process.exit(failures ? 1 : 0);
