/**
 * Reads merged Jest + Playwright JSON output and writes qa/report.html (+ PRESENTATION.md summary).
 */
import fs from "fs";
import path from "path";

const ROOT = path.join(__dirname, "..");

type Status = "PASS" | "FAIL" | "MANUAL";

interface StoryRow {
  id: string;
  criterion: string;
  status: Status;
  detail: string;
}

interface Feature {
  title: string;
  stories: StoryRow[];
}

const FEATURES: Feature[] = [
  {
    title: "Authentication",
    stories: [
      { id: "US-AUTH-001", criterion: "Register with valid email/password", status: "MANUAL", detail: "" },
      { id: "US-AUTH-002", criterion: "Login with valid credentials; protected routes", status: "MANUAL", detail: "" },
      { id: "US-AUTH-003", criterion: "Invalid login shows error", status: "MANUAL", detail: "" },
      { id: "US-AUTH-004", criterion: "Session persists after reload", status: "MANUAL", detail: "" },
      { id: "US-AUTH-005", criterion: "Logout redirects to /login", status: "MANUAL", detail: "" },
    ],
  },
  {
    title: "Dashboard",
    stories: [
      { id: "US-DASH-001", criterion: "Client list loads; count matches list", status: "MANUAL", detail: "" },
      { id: "US-DASH-002", criterion: "Search by name filters clients", status: "MANUAL", detail: "" },
      { id: "US-DASH-003", criterion: "Search by phone filters clients", status: "MANUAL", detail: "" },
      { id: "US-DASH-004", criterion: "VIP/Regular/New chips filter", status: "MANUAL", detail: "" },
      { id: "US-DASH-005", criterion: "Sort options change ordering", status: "MANUAL", detail: "" },
      { id: "US-DASH-006", criterion: "FAB opens add client form", status: "MANUAL", detail: "" },
    ],
  },
  {
    title: "Client CRUD",
    stories: [
      { id: "US-CLIENT-001", criterion: "Add client with all fields succeeds", status: "MANUAL", detail: "" },
      { id: "US-CLIENT-002", criterion: "Add client validates required fields", status: "MANUAL", detail: "" },
      { id: "US-CLIENT-003", criterion: "Detail shows insights, notes, history", status: "MANUAL", detail: "" },
      { id: "US-CLIENT-004", criterion: "tel: and mailto: links present", status: "MANUAL", detail: "" },
      { id: "US-CLIENT-005", criterion: "Edit updates information", status: "MANUAL", detail: "" },
      { id: "US-CLIENT-006", criterion: "Delete via gear → danger zone → modal", status: "MANUAL", detail: "" },
      { id: "US-CLIENT-007", criterion: "Notes save", status: "MANUAL", detail: "" },
    ],
  },
  {
    title: "Rides",
    stories: [
      { id: "US-RIDE-001", criterion: "Log ride validates required fields", status: "MANUAL", detail: "" },
      { id: "US-RIDE-002", criterion: "Log ride saves; appears in history", status: "MANUAL", detail: "" },
      { id: "US-RIDE-003", criterion: "Book Again prefills pickup/dropoff", status: "MANUAL", detail: "" },
      { id: "US-RIDE-004", criterion: "Fare prefilled from default rate", status: "MANUAL", detail: "" },
      { id: "US-RIDE-005", criterion: "Payment toast sequence", status: "MANUAL", detail: "" },
    ],
  },
  {
    title: "Earnings",
    stories: [
      { id: "US-EARN-001", criterion: "Period tabs switch summary", status: "MANUAL", detail: "" },
      { id: "US-EARN-002", criterion: "Summary cards show totals", status: "MANUAL", detail: "" },
      { id: "US-EARN-003", criterion: "Top client displays", status: "MANUAL", detail: "" },
      { id: "US-EARN-004", criterion: "Recent rides list", status: "MANUAL", detail: "" },
    ],
  },
  {
    title: "Profile & Navigation",
    stories: [
      { id: "US-PROF-001", criterion: "User info displays", status: "MANUAL", detail: "" },
      { id: "US-PROF-002", criterion: "Sign out redirects to login", status: "MANUAL", detail: "" },
      { id: "US-NAV-001", criterion: "Bottom nav reaches Clients/Earnings/Profile", status: "MANUAL", detail: "" },
      { id: "US-NAV-002", criterion: "Active tab visually highlighted / aria-current", status: "MANUAL", detail: "" },
      { id: "US-NAV-003", criterion: "Help modal can be opened and dismissed", status: "MANUAL", detail: "" },
    ],
  },
  {
    title: "Accessibility",
    stories: [
      { id: "US-A11Y-001", criterion: "Touch targets ≥ 44px (spot-check)", status: "MANUAL", detail: "" },
      { id: "US-A11Y-002", criterion: "Visible focus rings (keyboard)", status: "MANUAL", detail: "" },
      { id: "US-A11Y-003", criterion: "Responsive layout from 320px width", status: "MANUAL", detail: "" },
    ],
  },
];

