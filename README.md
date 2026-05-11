# HUM Client Book

A mobile-first CRM for professional rideshare drivers going independent. Built for drivers completing 50+ trips per week who need a fast, one-handed way to capture client relationships, log rides, track earnings, and build repeat business — all from their phone between rides.

## Why This Exists

On Uber and Lyft, drivers have zero access to client data. Every relationship built over thousands of rides is trapped inside the platform. HUM Client Book gives drivers ownership of their client relationships so they can operate independently, identify their most valuable clients, and grow repeat business.

## Features

### Authentication
Email/password registration and login with JWT sessions (7-day expiry). All data is isolated per user — no driver can see another driver's clients or rides.

### Client Management
Add, edit, and delete clients with structured data: name, phone, email, group classification (A/B/C/D), custom tags (Airport, Business, Medical, Late Night, etc.), default rate, and notes. The add-client flow is optimized to complete in under 30 seconds on mobile.

### Search, Filter & Sort
Real-time debounced search by name or phone number. Filter by group or tags. Sort by newest, most rides, alphabetical, or highest revenue. All powered by MongoDB aggregation with `$lookup` for ride stats.

### Client Detail & Insights
Full client profile with tappable `tel:` and `mailto:` links, editable notes and preferences, and a computed insights grid:
- **Ride Frequency** — average rides per week/month
- **Average Fare** — mean fare across all rides
- **Total Revenue** — lifetime earnings from this client
- **Regularity** — scored as Very Regular, Regular, Occasional, or New

### Ride Logging
Log rides with date, pickup/dropoff locations, fare, and notes. The form validates inputs and redirects back to the client detail on success.

### Book Again
One-tap rebook from any ride in the history. Pre-fills pickup and dropoff locations, defaults fare from the client's default rate, sets today's date, and focuses the fare field for quick adjustment.

### Earnings Dashboard
Period-based summaries (Today, This Week, This Month, All Time) with:
- Total earnings and ride count
- Average fare per ride
- Top client by revenue
- Recent rides list with links to client details

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | MongoDB Atlas + Mongoose ODM |
| Auth | Auth.js (NextAuth v5) — Credentials provider, JWT strategy |
| Styling | Tailwind CSS (mobile-first, glassmorphism design) |
| Runtime | Node.js 18+ |
| Deployment | Linode VPS with PM2 + NGINX |

## Project Structure

```
app/
├── (auth)/login/page.tsx          # Login page
├── (auth)/register/page.tsx       # Registration page
├── api/
│   ├── auth/[...nextauth]/        # NextAuth handlers
│   ├── auth/register/             # User registration
│   ├── clients/                   # POST create, GET list/search/filter
│   ├── clients/[id]/              # GET, PATCH, DELETE
│   ├── health/                    # Health check
│   ├── rides/                     # POST create, GET list
│   ├── rides/[id]/                # GET, PATCH, DELETE
│   └── rides/summary/             # Earnings aggregation
├── dashboard/
│   ├── page.tsx                   # Client list (home)
│   ├── layout.tsx                 # Protected layout + bottom nav
│   ├── clients/new/               # Add client
│   ├── clients/[id]/              # Client detail
│   ├── clients/[id]/edit/         # Edit client
│   ├── clients/[id]/rides/new/    # Log ride
│   ├── earnings/                  # Earnings dashboard
│   └── profile/                   # Profile + sign out
├── globals.css                    # Global styles + component classes
├── layout.tsx                     # Root layout
└── page.tsx                       # Root redirect

components/
├── BottomNav.tsx                  # 3-tab navigation (Clients, Earnings, Profile)
├── ClientCard.tsx                 # Client list item with group colors
├── ClientForm.tsx                 # Shared create/edit form
├── FilterChips.tsx                # Group + tag filter controls
├── Providers.tsx                  # SessionProvider wrapper
├── RideLogForm.tsx                # Ride logging form with prefill support
├── SearchBar.tsx                  # Debounced search input
└── Toast.tsx                      # Lightweight notification component

lib/
├── api-auth.ts                    # Shared API route auth helper
├── auth.config.ts                 # NextAuth route matcher config
├── auth.ts                        # NextAuth configuration
├── dates.ts                       # UTC date parsing utilities
├── insights.ts                    # Client insight computations
└── mongodb.ts                     # Cached Mongoose connection

models/
├── Client.ts                      # Client schema + indexes
├── Ride.ts                        # Ride schema + indexes
└── User.ts                        # User schema (bcrypt hashed passwords)
```

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (free tier works)

### Setup

```bash
git clone https://github.com/bigpoppacode/hum-client-book.git
cd hum-client-book
npm install
cp .env.example .env
```

Edit `.env` with your values:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hum-client-book
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:31912
AUTH_URL=http://localhost:31912
AUTH_TRUST_HOST=true
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production

```bash
npm run build
npm start
```

Runs on port **31912**.

## API Routes

All routes except health, auth handlers, and register require authentication. Every database query is scoped by `userId` from the JWT session.

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Health check — returns `{ status: "ok" }` |
| POST | `/api/auth/register` | Register with name, email, password |
| GET/POST | `/api/auth/[...nextauth]` | Auth.js session handlers |
| POST | `/api/clients` | Create client (name, phone, group required) |
| GET | `/api/clients` | List clients — supports `search`, `tags`, `group`, `sort` params |
| GET | `/api/clients/[id]` | Get client by ID (ownership verified) |
| PATCH | `/api/clients/[id]` | Update client fields |
| DELETE | `/api/clients/[id]` | Delete client and all associated rides |
| POST | `/api/rides` | Log a ride (client ownership verified) |
| GET | `/api/rides` | List rides — filter by `clientId` |
| GET | `/api/rides/[id]` | Get ride by ID |
| PATCH | `/api/rides/[id]` | Update ride |
| DELETE | `/api/rides/[id]` | Delete ride |
| GET | `/api/rides/summary` | Earnings summary — `period=today\|week\|month\|all` |

### Query Parameters

**GET /api/clients**
- `search` — case-insensitive name/phone search
- `tags` — repeated param to filter by tags (e.g. `?tags=Airport&tags=VIP`)
- `group` — filter by group (A, B, C, D)
- `sort` — `newest` (default), `alphabetical`, `rides`, `revenue`

**GET /api/rides/summary**
- `period` — `today`, `week` (Monday start), `month`, `all` (default)

## Deployment (Linode VPS)

### PM2

```bash
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### NGINX Reverse Proxy

```nginx
server {
    listen 80;
    server_name clientbook.humrides.com;

    location / {
        proxy_pass http://localhost:31912;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL

```bash
sudo certbot --nginx -d clientbook.humrides.com
```

## Database Indexes

| Collection | Index | Purpose |
|---|---|---|
| clients | `{ userId: 1, name: 1 }` | Scoped name lookups and search |
| clients | `{ userId: 1, phone: 1 }` | Scoped phone lookups |
| rides | `{ clientId: 1, date: -1 }` | Client ride history (newest first) |
| rides | `{ userId: 1, date: -1 }` | Earnings queries by date range |

## Architecture Notes

- **Data isolation**: Every query filters by `userId` from the JWT session — no driver can access another driver's data
- **Date handling**: All dates stored and compared as UTC to prevent timezone-shift bugs when displaying date-only values
- **Week start**: Monday (for earnings "This Week" calculations)
- **Insights**: Computed from pure functions in `lib/insights.ts` — no magic strings in UI components
- **Auth guard**: Shared `getAuthUserId()` helper in `lib/api-auth.ts` used by all protected API routes
- **Pagination**: MVP uses full list scroll, suitable for 50–200 clients

## License

Private — HUM Rides.
