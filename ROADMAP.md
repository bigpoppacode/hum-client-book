# HUM Client Book — AI-Accelerated Product Roadmap

**Last Updated:** May 12, 2026
**Based On:** MVP v1.0 codebase, QA Report (60 tests, 90% pass rate), PRD0NOTES.md (full feature set)
**Development Model:** AI-accelerated (Claude Code + Cursor Agent)
**Author:** Generated via deep codebase analysis

---

## Executive Summary

HUM Client Book is a mobile-first CRM for independent rideshare drivers. The MVP is live with 7 core features: authentication, client CRUD with tagging/grouping, ride logging with fare prefill, a "Book Again" quick-rebook flow, real-time search and filtering, an earnings dashboard with period-based aggregations, and editable client notes/preferences. The codebase is clean — Next.js 14 App Router, TypeScript, MongoDB with Mongoose, Auth.js with JWT sessions, and a hand-built glassmorphic component system with 44px+ touch targets. The architecture is API-first, meaning a mobile app can reuse every endpoint without changes.

The QA suite covers 60 automated tests (27 unit, 33 E2E). 54 pass. The 6 failures are minor: 2 Jest timeouts on MongoDB operations, 2 Playwright strict-mode selector ambiguities, 1 sort dropdown issue, and 1 help modal test. All are fixable in under an hour. Core user flows — ride logging, earnings, search, delete confirmation — are 100% green.

This roadmap covers 12 days of AI-accelerated development. With Claude Code handling implementation (4-12 hour builds per feature) and automated QA validating each ship, the bottleneck shifts from coding to product decisions. The plan is structured in four 3-day phases: stabilize the foundation, enable daily driver workflows, unlock revenue, and prepare for scale. Every feature listed has been evaluated against the existing codebase architecture, current schema design, and available third-party APIs.

---

## Development Timeline Philosophy

**Traditional vs AI-Accelerated:**

| Traditional Estimate | AI-Accelerated Reality | Why |
|---|---|---|
| 1 month | 1 day | Claude Code generates full-stack features from spec |
| 3-month phase | 3 days | Parallel build + test cycles, no context switching |
| 12-month roadmap | 12 days of focused development | AI handles boilerplate; humans handle decisions |

**This roadmap assumes:**
- Claude Code implements features from written specs (BUILD_SPEC.md per feature)
- Cursor Agent or Playwright runs QA after each build (1-2 hours per cycle)
- Arthur (developer) makes product decisions and reviews code
- Features ship same-day or next-day, then get real user feedback
- External APIs (Twilio, Stripe, Google Maps) have Node SDKs that reduce integration to hours

**The workflow per feature:**
1. **Spec** (10 min): Write requirements in BUILD_SPEC.md
2. **Build** (2-8 hours): Claude Code implements end-to-end
3. **QA** (1-2 hours): Run automated tests, review output
4. **Fix** (30-60 min): Address QA findings
5. **Deploy** (10 min): Push to Linode via PM2

---

## Roadmap Overview

| Phase | Days | Theme | Goal |
|---|---|---|---|
| **Phase 1** | Days 1-3 | Foundation & Quick Wins | Fix QA failures, optimize performance, ship PWA + SMS |
| **Phase 2** | Days 4-6 | Driver Enablement | Scheduling, payment tracking, route visualization |
| **Phase 3** | Days 7-9 | Revenue & Retention | Analytics dashboard, driver coaching, referral system |
| **Phase 4** | Days 10-12 | Scale Preparation | Infrastructure hardening, React Native foundation, integrations |

---

## Phase 1: Foundation & Quick Wins (Days 1-3)

### Day 1 Morning: Fix QA Failures → 100% Pass Rate

**Priority:** CRITICAL
**Effort:** 1-2 hours
**Build with:** Claude Code (direct fixes)

The 6 test failures are well-understood and mechanically fixable:

**Unit Test Fixes (2 failures):**
- `qa/unit/api-clients.test.ts` — Two tests timeout at 5000ms during MongoDB operations. Fix: increase Jest timeout to 15000ms for database test suites, or add connection pooling warmup in `beforeAll`. The MongoDB connection in `lib/mongodb.ts` uses a cached global pattern, but the first call in a test run cold-starts.

**E2E Test Fixes (4 failures):**
- `qa/e2e/auth.spec.ts` line 44 — `getByRole('alert')` matches both the error div and Next.js route announcer. Fix: change to `page.getByRole('alert').filter({ hasText: /invalid/i })`.
- `qa/e2e/client-crud.spec.ts` line 10 — `getByRole('button', { name: 'Regular' })` hits two elements (group selector + tag chip). Fix: scope to `.first()` or target the form section specifically.
- `qa/e2e/dashboard.spec.ts` line 76 — Sort dropdown test fails. Fix: add `await page.waitForResponse(r => r.url().includes('/api/clients'))` after selecting sort option.
- `qa/e2e/profile.spec.ts` line 37 — Help modal button not found. Fix: verify the help button aria-label matches the test selector, ensure HelpModal renders in the dashboard layout.

