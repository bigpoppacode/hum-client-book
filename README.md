# HUM Client Book

A mobile-first, driver-facing CRM for professional rideshare drivers going independent. Enables drivers to own and manage client relationships, log rides, track earnings, and gain visibility into their business.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: Auth.js (NextAuth v5) with Credentials provider, JWT sessions
- **Styling**: Tailwind CSS (mobile-first)
- **Deployment**: Linode VPS with PM2 + NGINX

## Features

- **Authentication** - Email/password registration and login with JWT sessions
- **Client Management** - Add, edit, delete clients with tags, groups, and notes
- **Search & Filter** - Real-time search by name/phone, filter by group/tags, sort by multiple criteria
- **Ride Logging** - Log rides with pickup/dropoff, fare, date, and notes
- **Book Again** - Quick rebook from ride history with pre-filled locations
- **Client Insights** - Ride frequency, average fare, total spent, regularity scoring
- **Earnings Dashboard** - Period-based summaries (today/week/month/all) with top client

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster

### Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | Random secret for JWT signing (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Application URL (e.g. `http://localhost:3000`) |

## API Routes

All routes except health, auth handlers, and register require authentication.

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | User registration |
| GET/POST | `/api/auth/[...nextauth]` | Auth.js handlers |
| POST | `/api/clients` | Create client |
| GET | `/api/clients` | List/search/filter clients |
| GET | `/api/clients/[id]` | Get client by ID |
| PATCH | `/api/clients/[id]` | Update client |
| DELETE | `/api/clients/[id]` | Delete client + rides |
| POST | `/api/rides` | Create ride |
| GET | `/api/rides` | List rides (filter by `clientId`) |
| GET | `/api/rides/[id]` | Get ride by ID |
| PATCH | `/api/rides/[id]` | Update ride |
| DELETE | `/api/rides/[id]` | Delete ride |
| GET | `/api/rides/summary` | Earnings summary (`period=today\|week\|month\|all`) |

## Deployment (Linode VPS)

### Build & Start

```bash
npm run build
npm start
# Or with PM2:
pm2 start ecosystem.config.js
```

### NGINX Reverse Proxy

```nginx
server {
    listen 80;
    server_name clientbook.humrides.com;

    location / {
        proxy_pass http://localhost:3000;
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

## Architecture Notes

- **Data isolation**: Every query filters by `userId` from the JWT session
- **Week start**: Monday (for earnings "This Week" period)
- **Timezone**: Server local timezone for date boundaries
- **Pagination**: MVP uses full list scroll; suitable for 50-200 clients
- **Database indexes**: Client `{userId, name}`, `{userId, phone}`; Ride `{clientId, date}`, `{userId, date}`
