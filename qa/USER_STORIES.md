# HUM Client Book — User Stories & Acceptance Criteria

Stories map to automated tests via IDs in test titles (e.g. `[US-AUTH-001]`).

---

## Authentication

### US-AUTH-001 — User can register with valid email/password
- **Acceptance Criteria:** User submits name, valid email, password ≥ 6 chars; account is created; user reaches dashboard.
- **Priority:** High
- **Test Type:** Auto (e2e)

### US-AUTH-002 — User can login with valid credentials
- **Acceptance Criteria:** Valid email/password signs in and navigates to dashboard.
- **Priority:** High
- **Test Type:** Auto (e2e)

### US-AUTH-003 — User sees error with invalid login
- **Acceptance Criteria:** Wrong password shows error message (e.g. “Invalid email or password”); user stays on login.
- **Priority:** High
- **Test Type:** Auto (e2e)

### US-AUTH-004 — User session persists across page reloads
- **Acceptance Criteria:** After login, reload on a protected route keeps user authenticated (no redirect to login).
- **Priority:** High
- **Test Type:** Auto (e2e)

### US-AUTH-005 — User can logout and is redirected to login
- **Acceptance Criteria:** Sign out clears session and lands on `/login`.
- **Priority:** High
- **Test Type:** Auto (e2e)

---

## Dashboard

### US-DASH-001 — Client list loads and displays all clients
- **Acceptance Criteria:** Dashboard finishes loading; client count badge matches listed clients (≥ 0).
- **Priority:** High
- **Test Type:** Auto (e2e)

### US-DASH-002 — Search by name filters clients
- **Acceptance Criteria:** Typing a name substring filters the list to matching clients.
- **Priority:** High
- **Test Type:** Auto (e2e)

### US-DASH-003 — Search by phone filters clients
- **Acceptance Criteria:** Typing digits from phone narrows the list correctly.
- **Priority:** High
- **Test Type:** Auto (e2e)

### US-DASH-004 — Filter chips work (VIP / Regular / New)
- **Acceptance Criteria:** Selecting group chip filters; clearing restores full list where applicable.
- **Priority:** Medium
- **Test Type:** Auto (e2e)

### US-DASH-005 — Sort options work (newest / oldest / rides / alpha / revenue)
- **Acceptance Criteria:** Changing sort updates ordering (observable via first client or labels).
- **Priority:** Medium
- **Test Type:** Auto (e2e)

### US-DASH-006 — FAB navigates to add client form
- **Acceptance Criteria:** “Add Client” FAB opens `/dashboard/clients/new`.
- **Priority:** High
- **Test Type:** Auto (e2e)

---

## Client CRUD

### US-CLIENT-001 — Add client with all fields succeeds
- **Acceptance Criteria:** Submitting valid name, phone, group, optional fields creates client and shows detail route.
- **Priority:** High
- **Test Type:** Auto (e2e)

### US-CLIENT-002 — Add client validates required fields
- **Acceptance Criteria:** Browser / API rejects missing name or phone with clear validation.
- **Priority:** High
- **Test Type:** Auto (e2e) + Manual

### US-CLIENT-003 — View client detail shows all information
- **Acceptance Criteria:** Detail shows name, group, contact, insights grid, notes area, ride history section.
- **Priority:** High
- **Test Type:** Auto (e2e)

### US-CLIENT-004 — Contact links (tel:/mailto:) are clickable
- **Acceptance Criteria:** Phone uses `tel:` link; when email present, `mailto:` link present.
- **Priority:** Medium
- **Test Type:** Auto (e2e)

### US-CLIENT-005 — Edit client updates information
- **Acceptance Criteria:** Edit flow saves name (or other fields) and detail reflects changes.
- **Priority:** High
- **Test Type:** Auto (e2e)

### US-CLIENT-006 — Delete client removes from list (4-step flow)
- **Acceptance Criteria:** Gear → Danger Zone → modal → confirm deletes client; dashboard no longer lists them.
- **Priority:** High
- **Test Type:** Auto (e2e)