**Success Criteria:**
- All 60 tests green
- QA report regenerated with 100% pass rate

---

### Day 1 Afternoon: Performance Optimization

**Priority:** HIGH
**Effort:** 4-6 hours
**Build with:** Claude Code

The current `GET /api/clients` endpoint runs a full aggregation pipeline (`$match` → `$lookup` rides → `$addFields` rideCount/totalRevenue → `$sort`) on every request with no pagination. This works for 30 seeded clients but will degrade past 200.

**Tasks:**
1. **Add pagination to client list API**
   - Add `page` and `limit` query params to `GET /api/clients` (default: page=1, limit=50)
   - Return `{ clients: [], total: number, page: number, hasMore: boolean }`
   - Update dashboard page component to support "Load More" or infinite scroll
   - The existing `$match` + `$lookup` pipeline stays the same, just add `$skip` and `$limit` stages

2. **Add compound indexes for common queries**
   - Client model: `{ userId: 1, name: 1 }` and `{ userId: 1, group: 1 }` already exist
   - Add: `{ userId: 1, tags: 1 }` for tag filtering
   - Ride model: `{ userId: 1, date: -1 }` already exists
   - Add: `{ clientId: 1, fare: 1 }` for revenue aggregations

3. **Cache earnings summary**
   - The `GET /api/rides/summary` endpoint runs a full aggregation on every period switch
   - Add in-memory cache (Map with TTL) keyed by `userId:period` — invalidate on new ride creation
   - No Redis needed yet; a simple `lib/cache.ts` with `Map<string, { data, expiry }>` handles this for single-server deployment

4. **Optimize search debouncing**
   - `SearchBar.tsx` already debounces at 200ms — this is fine
   - Add `AbortController` to cancel in-flight search requests when user types again
   - This prevents stale results from slower queries replacing newer ones

**Success Criteria:**
- Client list loads < 500ms with 500 clients (currently untested at scale)
- Search cancels stale requests
- Earnings summary cached for 60 seconds per period

---

### Day 2: Progressive Web App (PWA) + Mobile Polish

**Priority:** HIGH
**Effort:** 8 hours
**Build with:** Claude Code

Drivers use this app between rides — in parking lots, at airports, in their cars. They need it to work when cell service is spotty and to feel like a native app they can tap from their home screen.

**Tasks:**

1. **PWA Foundation**
   - Add `public/manifest.json` with app name, icons (192px, 512px), theme color, display: standalone
   - Create service worker (`public/sw.js`) with cache-first strategy for static assets, network-first for API calls
   - Add `<link rel="manifest">` to root layout
   - Register service worker in a client component loaded from layout
   - Add "Add to Home Screen" meta tags for iOS (`apple-mobile-web-app-capable`, status bar style)

2. **Offline Data Access**
   - Cache the last-fetched client list in IndexedDB (or localStorage for simplicity)
   - When offline: serve cached client list with "Offline — data may be stale" banner
   - When online: sync and remove banner
   - Ride logging while offline: queue in localStorage, sync when connection returns
   - This uses the existing `lib/mongodb.ts` connection pattern — just add a client-side storage layer

3. **Mobile Gesture Enhancements**
   - Pull-to-refresh on client list (CSS + touch event handler, no library needed)
   - Swipe-to-call on client cards (swipe right → reveal phone button)
   - Long-press on client card for quick actions menu (edit, log ride, call)

4. **Touch & Animation Polish**
   - Add subtle haptic feedback on button presses (Navigator.vibrate API — Android only, graceful no-op on iOS)
   - Smooth page transitions (CSS `view-transition-name` or simple fade-in)
   - Loading skeletons for client list and earnings (replace spinner with content placeholders)

**Why this is 1 day:** PWA is configuration-heavy but logic-light. The service worker is ~80 lines. Manifest is a JSON file. Offline caching is localStorage reads/writes. No backend changes required.

**Success Criteria:**
- App installable on iOS Safari and Android Chrome
- Client list viewable offline
- Lighthouse PWA score > 90

---

### Day 3: Client Communication via SMS

**Priority:** HIGH
**Effort:** 6-8 hours
**Build with:** Claude Code

The number one thing drivers do after logging a client is text them. Currently, `ClientDetail` has a `tel:` link for calling — but no messaging integration. Drivers switch to their phone's Messages app, find the contact, type a message. This should be 2 taps inside HUM.

**Tasks:**

