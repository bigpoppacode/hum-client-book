# HUM Client Book — App Presentation & Testing Guide

---

## What Is HUM Client Book?

HUM Client Book is a **mobile-first web application** for independent drivers to manage their client relationships, log rides, track earnings, and streamline their daily workflow. Think of it as a personal CRM built specifically for drivers who want to professionalize their client interactions.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS with custom glassmorphic design system |
| Auth | Auth.js v5 (Credentials provider, JWT strategy) |
| Database | MongoDB via Mongoose |
| Deployment | Self-hosted on Linode with PM2 + NGINX |

### Live URL

**https://hum-client-book.thelinkfor.me**

### GitHub Repository

**https://github.com/bigpoppacode/hum-client-book**

---

## Test Account Credentials

| Field | Value |
|-------|-------|
| **Email** | `hum.test.driver.20260511.1748@example.com` |
| **Password** | `TestPass123!` |
| **Display Name** | HUM Test Driver |
| **Seeded Data** | 30 clients, 125 rides (spanning the last 90 days) |

> *"There was Brenda, LaTisha, Linda, Felicia, Dawn, LeShaun, Ines, and Alicia..."*
> The client roster pays homage to DMX's viral song — if you know, you know.
> Yes, there are three Kims. And Cookie? Met her at the ice cream parlor.

---

## Feature Overview (7 Core Features)

1. **Authentication** — Register, login, logout with secure JWT sessions
2. **Client Management** — Full CRUD for clients with groups, tags, default rates, and notes
3. **Client Dashboard** — Search, filter by group, sort by multiple criteria, instant results
4. **Client Detail & Insights** — Contact shortcuts, ride stats, frequency analysis, notes
5. **Ride Logging & Book Again** — Log rides with fare, locations, dates; Book Again prefills from last ride
6. **Earnings Tracker** — Period-based summaries (Today/Week/Month/All), top client, recent rides
7. **Navigation & Profile** — Bottom tab bar, profile page with logout

---

## Screen-by-Screen Manual Testing Guide

### Screen 1: Login Page

**URL:** `/login`

**What to Test:**
- [ ] Page loads with the HUM Client Book logo and a gradient header
- [ ] Email and password fields are visible with proper labels
- [ ] Enter the test credentials above and tap **Sign In**
- [ ] On success, you are redirected to the dashboard
- [ ] Try an invalid password — an error message appears below the form
- [ ] Tap the **Create an account** link — it navigates to the registration page

**Visual Checks:**
- Glassmorphic card styling on the form
- Inputs have proper focus rings (blue outline)
- Button is a full-width gradient (deep teal to green)

---

### Screen 2: Registration Page

**URL:** `/register`

**What to Test:**
- [ ] All fields visible: Name, Email, Password
- [ ] Submit with empty fields — validation errors appear
- [ ] Submit with a duplicate email — server error displayed
- [ ] Submit with valid new data — redirected to login with success message
- [ ] Tap **Already have an account?** — navigates back to login

---

### Screen 3: Client Dashboard (Home)

**URL:** `/dashboard`

**What to Test:**

**Header:**
- [ ] Shows "Your Clients" heading with a help icon (? button) and client count badge
- [ ] Tap the **?** icon — a help modal appears explaining the dashboard features
- [ ] Dismiss the modal by tapping the X or the overlay

**Search:**
- [ ] Tap the search bar and type a client name (e.g., "Cookie")
- [ ] Results filter in real-time as you type (debounced ~200ms)
- [ ] Search "Kim" — three results appear (Kim Lee, Kim Chen, Kim Park)
- [ ] Search also works on phone numbers and emails
- [ ] Clear the search — all 30 clients reappear

**Filter Chips:**
- [ ] Filter by **All**, **VIP**, **Regular**, **New**
- [ ] Each chip highlights with a distinct color when active
- [ ] Filters combine with search (search for "a" + filter by "VIP")

**Sort:**
- [ ] Use the sort dropdown: Newest, Most Rides, A-Z, Revenue
- [ ] Verify the client list reorders correctly
- [ ] "Most Rides" should show high-ride clients first
- [ ] "Revenue" should sort by total fare earned

**Client Cards:**
- [ ] Each card shows: name, group badge (colored), phone, ride count, total revenue
- [ ] Tap any card — navigates to that client's detail page
- [ ] Look for Cookie Lyon (VIP) — she should have 12 rides, all from ice cream parlors