const MANUAL_ONLY = new Set<string>([
  "US-NAV-002",
  "US-A11Y-001",
  "US-A11Y-002",
  "US-A11Y-003",
]);

const STORY_REGEX = /\[(US-[A-Z0-9-]+)\]/i;

function readJSON<T>(p: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as T;
  } catch {
    return fallback;
  }
}

type JestJSON = {
  numPassedTests?: number;
  numFailedTests?: number;
  numTotalTests?: number;
  testResults?: Array<{
    assertionResults?: Array<{ fullName: string; status: string; failureMessages?: string[] }>;
  }>;
};

interface PWSpec {
  title: string;
  ok?: boolean;
  tests?: PWTest[];
}

interface PWTest {
  title: string;
  outcome?: string;
  status?: string;
  results?: Array<{ attachments?: Array<{ name?: string; path?: string }> }>;
}

interface PWSuite {
  title: string;
  suites?: PWSuite[];
  specs?: PWSpec[];
}

interface PlaywrightJSON {
  suites?: PWSuite[];
  stats?: { duration?: number };
}

function collectJestResults(unit: JestJSON) {
  const map = new Map<string, { pass: boolean; detail: string }>();
  for (const file of unit.testResults ?? []) {
    for (const ar of file.assertionResults ?? []) {
      const m = ar.fullName.match(STORY_REGEX);
      if (!m) continue;
      const id = m[1].toUpperCase();
      const prev = map.get(id);
      const passed = ar.status === "passed";
      if (!prev) {
        map.set(id, {
          pass: passed,
          detail: ar.failureMessages?.join("\n") || (passed ? "Jest passed" : ""),
        });
      } else {
        map.set(id, {
          pass: prev.pass && passed,
          detail: passed ? prev.detail : prev.detail || ar.failureMessages?.join("\n") || "",
        });
      }
    }
  }
  return map;
}

function walkPlaywrightSuites(
  suite: PWSuite | undefined,
  map: Map<string, { pass: boolean; detail: string }>
) {
  if (!suite) return;
  for (const spec of suite.specs ?? []) {
    const title = spec.title || "";
    const m = title.match(STORY_REGEX);
    if (!m) {
      continue;
    }
    const id = m[1].toUpperCase();
    const first = spec.tests?.[0] as
      | (PWTest & { status?: string })
      | undefined;
    const outcome = first?.outcome;
    const passed =
      spec.ok === true ||
      outcome === "expected" ||
      first?.status === "passed";
    const attach =
      first?.results?.flatMap((r) => r.attachments ?? []) ?? [];
    const screenshot = attach.find((a) =>
      (a.name || "").toLowerCase().includes("screenshot")
    );
    const detail = passed
      ? "Playwright passed"
      : screenshot
        ? path.relative(path.join(ROOT, "qa"), screenshot.path || "")
        : `Outcome: ${outcome || first?.status || "unknown"}`;

    const prev = map.get(id);
    if (!prev) {
      map.set(id, { pass: passed, detail });
    } else {
      map.set(id, {
        pass: prev.pass && passed,
        detail: passed ? prev.detail : detail || prev.detail,
      });
    }
  }
  for (const child of suite.suites ?? []) walkPlaywrightSuites(child, map);
}

function collectPlaywrightResults(e2e: PlaywrightJSON) {
  const map = new Map<string, { pass: boolean; detail: string }>();
  for (const root of e2e.suites ?? []) walkPlaywrightSuites(root, map);
  return map;
}

function mergeMaps(
  jestMap: Map<string, { pass: boolean; detail: string }>,
  pwMap: Map<string, { pass: boolean; detail: string }>
) {
  const merged = new Map(jestMap);
  for (const [k, v] of Array.from(pwMap.entries())) {
    const prev = merged.get(k);
    if (!prev) merged.set(k, v);
    else {
      merged.set(k, {
        pass: prev.pass && v.pass,
        detail:
          prev.pass && v.pass
            ? `${prev.detail}; ${v.detail}`
            : !v.pass
              ? v.detail
              : prev.detail,
      });
    }
  }
  return merged;
}