1. **Twilio Integration**
   - Install `twilio` npm package
   - Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` to env
   - Create `POST /api/messages/send` endpoint
     - Body: `{ clientId, message, templateId? }`
     - Validates client ownership (userId scope)
     - Sends SMS via Twilio REST API
     - Stores message in new `Message` model
   - Estimated cost: ~$0.0079/SMS segment (outbound US)

2. **Message Model** (new Mongoose schema)
   ```
   Message {
     userId: ObjectId (ref: User)
     clientId: ObjectId (ref: Client)
     direction: "outbound" | "inbound"
     body: String
     status: "sent" | "delivered" | "failed"
     twilioSid: String
     cost: Number
     createdAt: Date
   }
   ```

3. **Message Templates**
   - Pre-built templates stored client-side (no DB needed):
     - "On my way! ETA approximately {eta} minutes."
     - "Confirmed for {date} at {time}. See you then!"
     - "Hi {name}, are you available for a ride on {date}?"
     - "Thanks for riding with me today, {name}!"
   - Template picker UI: row of template buttons above text input
   - Variable substitution from client data + current date

4. **UI: Message Button + History**
   - Add "Message" button on client detail page (next to call button)
   - Tapping opens a bottom sheet with:
     - Template quick-select buttons
     - Free-text input
     - Send button
     - Recent message history (last 10, newest first)
   - Messages appear in a simple chat-style list (outbound only for v1 — inbound requires Twilio webhook, defer to later)

5. **Cost Tracking**
   - Show per-message cost in message history
   - Add "Messages" section to earnings page showing total SMS spend this month
   - Alert if monthly SMS spend exceeds $10 (configurable threshold)

**Why this is 1 day:** Twilio's Node SDK is ~5 lines to send an SMS. The Message model follows the same pattern as Ride. Template substitution is string replacement. The bottom sheet UI reuses existing modal patterns from HelpModal.

**Success Criteria:**
- Send SMS to client in 2 taps (template) or 3 taps (custom message)
- Message appears in client's message history
- Cost tracked per message and monthly total visible

---

## Phase 2: Driver Enablement (Days 4-6)

### Day 4: Ride Scheduling & Calendar View

**Priority:** HIGH
**Effort:** 8 hours
**Build with:** Claude Code

Drivers who build recurring client relationships (airport runs, medical appointments, weekly commuters) need to schedule ahead. Currently, rides are only logged after they happen. Scheduled rides let drivers plan their day and confirm with clients.

**Tasks:**

1. **Extend Ride Model**
   - Add fields to existing `models/Ride.ts`:
     - `status`: enum `["completed", "scheduled", "cancelled"]` (default: "completed" for backward compat)
     - `scheduledFor`: Date (optional — null means it was a logged ride, not scheduled)
     - `reminderSent`: Boolean (default: false)
   - Existing rides remain untouched (status defaults to "completed")

2. **Schedule Ride Flow**
   - New page: `/dashboard/clients/[id]/rides/schedule`
   - Reuses `RideLogForm` component with additions:
     - Date picker defaults to future (not today)
     - Time picker (hour + AM/PM)
     - "Recurring" toggle: if on, show frequency selector (Daily, Weekly, Biweekly, Monthly)
     - "Send confirmation SMS" checkbox (uses Day 3 Twilio integration)
   - `POST /api/rides` already exists — extend to accept `status: "scheduled"` and `scheduledFor`

3. **Calendar View**
   - New page: `/dashboard/calendar`
   - Add "Calendar" tab to bottom nav (replace or add 4th tab)
   - Week view showing scheduled rides as time blocks
   - Use `react-big-calendar` or build a lightweight custom week grid (7 columns x 24 rows)
   - Tap a ride block → navigate to client detail
   - Color-code by client group (VIP = gold, Regular = blue, New = green)

4. **Recurring Ride Templates**
   - New model: `RideTemplate`
     ```
     RideTemplate {
       userId: ObjectId
       clientId: ObjectId
       pickupLocation: String
       dropoffLocation: String
       fare: Number
       frequency: "daily" | "weekly" | "biweekly" | "monthly"
       dayOfWeek: Number (0-6, for weekly)
       timeOfDay: String ("09:00")
       active: Boolean
     }
     ```
   - Cron job (or Next.js API route called by external cron): runs daily, creates scheduled rides from active templates
   - Template management UI on client detail page: "Recurring Rides" section

5. **Ride Reminders**
   - 1 hour before scheduled ride: send SMS to driver (push notification if PWA)
   - Optional: send SMS to client ("Your driver will arrive at {time}")
   - Uses Twilio from Day 3

**Why this is 1 day:** The Ride model extension is 3 fields. The schedule form reuses RideLogForm. Calendar is a grid layout. Recurring templates are a new model + daily cron. SMS reminders reuse the Twilio integration from Day 3.

**Success Criteria:**
- Driver can schedule a ride for a future date/time
- Calendar shows upcoming scheduled rides
- Recurring template auto-creates weekly rides
- SMS reminder sent 1 hour before ride

---

### Day 5: Payment Tracking & Invoicing

**Priority:** MEDIUM-HIGH
**Effort:** 6 hours
**Build with:** Claude Code

Drivers who operate independently collect payments through multiple channels — cash, Venmo, Zelle, CashApp, Apple Pay, cards. Tracking who paid and who owes is currently manual. This feature makes it automatic.

**Tasks:**

1. **Extend Ride Model (additional fields)**
   - Add to `models/Ride.ts`:
     - `paymentMethod`: enum `["cash", "card", "venmo", "zelle", "cashapp", "applepay", "other"]` (optional, default: null)
     - `paymentStatus`: enum `["paid", "pending", "overdue"]` (default: "pending")
     - `paidAt`: Date (optional — timestamp when marked paid)
   - Backward compatible: existing rides have null paymentMethod and "pending" status

2. **Payment UI on Ride Log**
   - Add payment method selector to `RideLogForm` (row of icon buttons: Cash, Card, Venmo, etc.)
   - Add "Mark as Paid" toggle (defaults to paid for cash, pending for digital methods)
   - After logging ride, if payment is pending, show "Mark as Paid" button in ride history

3. **Outstanding Balance Tracking**
   - New API endpoint: `GET /api/clients/[id]/balance`
     - Aggregates rides where `paymentStatus === "pending"` or `"overdue"`
     - Returns `{ outstanding: number, pendingRides: number, oldestPending: Date }`
   - Display on client detail page: "Outstanding: $45.00 (3 rides)" with amber warning color
   - Auto-mark as "overdue" if pending > 7 days (background check on fetch)

4. **Client Balance Dashboard**
   - New section on earnings page: "Outstanding Balances"
   - List clients with pending payments, sorted by amount descending
   - "Send Reminder" button (SMS via Twilio): "Hi {name}, you have an outstanding balance of ${amount} for {count} rides."
   - Total outstanding across all clients displayed prominently

5. **Invoice Generation**
   - `GET /api/clients/[id]/invoice?from=DATE&to=DATE`
   - Generates a simple HTML invoice (rendered server-side, downloadable as PDF via browser print)
   - Fields: driver name, client name, date range, ride list (date, pickup, dropoff, fare), total
   - "Send Invoice" button → emails PDF to client's email address (if on file)
   - No complex PDF library needed — HTML + CSS print stylesheet + `window.print()`

**Why this is 1 day:** Payment fields are 3 schema additions. The balance aggregation is one MongoDB pipeline. Invoice is an HTML template. The hardest part is the payment method icon row, which is just styled radio buttons.

**Success Criteria:**
- Every new ride has a payment method logged
- Outstanding balances visible per client and on earnings page
- Drivers can generate and share invoices

---

### Day 6: Route Visualization & Client Map

**Priority:** MEDIUM
**Effort:** 8 hours
**Build with:** Claude Code

Drivers who manage 50+ clients across a metro area waste time driving inefficiently between pickups. A map view showing where clients are and an optimized route for today's rides saves real time and gas money.

**Tasks:**

1. **Geocoding Client Addresses**
   - Add `location` field to Client model: `{ lat: Number, lng: Number, address: String }`
   - When a ride is logged, geocode pickup/dropoff using Google Maps Geocoding API (or Mapbox)
   - Store most common pickup location as client's primary location
   - Batch geocode existing clients on first load (if they have ride history)
   - API: `GET /api/clients/geocode/[id]` — geocodes and stores

2. **Client Map View**
   - New page: `/dashboard/map`
   - Embed Google Maps (or Mapbox GL JS) with client pins
   - Pin color by group (VIP = gold, Regular = blue, New = green)
   - Tap pin → popup with client name, ride count, revenue, "Navigate" button
   - "Navigate" button opens Google Maps/Apple Maps with directions
   - Cluster markers when zoomed out (marker clustering library)

3. **Today's Route Optimizer**
   - Select clients for today's rides (checkboxes on client cards or map pins)
   - "Optimize Route" button → calls Google Maps Directions API with waypoints
   - Display optimized order with:
     - Total estimated drive time
     - Total estimated distance
     - Turn-by-turn summary (not full nav — just "Client A → Client B → Client C")
   - Save route as "Today's Plan" (localStorage, ephemeral)

4. **Frequent Routes**
   - Track recurring pickup→dropoff pairs from ride history
   - "Saved Routes" section: top 5 most-used routes with one-tap navigation
   - Useful for airport runs, daily commuters, etc.

**Why this is 1 day:** Google Maps JavaScript SDK and Directions API handle all the heavy lifting — geocoding, rendering, route optimization. The client-side work is embedding the map, placing pins from coordinates, and calling the Directions API with an array of waypoints. No custom routing algorithm needed.

**API Cost Note:** Google Maps Platform pricing: $5/1000 geocoding requests, $10/1000 directions requests. At 50 clients and 5 route optimizations/day, monthly cost is ~$5-10.

**Success Criteria:**
- All clients with ride history visible on map
- Route optimizer suggests efficient pickup order for 3+ clients
- One-tap navigation to any client location

---

## Phase 3: Revenue & Retention (Days 7-9)

### Day 7: Advanced Analytics Dashboard

**Priority:** HIGH
**Effort:** 8 hours
**Build with:** Claude Code

The current earnings page shows totals and a recent rides list. Drivers need trend data to make better business decisions: which days are most profitable, which clients are worth cultivating, where are the gaps.

**Tasks:**

1. **Revenue Trends Chart**
   - Install `recharts` (lightweight React charting library, ~45KB gzipped)
   - New component: `EarningsTrendChart`
   - Line chart: daily earnings over last 30 days
   - Bar chart: weekly earnings over last 12 weeks
   - Period comparison: "This week vs last week" with delta percentage
   - Data source: `GET /api/rides/analytics/trends?range=30d` (new endpoint, MongoDB date aggregation)

2. **Client Lifetime Value (CLV)**
   - New API: `GET /api/clients/analytics/clv`
   - Calculate per client: `totalRevenue / monthsSinceFirstRide * 12` (annualized CLV)
   - Display as ranked list: "Top 10 Clients by Value"
   - Add CLV badge to client cards ($ icon with tier: Bronze < $500, Silver < $2000, Gold >= $2000)
   - Existing `computeInsights()` in `lib/insights.ts` already calculates totalSpent — extend with CLV

3. **Churn Risk Indicators**
   - Flag clients with no rides in 30+ days as "At Risk"
   - Flag clients whose ride frequency dropped > 50% as "Declining"
   - New badge on client cards: red "At Risk" or yellow "Declining"
   - Dashboard section: "Clients Needing Attention" — list of at-risk clients with last ride date and suggested action
   - Data source: compare last 30 days ride count vs previous 30 days per client

4. **Peak Hours Analysis**
   - Heatmap grid: 7 days x 24 hours, cell color = ride count
   - Shows when the driver is busiest and when there are gaps
   - "Opportunity" callout: "You have no rides on Tuesday afternoons — consider reaching out to clients"
   - Data source: `GET /api/rides/analytics/heatmap` (group by dayOfWeek + hour)

5. **Revenue Goals**
   - Set monthly earnings target (stored in User model or localStorage)
   - Progress bar on earnings page: "63% of $5,000 goal"
   - Projected month-end earnings based on current pace
   - "On track" / "Behind pace" indicator

**Why this is 1 day:** Recharts handles all visualization. The data pipelines are MongoDB aggregations — `$group` by date, `$project` for deltas, `$bucket` for heatmap cells. The `lib/insights.ts` pattern already shows how to compute derived metrics from ride arrays.

**Success Criteria:**
- Revenue trend chart shows daily/weekly earnings with comparison
- Top 10 CLV clients ranked
- At-risk clients flagged on dashboard
- Peak hours heatmap renders correctly
- Monthly goal progress visible

---

### Day 8: Driver Coaching System

**Priority:** MEDIUM
**Effort:** 6 hours
**Build with:** Claude Code

Data without actionable advice is just numbers. The coaching system turns analytics into specific recommendations: "You have 5 clients who haven't booked in 30 days — here's a message template to reach out."

**Tasks:**

1. **Rule-Based Coaching Engine**
   - New file: `lib/coaching.ts`
   - Rules evaluate against driver's data and return tip objects:
     ```
     CoachingTip {
       id: string
       category: "retention" | "growth" | "earnings" | "efficiency"
       title: string
       body: string
       action?: { label: string, href: string }
       priority: "high" | "medium" | "low"
     }
     ```
   - Example rules:
     - `atRiskClients > 0` → "You have {n} clients who haven't booked in 30+ days. Reach out to re-engage them."
     - `averageFare < 20` → "Your average fare is ${avg}. Consider offering premium services or longer routes."
     - `ridesThisWeek < ridesLastWeek * 0.8` → "Your ride count dropped 20% this week. Check if any regulars need reminders."
     - `topPaymentMethod === 'cash'` → "Most of your payments are cash. Offering digital payment can increase tips by 15-25%."
     - `peakGap detected` → "You have no rides on {day} {timeRange}. Consider targeting this window."

2. **Coaching Dashboard Section**
   - New component on earnings page (or separate `/dashboard/coaching` page)
   - Cards showing top 3 tips, sorted by priority
   - Each card has: icon, title, 1-2 sentence explanation, action button (if applicable)
   - "Dismiss" button to hide tips you've already acted on (stored in localStorage)

3. **Milestone Celebrations**
   - Track milestones: 10th ride, 50th ride, 100th ride, $1K earned, $5K earned, $10K earned, 10 clients, 25 clients, 50 clients
   - On milestone trigger: show celebratory modal with confetti animation (CSS-only confetti, no library)
   - Store achieved milestones in `User.milestones: string[]` to avoid re-triggering
   - Check milestones on ride creation (server-side, return `{ milestone: "100_rides" }` in response)

4. **Best Practices Library**
   - Static content page: `/dashboard/tips`
   - Categories: "Getting More Clients", "Increasing Revenue", "Client Retention", "Efficiency"
   - 5-8 articles per category (short — 200-400 words each)
   - Written in markdown, rendered with simple styling
   - Example: "How to Ask for Recurring Bookings", "Pricing Strategies for Airport Runs"

**Why this is 1 day:** The coaching engine is if/then rules against data already computed by analytics (Day 7). No machine learning. Milestone checking is a count query on ride creation. The tips library is static markdown content.

**Success Criteria:**
- 3+ contextual coaching tips shown based on driver's actual data
- Milestone celebration triggers on threshold crossings
- Tips library accessible with actionable advice

---

### Day 9: Referral System + Onboarding Flow

**Priority:** MEDIUM
**Effort:** 6 hours
**Build with:** Claude Code

Growth through driver referrals is the most natural channel — drivers talk to other drivers at airports, gas stations, and waiting lots. A referral system codifies this.

**Tasks:**

1. **Referral Code Generation**
   - Add to User model: `referralCode: String` (unique, auto-generated on registration — 8-char alphanumeric)
   - Add: `referredBy: ObjectId` (ref: User, optional)
   - Add: `referralCount: Number` (default: 0)
   - On registration: if `?ref=CODE` in URL, look up referrer and set `referredBy`
   - Increment referrer's `referralCount` on successful registration

2. **Referral Sharing Page**
   - New page: `/dashboard/referrals`
   - Display referral code prominently
   - "Share" button that uses Web Share API (native share sheet on mobile) or copies link
   - Share message: "I use HUM to manage my rideshare clients — track rides, earnings, and client relationships. Sign up with my code: {code}"
   - Track who signed up via your code (list of referred users with join date)

3. **Reward Tiers**
   - 3 referrals → "Bronze Referrer" badge on profile
   - 5 referrals → 1 month free of Pro tier (when monetization launches)
   - 10 referrals → 3 months free + "Gold Referrer" badge
   - Rewards displayed on referral page as progress bar
   - Reward fulfillment is manual initially (flag account, apply credit later)

4. **Onboarding Flow for New Users**
   - 3-screen welcome flow (shown once after first login):
     - Screen 1: "Welcome to HUM" — value proposition, illustration
     - Screen 2: "Add Your First Client" — guided form with tooltips
     - Screen 3: "Log Your First Ride" — shows the ride logging flow
   - Progress indicator (dots at bottom)
   - "Skip" button on each screen
   - Store `onboardingComplete: Boolean` in User model (or localStorage)
   - This was cut from the original PRD — it's time to add it

5. **"How did you hear about me?" Field**
   - Add optional `source` field to Client model: free-text or dropdown (Referral, Airport, Social Media, Existing Client, Other)
   - Shows on Add Client form as optional last field
   - Trackable in analytics: which acquisition channels bring the best clients

**Why this is 1 day:** Referral codes are UUID generation + a DB lookup on registration. The sharing page uses the Web Share API (3 lines of JS). Onboarding is 3 static screens with navigation. No complex logic.

**Success Criteria:**
- Every user has a unique referral code
- Referral link tracks signups
- New users see 3-screen onboarding
- Client source field visible in analytics

---

## Phase 4: Scale Preparation (Days 10-12)

### Day 10: Infrastructure Hardening

**Priority:** HIGH
**Effort:** 6 hours
**Build with:** Claude Code + manual configuration

Before scaling from 10 beta users to 100+, the infrastructure needs to handle concurrent load and provide visibility into issues.

**Tasks:**

1. **Database Optimization**
   - Audit all MongoDB queries using `explain()` — ensure index usage on:
     - `clients: { userId, name }`, `{ userId, group }`, `{ userId, tags }`
     - `rides: { clientId, date }`, `{ userId, date }`, `{ userId, status, scheduledFor }`
     - `messages: { clientId, createdAt }`
   - Enable MongoDB Atlas monitoring alerts (slow query > 500ms, connection count > 50)
   - Set up connection pool limits in `lib/mongodb.ts` (maxPoolSize: 10 for Linode deployment)

2. **Error Tracking (Sentry)**
   - Install `@sentry/nextjs`
   - Configure for both client and server error capture
   - Set up source maps upload for readable stack traces
   - Create alert rules: error spike > 10/minute, new error type
   - Add error boundaries to React component tree

3. **Rate Limiting**
   - Add rate limiting middleware for Next.js API routes
   - Limits: 100 requests/minute per authenticated user, 10 requests/minute for auth endpoints
   - Return `429 Too Many Requests` with retry-after header
   - Prevents both abuse and accidental infinite loops

4. **CDN & Caching**
   - Set up Cloudflare in front of Linode VPS
   - Cache static assets (JS, CSS, images) at edge
   - Configure `Cache-Control` headers for API responses:
     - Client list: `private, max-age=30` (30-second cache)
     - Earnings summary: `private, max-age=60`
     - Static pages: `public, max-age=3600`

5. **Health Monitoring**
   - `GET /api/health` endpoint already exists — extend with:
     - Database connectivity check
     - Response time measurement
     - Memory usage
   - Set up uptime monitoring (UptimeRobot or Cloudflare health checks)
   - Alert on downtime > 30 seconds

6. **Automated Backups**
   - MongoDB Atlas automated backups (already included in Atlas tiers)
   - Verify point-in-time recovery is enabled
   - Test restore procedure once

**Why this is 1 day:** Sentry is an npm install + config file. Rate limiting is middleware. Cloudflare setup is DNS changes + dashboard config. Health checks are extending an existing endpoint.

**Success Criteria:**
- Error tracking live with alerts
- Rate limiting active on all API routes
- Cloudflare CDN serving static assets
- Health endpoint reports DB status

---

### Day 11: React Native Mobile App Foundation

**Priority:** HIGH
**Effort:** 8-10 hours
**Build with:** Claude Code

While the PWA (Day 2) gives mobile presence, a native app enables push notifications, biometric auth, and App Store distribution — all critical for driver adoption.

**Tasks:**

1. **Project Initialization**
   - Initialize Expo project (managed workflow for speed)
   - Configure TypeScript, ESLint
   - Set up navigation (Expo Router or React Navigation)
   - Configure API client pointing to existing backend
   - Share type definitions with web app (extract to shared `/types` directory)

2. **Authentication Flow**
   - Login screen with email/password
   - Biometric auth (FaceID / TouchID) via `expo-local-authentication`
   - Store JWT in SecureStore (encrypted device storage)
   - Auto-login on app open if biometric succeeds
   - Registration screen

3. **Core Screens (4 screens minimum)**
   - **Client List:** FlatList with search bar, filter chips, pull-to-refresh
   - **Client Detail:** Contact info, insights grid, ride history, action buttons
   - **Log Ride:** Form with pickup/dropoff, fare, date, payment method
   - **Earnings:** Period selector, summary cards, recent rides

4. **Offline Support**
   - AsyncStorage for caching client list and recent rides
   - Queue ride logs when offline, sync when connection returns
   - Visual indicator: "Offline — changes will sync when connected"

5. **Push Notifications**
   - Expo Push Notifications setup
   - Register device token on login → store in User model
   - Server sends push for: scheduled ride reminder, payment received, milestone achieved
   - New API endpoint: `POST /api/notifications/register` (stores push token)

6. **Build & Distribute**
   - Create Expo development build
   - Generate TestFlight build (iOS) for beta testers
   - Generate APK for Android sideloading
   - Document build/deploy process

**Why this is 1 day:** Expo eliminates native build complexity. All business logic lives on the server — the app is a thin client calling existing API endpoints. React Native components map closely to the web components already built. Authentication and data fetching patterns are identical.

**Success Criteria:**
- App runs on iOS and Android simulators
- Login + client list + ride logging functional
- TestFlight build submitted for iOS beta
- Offline mode works for viewing cached data

---

### Day 12: Key Integrations & Monetization Prep

**Priority:** MEDIUM-HIGH
**Effort:** 6 hours
**Build with:** Claude Code

Ship the integrations that enable revenue collection and connect HUM to drivers' existing tools.

**Tasks:**

1. **Stripe Subscription Billing**
   - Install `stripe` npm package
   - Create Stripe products: Free, Pro ($29/month), Premium ($49/month)
   - Implement:
     - `POST /api/billing/create-checkout` → Stripe Checkout session
     - `POST /api/billing/webhook` → handle `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`
     - `GET /api/billing/status` → return current plan and billing period
   - Add `subscription` fields to User model: `{ plan, stripeCustomerId, subscriptionId, currentPeriodEnd }`
   - Add billing page: `/dashboard/settings/billing` with plan selector, current plan, "Manage Subscription" link (Stripe Customer Portal)
   - Feature gating: Free tier = 10 clients max, Pro = unlimited, Premium = unlimited + analytics

2. **Google Calendar Sync**
   - Install `googleapis` npm package
   - OAuth2 flow: "Connect Google Calendar" button on settings page
   - On connect: sync scheduled rides → Google Calendar events
   - Event includes: client name, pickup location, time
   - Two-way: if driver deletes calendar event, mark ride as cancelled (webhook)
   - Store OAuth tokens in User model (encrypted)

3. **Email Notifications (SendGrid)**
   - Install `@sendgrid/mail`
   - Transactional emails:
     - Welcome email on registration
     - Weekly earnings summary (every Monday at 8am)
     - "Client needs attention" alert (at-risk client, 7 days after last ride)
     - Invoice delivery (from Day 5 invoicing feature)
   - Unsubscribe link in all emails
   - Email templates: simple HTML with inline CSS (compatible with all email clients)

4. **Webhook API for Extensibility**
   - `POST /api/webhooks/configure` — let drivers register webhook URLs
   - Events: `ride.created`, `client.created`, `payment.received`, `milestone.achieved`
   - On event: POST JSON payload to registered URL
   - Enables Zapier/Make/n8n integration without custom Zapier app
   - Example use case: "New ride logged → add row to Google Sheet"

**Why this is 1 day:** Stripe Checkout handles the entire payment UI — no custom forms needed. Google Calendar OAuth is boilerplate. SendGrid sends emails in 3 lines. Webhooks are POST requests on model save hooks.

**Success Criteria:**
- Stripe checkout flow working in test mode
- Google Calendar connected and showing scheduled rides
- Welcome email sent on registration
- Webhook fires on ride creation

---

## Features NOT on This Roadmap (Deprioritized)

These features were considered and deliberately excluded. They can be revisited after the 12-day sprint based on user feedback.

| Feature | Reason for Deferral |
|---|---|
| **Multi-driver teams / fleet management** | Adds significant complexity to auth and data model. No demand signal from solo drivers yet. |
| **Uber/Lyft API integration** | Their APIs are restrictive, expensive, and frequently change. Low ROI for integration effort. |
| **White-label / custom branding** | Premature before product-market fit. Focus on one great product first. |
| **AI-powered ride predictions** | Nice to have. Rule-based coaching (Day 8) delivers 80% of the value with 10% of the complexity. |
| **Insurance tracking / compliance** | Regulatory complexity varies by state. Out of scope for a CRM. |
| **Vehicle maintenance logging** | Tangential to core value prop. Plenty of existing apps handle this. |
| **In-app chat between drivers** | Community features are a different product. Focus on individual driver productivity. |
| **Multi-language support (i18n)** | English-first market. Add when expanding internationally. |
| **Dark mode** | Low effort but low impact. Add as a polish item after core features ship. |

---

## Success Metrics: 30 Days Post-Roadmap

### Adoption

| Metric | Target | How to Measure |
|---|---|---|
| Registered drivers | 100 by Day 14, 500 by Day 30 | User count in MongoDB |
| Daily active drivers | 70% of registered | Unique userId in rides table, last 24h |
| Rides logged per driver per week | 15+ | Ride count / active users / weeks |
| Clients per driver | 20+ average | Client count / active users |

### Engagement

| Metric | Target | How to Measure |
|---|---|---|
| Feature adoption: SMS | 40% of active drivers send 1+ message | Message count > 0 per user |
| Feature adoption: Scheduling | 30% of active drivers schedule 1+ ride | Rides with status "scheduled" |
| Feature adoption: Analytics | 50% of active drivers view analytics weekly | Page view tracking |
| Session duration | 3+ minutes average | Analytics event tracking |
| Sessions per day | 2+ per active driver | Session count / DAU |

### Revenue

| Metric | Target | How to Measure |
|---|---|---|
| Paid conversion rate | 10% of active drivers | Stripe subscriptions / active users |
| Monthly Recurring Revenue | $2,900+ (100 x $29/month) | Stripe dashboard |
| Customer Acquisition Cost | < $25 | Marketing spend / new signups |
| LTV:CAC ratio | > 10:1 | (ARPU x avg lifetime) / CAC |
| Churn rate (monthly) | < 15% | Cancelled subscriptions / total subscriptions |

### Technical

| Metric | Target | How to Measure |
|---|---|---|
| API response time (p95) | < 200ms | Sentry/custom monitoring |
| Uptime | 99.5%+ | UptimeRobot |
| QA pass rate | 100% (automated) | Playwright + Jest results |
| Error rate | < 0.1% of requests | Sentry error count / total requests |
| Lighthouse performance score | > 90 | Lighthouse CI |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| API costs spike at scale (Twilio, Google Maps) | Medium | Medium | Set per-user monthly caps; have backup providers (Bandwidth for SMS, Mapbox for maps) |
| Drivers unwilling to pay $29/month | Medium | High | Start with $19/month; offer annual discount; demonstrate clear ROI via analytics |
| Technical debt from 12-day sprint | High | Medium | Day 10 is dedicated to infrastructure; refactor-as-you-go, not after |
| Competition ships faster | Low | Medium | Focus on niche (independent rideshare drivers), not broad CRM |
| One developer becomes bottleneck | Medium | High | AI handles implementation; Arthur focuses on decisions and reviews |
| Twilio outage blocks SMS | Low | Low | SMS is enhancement, not core flow; queue messages and retry |

---

## Conclusion

This is a 12-day execution plan, not a 12-month wish list.

The MVP proved the core loop works: add client → log ride → track earnings. The next 12 days compound that foundation into a product drivers can't live without — scheduling, messaging, payment tracking, analytics, and a native mobile app.

The critical insight is that AI-accelerated development makes feature velocity a product advantage, not just an engineering one. When you can ship a complete feature in a day, you can test 12 ideas in 12 days and keep the 6 that work. Traditional startups test 3 ideas in 12 weeks.

**What to do tomorrow:**
1. Fix the 6 QA failures (1-2 hours)
2. Ship performance optimizations (4-6 hours)
3. Start PWA conversion (end of day)
4. Get 5 real drivers using the app by end of Day 3

**The bottleneck is decisions, not development.** Decide what to build. AI builds it. Users validate it. Repeat for 12 days. Ship.