**FAB (Add Client Button):**
- [ ] A pill-shaped "+ Add Client" button floats at the bottom-right
- [ ] Tap it — navigates to the Add Client page

---

### Screen 4: Add Client

**URL:** `/dashboard/clients/new`

**What to Test:**
- [ ] Form fields: Name (required), Phone (required), Email, Group dropdown, Default Rate, Tags
- [ ] Help icon in header — tap to see guidance
- [ ] Submit with empty name — validation error
- [ ] Submit with invalid phone — validation error
- [ ] Fill in valid data and tap **Save Client**
- [ ] On success: redirected to the new client's detail page
- [ ] **Demo Toast:** A green "Client added successfully" toast appears, followed by a blue info toast reading "Demo Mode: In production, [Name] would receive an onboarding email..."

---

### Screen 5: Client Detail

**URL:** `/dashboard/clients/[id]`

**What to Test:**

**Header Section:**
- [ ] Gradient header shows client name, group badge, help icon
- [ ] Back arrow navigates to dashboard

**Contact Shortcuts:**
- [ ] Phone number is a tappable `tel:` link
- [ ] Email (if present) is a tappable `mailto:` link

**Tags:**
- [ ] Tags display as colored chips below contact info

**Insights Cards (2x2 Grid):**
- [ ] **Total Rides** — count of all rides for this client
- [ ] **Total Revenue** — sum of all fares, formatted as currency
- [ ] **Avg Fare** — average fare per ride
- [ ] **Frequency** — labeled as "Weekly", "Bi-weekly", "Monthly", or "Occasional" based on ride frequency

**Notes Section:**
- [ ] If notes exist, they are shown
- [ ] Type or edit notes and tap **Save Notes**
- [ ] A checkmark briefly appears confirming save

**Ride History:**
- [ ] Lists all rides for this client, newest first
- [ ] Each ride shows: date, pickup, dropoff, fare
- [ ] Dates display correctly (no off-by-one timezone issues)

**Log Ride Button:**
- [ ] If no rides exist, button reads **Log Ride**
- [ ] If rides exist, button reads **Log Another Ride**
- [ ] Tap it — navigates to the ride logging form for this client

**Book Again (on each ride):**
- [ ] Each ride in the history has a **Book Again** link
- [ ] Tapping it navigates to the ride form with pickup/dropoff pre-filled

**Manage / Delete (4-Step Protection):**
- [ ] Tap the **gear icon** in the header — reveals the Danger Zone section
- [ ] Danger Zone shows a red-outlined "Delete Client and All Rides" button
- [ ] Tap it — a confirmation modal appears showing the client name and ride count
- [ ] Modal has a prominent **Cancel** button and a secondary **Delete Permanently** button
- [ ] Tap Cancel — modal closes, nothing deleted
- [ ] Tap Delete Permanently — client and all rides are deleted, redirected to dashboard with a toast

---

### Screen 5b: Cookie Lyon — Special Client Spotlight

**How to find:** Search "Cookie" on the dashboard, or sort by "Most Rides"

**What to Test:**
- [ ] Notes field reads: "Met her at the ice cream parlor. Sweetest client on the roster."
- [ ] Tags show: Late Night, Weekend, Local
- [ ] Default rate is $25.00
- [ ] Group badge: VIP
- [ ] Ride history shows ~12 rides, ALL with ice cream parlor pickups:
  - Cones & Scoops Ice Cream Parlor
  - Sweet Swirls Creamery
  - Big Poppa's Ice Cream Shop
  - Frozen Bliss Parlor
  - The Waffle Cone Stand
- [ ] Ride notes include gems like "Got a double scoop before the ride", "Rocky road kinda day", "Cookie brought cookies and cream, obviously"
- [ ] Book Again on any ride pre-fills the ice cream parlor as the pickup

---

### Screen 6: Edit Client

**URL:** `/dashboard/clients/[id]/edit`

**What to Test:**
- [ ] Form pre-populated with existing client data
- [ ] Change the name and tap **Save Changes**
- [ ] Redirected back to client detail with updated name
- [ ] Change the group (e.g., Regular to VIP) and save — group badge updates

---

### Screen 7: Log Ride