function buildFeaturesFromResults(
  merged: Map<string, { pass: boolean; detail: string }>
): Feature[] {
  return FEATURES.map((f) => ({
    title: f.title,
    stories: f.stories.map((row) => {
      if (MANUAL_ONLY.has(row.id)) {
        return {
          ...row,
          status: "MANUAL" as Status,
          detail: "Manual check (see USER_STORIES.md)",
        };
      }
      const auto = merged.get(row.id);
      if (!auto) {
        return {
          ...row,
          status: "MANUAL" as Status,
          detail: "Not covered by automated run",
        };
      }
      return {
        ...row,
        status: (auto.pass ? "PASS" : "FAIL") as Status,
        detail: auto.detail || (auto.pass ? "OK" : "Failed"),
      };
    }),
  }));
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderReport(opts: {
  features: Feature[];
  generated: string;
  unit: JestJSON;
  pw: PlaywrightJSON;
}) {
  const { features, generated, unit, pw } = opts;

  const jestPassed = unit.numPassedTests ?? 0;
  const jestFailed = unit.numFailedTests ?? 0;
  const jestTotal = unit.numTotalTests ?? 0;

  const { pwPassed, pwFailed, pwTotal } = countPlaywrightTests(pw);

  const totalAuto = jestTotal + pwTotal;
  const passedAuto = jestPassed + pwPassed;
  const failedAuto = jestFailed + pwFailed;
  const manualStories = features
    .flatMap((f) => f.stories)
    .filter((s) => s.status === "MANUAL").length;
  const passRate =
    totalAuto > 0 ? Math.round((passedAuto / totalAuto) * 1000) / 10 : 0;

  let body = "";
  for (const group of features) {
    const rows = group.stories;
    const pass = rows.filter((r) => r.status === "PASS").length;
    const fail = rows.filter((r) => r.status === "FAIL").length;
    const man = rows.filter((r) => r.status === "MANUAL").length;

    body += `<section class="feature-group">
  <h2>${escapeHtml(group.title)} <span class="stats">${pass} pass / ${fail} fail / ${man} manual</span></h2>
  <table>
    <thead>
      <tr><th>Story ID</th><th>Acceptance Criterion</th><th>Status</th><th>Detail</th></tr>
    </thead>
    <tbody>`;

    for (const r of rows) {
      const badge =
        r.status === "PASS"
          ? "badge pass"
          : r.status === "FAIL"
            ? "badge fail"
            : "badge manual";
      body += `<tr>
        <td><code>${escapeHtml(r.id)}</code></td>
        <td>${escapeHtml(r.criterion)}</td>
        <td><span class="${badge}">${r.status}</span></td>
        <td class="detail">${escapeHtml(r.detail || "—")}</td>
      </tr>`;
    }
    body += `</tbody></table></section>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>HUM Client Book - QA Report</title>
  <style>
    :root {
      --bg: #0b1220;
      --muted: #94a3b8;
      --text: #e5e7eb;
      --pass: #22c55e;
      --fail: #ef4444;
      --manual: #f59e0b;
      --border: #1f2937;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
      background: radial-gradient(1200px 600px at 10% -10%, #0b2a3a 0%, var(--bg) 55%);
      color: var(--text);
      line-height: 1.5;
    }
    header {
      padding: 2.5rem 1.5rem 1.5rem;
      max-width: 1100px;
      margin: 0 auto;
      border-bottom: 1px solid var(--border);
    }
    header h1 { margin: 0 0 0.5rem; font-size: 2rem; letter-spacing: -0.02em; }
    header p { margin: 0.25rem 0; color: var(--muted); }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      max-width: 1100px;
      margin: 0 auto;
      padding: 1.5rem;
    }
    .stat {
      background: linear-gradient(180deg, rgba(56,189,248,.08), rgba(17,24,39,.75));
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1rem 1.1rem;
      box-shadow: 0 10px 30px rgba(0,0,0,.25);
    }
    .stat .label { display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
    .stat .value { display: block; margin-top: .4rem; font-size: 1.6rem; font-weight: 800; letter-spacing: -0.03em; }
    .stat .value.pass { color: var(--pass); }
    .stat .value.fail { color: var(--fail); }
    .stat .value.manual { color: var(--manual); }
    .feature-group { max-width: 1100px; margin: 0 auto 2.5rem; padding: 0 1.5rem; }
    .feature-group h2 { margin: 0 0 1rem; font-size: 1.25rem; letter-spacing: -0.01em; }
    .feature-group .stats { font-size: 0.85rem; color: var(--muted); font-weight: 600; margin-left: 0.5rem; }
    table { width: 100%; border-collapse: collapse; background: rgba(17,24,39,.65); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
    thead th { text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); padding: 0.75rem 0.85rem; background: rgba(15,23,42,.75); border-bottom: 1px solid var(--border); }
    tbody td { padding: 0.7rem 0.85rem; border-top: 1px solid rgba(255,255,255,.04); vertical-align: top; }
    tbody tr:hover td { background: rgba(56,189,248,.04); }
    code { background: rgba(255,255,255,.06); padding: 2px 6px; border-radius: 6px; }
    .badge { display: inline-block; font-weight: 800; font-size: 0.72rem; letter-spacing: 0.06em; padding: 0.25rem 0.55rem; border-radius: 999px; border: 1px solid rgba(255,255,255,.08); }
    .badge.pass { color: #052e16; background: #bbf7d0; border-color: #86efac; }
    .badge.fail { color: #450a0a; background: #fecaca; border-color: #fca5a5; }
    .badge.manual { color: #451a03; background: #fde68a; border-color: #fcd34d; }
    td.detail { color: #cbd5e1; font-size: 0.9rem; word-break: break-word; }
    footer { max-width: 1100px; margin: 2rem auto; padding: 0 1.5rem 3rem; color: var(--muted); font-size: 0.9rem; }
  </style>
</head>
<body>
  <header>
    <h1>HUM Client Book - QA Report</h1>
    <p>Driver-facing CRM for professional rideshare drivers</p>
    <p>Stack: Next.js 14, MongoDB, NextAuth.js</p>
    <p>Generated: ${escapeHtml(generated)}</p>
  </header>

  <section class="summary">
    <div class="stat"><span class="label">Total Auto Tests (Jest + Playwright)</span><span class="value">${totalAuto}</span></div>
    <div class="stat"><span class="label">Passed</span><span class="value pass">${passedAuto}</span></div>
    <div class="stat"><span class="label">Failed</span><span class="value fail">${failedAuto}</span></div>
    <div class="stat"><span class="label">Manual Rows</span><span class="value manual">${manualStories}</span></div>
    <div class="stat"><span class="label">Auto Pass Rate</span><span class="value">${passRate}%</span></div>
  </section>

  ${body}

  <footer>
    Artifacts: Jest JSON (qa/unit-results.json), Playwright JSON (qa/e2e-results.json), screenshots/videos under qa/test-results on failures.
  </footer>
</body>
</html>`;
}

function writePresentation(opts: {
  totalAuto: number;
  passedAuto: number;
  failedAuto: number;
  manualStories: number;
  passRate: number;
  features: Feature[];
}) {
  const { totalAuto, passedAuto, failedAuto, manualStories, passRate, features } = opts;

  function bucket(title: string) {
    const rows = features.find((f) => f.title === title)?.stories ?? [];
    const total = rows.length;
    const pass = rows.filter((r) => r.status === "PASS").length;
    const fail = rows.filter((r) => r.status === "FAIL").length;
    const man = rows.filter((r) => r.status === "MANUAL").length;
    return { total, pass, fail, manual: man };
  }

  const auth = bucket("Authentication");
  const dash = bucket("Dashboard");
  const client = bucket("Client CRUD");
  const ride = bucket("Rides");
  const earn = bucket("Earnings");
  const prof = bucket("Profile & Navigation");

  const md = `# HUM Client Book - QA Report Presentation

## Overview

**HUM Client Book** is a mobile-first, driver-facing CRM for professional rideshare drivers going independent.

**Problem:** Drivers on Uber/Lyft have zero access to client data. They can't build repeat business or operate independently.

**Solution:** Own your client relationships. Track rides. See insights. Build your business.

## Technical Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes, NextAuth.js (JWT)
- **Database:** MongoDB Atlas with Mongoose
- **Deployment:** Linode VPS with PM2 + NGINX
- **Testing:** Jest (unit) + Playwright (E2E)

## Features Delivered

### Core Features (7)

1. Authentication (email/password, JWT sessions)
2. Add Client (fast mobile flow)
3. Client List (search, filter by group/tags, sort)
4. Client Detail (contact links, insights, notes, preferences)
5. Ride Logging (validation, date picker, fare input)
6. Quick Rebook ("Book Again" pre-fills locations)
7. Earnings Dashboard (period filters, summary cards, top client)

### Mobile-First Design

- Touch targets 44px+ (iOS HIG)
- Fixed bottom actions for primary flows
- Safe-area aware layout
- Inputs sized to reduce iOS zoom
- Responsive from narrow phones to tablets

### Security

- bcrypt password hashing (10 rounds)
- JWT sessions in httpOnly cookies
- API routes scoped by userId
- Server-side validation
- No cross-user reads

## Quality Assurance Results

**Automated test executions:** ${totalAuto} (Jest + Playwright)

| Category | Stories | Pass | Fail | Manual |
|----------|-----------|------|------|--------|
| Authentication | ${auth.total} | ${auth.pass} | ${auth.fail} | ${auth.manual} |
| Dashboard | ${dash.total} | ${dash.pass} | ${dash.fail} | ${dash.manual} |
| Client CRUD | ${client.total} | ${client.pass} | ${client.fail} | ${client.manual} |
| Rides | ${ride.total} | ${ride.pass} | ${ride.fail} | ${ride.manual} |
| Earnings | ${earn.total} | ${earn.pass} | ${earn.fail} | ${earn.manual} |
| Profile & Nav | ${prof.total} | ${prof.pass} | ${prof.fail} | ${prof.manual} |

Executed checks passed: ${passedAuto} / ${totalAuto} (${passRate}%).

Failures (if any): ${failedAuto}.

Manual story rows in report: ${manualStories}.

**Full interactive report:** [hum-client-book-qa.surge.sh](https://hum-client-book-qa.surge.sh)

## Deployment

**Production:**

- Build: \`npm run build\`
- TypeScript: project compiles
- QA: \`npm run test:report\`

**Deploy to Linode:**

\`\`\`bash
git clone <repo-url> hum-client-book
cd hum-client-book
npm install --production
npm run build
pm2 start ecosystem.config.js
\`\`\`

## Next Steps

See [qa/USER_STORIES.md](qa/USER_STORIES.md) for manual acceptance criteria.
`;

  fs.writeFileSync(path.join(ROOT, "qa", "QA_SNAPSHOT.md"), md, "utf8");
}

function countPlaywrightTests(pw: PlaywrightJSON) {
  let pwPassed = 0;
  let pwFailed = 0;
  let pwTotal = 0;
  function walkSpec(spec: PWSpec) {
    pwTotal++;
    const first = spec.tests?.[0] as PWTest | undefined;
    const ok =
      spec.ok === true ||
      first?.outcome === "expected" ||
      first?.status === "passed";
    if (ok) pwPassed++;
    else pwFailed++;
  }
  function walk(s: PWSuite) {
    for (const spec of s.specs ?? []) walkSpec(spec);
    for (const child of s.suites ?? []) walk(child);
  }
  for (const root of pw.suites ?? []) walk(root);
  return { pwPassed, pwFailed, pwTotal };
}

function main() {
  const mergedPath = path.join(ROOT, "qa", "results.json");
  let unit: JestJSON;
  let e2e: PlaywrightJSON;

  if (fs.existsSync(mergedPath)) {
    const mergedFile = readJSON<{ unit?: JestJSON; e2e?: PlaywrightJSON }>(
      mergedPath,
      {}
    );
    unit = mergedFile.unit ?? readJSON(path.join(ROOT, "qa", "unit-results.json"), {});
    e2e = mergedFile.e2e ?? readJSON(path.join(ROOT, "qa", "e2e-results.json"), {});
  } else {
    unit = readJSON(path.join(ROOT, "qa", "unit-results.json"), {});
    e2e = readJSON(path.join(ROOT, "qa", "e2e-results.json"), {});
  }

  const jestMap = collectJestResults(unit);
  const pwMap = collectPlaywrightResults(e2e);
  const merged = mergeMaps(jestMap, pwMap);
  const features = buildFeaturesFromResults(merged);

  const jestPassed = unit.numPassedTests ?? 0;
  const jestFailed = unit.numFailedTests ?? 0;
  const jestTotal = unit.numTotalTests ?? 0;
  const { pwPassed, pwFailed, pwTotal } = countPlaywrightTests(e2e);

  const totalAuto = jestTotal + pwTotal;
  const passedAuto = jestPassed + pwPassed;
  const failedAuto = jestFailed + pwFailed;
  const manualStories = features
    .flatMap((f) => f.stories)
    .filter((s) => s.status === "MANUAL").length;
  const passRate =
    totalAuto > 0 ? Math.round((passedAuto / totalAuto) * 1000) / 10 : 0;

  const html = renderReport({
    features,
    generated: new Date().toISOString(),
    unit,
    pw: e2e,
  });
  fs.mkdirSync(path.join(ROOT, "qa", "report"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "qa", "report", "index.html"), html, "utf8");

  writePresentation({
    totalAuto,
    passedAuto,
    failedAuto,
    manualStories,
    passRate,
    features,
  });

  console.log("Wrote qa/report/index.html and qa/QA_SNAPSHOT.md");
}

main();