### US-CLIENT-007 — Client notes can be saved
- **Acceptance Criteria:** Notes field persists after Save / blur workflow with saved indicator or reload.
- **Priority:** Medium
- **Test Type:** Auto (e2e)

---

## Rides

### US-RIDE-001 — Log ride validates required fields
- **Acceptance Criteria:** Empty pickup/dropoff/fare/date blocked by validation.
- **Priority:** High
- **Test Type:** Auto (unit + e2e)

### US-RIDE-002 — Log ride saves successfully
- **Acceptance Criteria:** Valid ride appears in client ride history with correct fare/route.
- **Priority:** High
- **Test Type:** Auto (e2e)

### US-RIDE-003 — Book Again pre-fills pickup/dropoff
- **Acceptance Criteria:** Book Again link opens log form with locations prefilled.
- **Priority:** Medium
- **Test Type:** Auto (e2e)

### US-RIDE-004 — Fare pre-fills from default rate
- **Acceptance Criteria:** When client has default rate, fare field pre-populates.
- **Priority:** Medium
- **Test Type:** Auto (e2e)

### US-RIDE-005 — Payment toast sequence displays
- **Acceptance Criteria:** After submit, “sending” then “received” payment toasts appear before redirect.
- **Priority:** Low
- **Test Type:** Auto (e2e)

---

## Earnings

### US-EARN-001 — Period tabs switch data (Today / Week / Month / All)
- **Acceptance Criteria:** Each tab loads summary without error; totals may change per period.
- **Priority:** High
- **Test Type:** Auto (e2e)

### US-EARN-002 — Summary cards display correct totals
- **Acceptance Criteria:** Total Earnings, Total Rides, Average Fare show numeric values.
- **Priority:** High
- **Test Type:** Auto (e2e)

### US-EARN-003 — Top client displays correctly
- **Acceptance Criteria:** Top client name and amount shown when rides exist; placeholder when none.
- **Priority:** Medium
- **Test Type:** Auto (e2e)

### US-EARN-004 — Recent rides list shows for period
- **Acceptance Criteria:** Section lists rides or “No rides in this period” empty state.
- **Priority:** Medium
- **Test Type:** Auto (e2e)

---

## Profile

### US-PROF-001 — User info displays correctly
- **Acceptance Criteria:** Name and email from session visible on profile.
- **Priority:** High
- **Test Type:** Auto (e2e)

### US-PROF-002 — Sign out redirects to login
- **Acceptance Criteria:** Sign Out navigates to `/login`.
- **Priority:** High
- **Test Type:** Auto (e2e)

---

## Navigation

### US-NAV-001 — Bottom nav tabs navigate correctly
- **Acceptance Criteria:** Clients, Earnings, Profile links reach correct routes.
- **Priority:** High
- **Test Type:** Auto (e2e)

### US-NAV-002 — Active tab is highlighted
- **Acceptance Criteria:** Current section tab has distinct active styling / `aria-current`.
- **Priority:** Medium
- **Test Type:** Manual

### US-NAV-003 — Help modals display when needed
- **Acceptance Criteria:** Help buttons open modal text and can be dismissed.
- **Priority:** Low
- **Test Type:** Manual

---

## Accessibility

### US-A11Y-001 — All touch targets are 44px+
- **Acceptance Criteria:** Primary controls meet 44px minimum tap targets (spot-check).
- **Priority:** Medium
- **Test Type:** Manual

### US-A11Y-002 — Focus rings are visible
- **Acceptance Criteria:** Keyboard focus visible on interactive elements.
- **Priority:** Medium
- **Test Type:** Manual

### US-A11Y-003 — Layout is responsive (320px+)
- **Acceptance Criteria:** Viewport 320–768px: no horizontal scroll for core flows.
- **Priority:** Medium
- **Test Type:** Manual