**URL:** `/dashboard/clients/[id]/rides/new`

**What to Test:**
- [ ] Fields: Date (defaults to today), Pickup Location, Dropoff Location, Fare, Notes
- [ ] If client has a default rate, the Fare field is pre-populated
- [ ] Submit with all required fields filled
- [ ] **Mock Payment Flow:**
  1. After saving, a toast appears: "Sending payment request to [Client Name]..."
  2. After ~2 seconds, a second toast appears: "Payment received from [Client Name]"
  3. Then redirected to the client detail page with the new ride in the history
- [ ] Submit via **Book Again** — pickup and dropoff are pre-filled from the previous ride

---

### Screen 8: Earnings

**URL:** `/dashboard/earnings`

**What to Test:**

**Period Tabs:**
- [ ] Tap **Today**, **This Week**, **This Month**, **All Time**
- [ ] Summary cards update for each period

**Summary Cards:**
- [ ] **Total Earnings** — sum of fares in the selected period
- [ ] **Total Rides** — count of rides in the selected period
- [ ] **Average Fare** — mean fare per ride
- [ ] **Top Client** — name of the highest-revenue client in the period

**Recent Rides List:**
- [ ] Shows recent rides with client name, date, and fare
- [ ] Tap a ride — navigates to that client's detail page

**Help Icon:**
- [ ] Tap the **?** icon — earnings help modal appears

---

### Screen 9: Profile

**URL:** `/dashboard/profile`

**What to Test:**
- [ ] Displays the user's name and email
- [ ] **Sign Out** button is visible
- [ ] Tap Sign Out — logged out and redirected to the login page
- [ ] Try to navigate to `/dashboard` while logged out — redirected to login

---

### Screen 10: Bottom Navigation Bar

**Visible on all `/dashboard/*` pages**

**What to Test:**
- [ ] Three tabs: **Clients** (home icon), **Earnings** (dollar icon), **Profile** (user icon)
- [ ] Active tab is highlighted with the primary color
- [ ] Tap each tab — navigates to the correct page
- [ ] Nav bar has a frosted glass appearance and stays fixed at the bottom

---

## Cross-Cutting Features to Verify

### Responsive Design
- [ ] Open on a mobile viewport (375px wide) — all content fits, no horizontal scroll
- [ ] Open on tablet (768px) — centered layout, max-width container
- [ ] All tap targets are at least 44px tall

### Toast Notifications
- [ ] Success toasts (green) appear after: creating a client, saving notes, deleting a client
- [ ] Info toasts (blue) appear after: creating a client (demo onboarding email)
- [ ] Payment toasts appear after: logging a ride (sending/received sequence)
- [ ] Toasts auto-dismiss after their duration

### Error Handling
- [ ] API errors show user-friendly messages (not raw error objects)
- [ ] Network errors show appropriate feedback
- [ ] 404 on invalid client IDs shows an error state

### Date Consistency
- [ ] Ride dates entered as "2026-05-11" display as "May 11, 2026" (not May 10)
- [ ] All dates are handled in UTC to prevent timezone drift

---

## Quick Smoke Test Checklist (5-Minute Version)

1. Login with test credentials
2. Verify dashboard shows 30 clients with ride counts
3. Search for "Kim" — three results appear
4. Search for "Cookie" — tap Cookie Lyon's card
5. Verify all her rides are from ice cream parlors with funny notes
6. Tap "Log Another Ride" — fare pre-fills to $25, save — watch payment toast sequence
7. Go to Earnings — verify "All Time" shows 125+ rides
8. Switch to "This Month" — data filters correctly
9. Go to Profile — tap Sign Out — confirms logout
10. Try accessing `/dashboard` while logged out — redirected to login

---

## Architecture Notes for Reviewers

- **API-First**: All data flows through `/api/*` route handlers with session-based auth checks
- **Ownership Scoping**: Every query is scoped to the authenticated user's `userId` — no cross-user data access
- **No External UI Libraries**: All toasts, modals, and animations are hand-built (zero UI dependency bloat)
- **Glassmorphic Design System**: Custom CSS variables in `globals.css` with backdrop-blur, gradients, and subtle shadows
- **UTC Date Handling**: `lib/dates.ts` provides `parseDateOnlyToUtcNoon` to prevent timezone-related off-by-one errors
