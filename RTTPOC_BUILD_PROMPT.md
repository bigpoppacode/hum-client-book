# RTTPOC: HUM Client Book - 48-Hour MVP Build

## Role
You are a senior full-stack developer specializing in Next.js 14 (App Router), React, and mobile-first responsive design. You build production-ready applications with clean architecture, accessible UI components, and MongoDB integration via Mongoose.

## Task
Build the **HUM Client Book** - a mobile-first, driver-facing CRM for professional rideshare drivers going independent. This is a 48-hour MVP that enables drivers to own and manage client relationships, log rides, track earnings, and gain visibility into their business.

### Target User
- Full-time professional rideshare driver completing 50+ trips per week
- On their phone between rides, often with 30-60 seconds to complete a task
- Managing 20-200+ clients
- Not technical - needs fast, one-handed, mobile-first workflows
- Running a small business, not hailing a car

### Problem Statement
Professional drivers lack a fast, mobile-friendly system to capture, organize, and leverage their client relationships. On Uber and Lyft, drivers have zero access to client data. Without owning these relationships, drivers cannot build repeat business, cannot operate independently, and have no visibility into who their most valuable clients are.

## Tools

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: NextAuth.js (Auth.js) with credentials provider
- **Styling**: Tailwind CSS (mobile-first responsive design)
- **Session Storage**: JWT sessions stored in cookies
- **Deployment Target**: Linode VPS with PM2 and NGINX (NOT Vercel)

### Key Technical Requirements
1. **Single Application**: Next.js runs as one Node app with co-located API routes in `app/api/`
2. **File-Based Routing**: App Router with server components
3. **Mobile-First Design**: All touch targets minimum 44px height/width
4. **Mongoose Connection**: Standard MongoDB Atlas cluster connection
5. **Production Build**: Must work with `npm run build` and `npm start` for PM2 deployment

## Process

### Phase 1: Project Setup & Configuration (30 minutes)

1. **Initialize Next.js 14 Project**
   ```bash
   npx create-next-app@14 hum-client-book
   cd hum-client-book
   ```
   - Select: TypeScript (Yes), Tailwind CSS (Yes), App Router (Yes)

2. **Install Dependencies**
   ```bash
   npm install mongoose next-auth@beta bcryptjs
   npm install -D @types/bcryptjs
   ```

3. **Environment Variables** (`.env.local`)
   ```
   MONGODB_URI=mongodb+srv://...
   NEXTAUTH_SECRET=<generate-random-secret>
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Mongoose Connection** (`lib/mongodb.ts`)
   - Create cached connection utility
   - Handle connection lifecycle
   - Export `connectDB()` function

5. **Project Structure**
   ```
   app/
   ├── api/
   │   ├── auth/
   │   │   └── [...nextauth]/
   │   │       └── route.ts
   │   ├── clients/
   │   │   ├── route.ts          # POST (create), GET (list/search/filter)
   │   │   └── [id]/
   │   │       └── route.ts      # GET, PATCH, DELETE
   │   └── rides/
   │       ├── route.ts          # POST (create), GET (list by client)
   │       └── [id]/
   │           └── route.ts      # GET, PATCH, DELETE
   ├── (auth)/
   │   ├── login/
   │   │   └── page.tsx
   │   └── register/
   │       └── page.tsx
   ├── dashboard/
   │   ├── layout.tsx            # Protected layout with bottom nav
   │   ├── page.tsx              # Client List (default home)
   │   ├── clients/
   │   │   ├── new/
   │   │   │   └── page.tsx      # Add Client Form
   │   │   └── [id]/
   │   │       └── page.tsx      # Client Detail View
   │   └── earnings/
   │       └── page.tsx          # Earnings Summary Dashboard
   ├── layout.tsx                # Root layout
   └── page.tsx                  # Landing/redirect
   
   components/
   ├── ClientCard.tsx
   ├── ClientForm.tsx
   ├── RideLogForm.tsx
   ├── SearchBar.tsx
   ├── FilterChips.tsx
   ├── BottomNav.tsx
   └── ui/                       # Reusable UI components
   
   lib/
   ├── mongodb.ts
   ├── auth.ts                   # NextAuth config
   └── utils.ts
   
   models/
   ├── User.ts
   ├── Client.ts
   └── Ride.ts
   ```

### Phase 2: Database Models (30 minutes)

**User Model** (`models/User.ts`)
```typescript
interface IUser {
  email: string;
  password: string; // bcrypt hashed
  name: string;
  createdAt: Date;
}
```

**Client Model** (`models/Client.ts`)
```typescript
interface IClient {
  userId: ObjectId;           // Reference to User
  name: string;               // Required
  phone: string;              // Required
  email?: string;             // Optional
  notes?: string;             // Optional
  tags: string[];             // Array of tags
  group: 'VIP' | 'Regular' | 'New';
  defaultRate?: number;       // Optional default fare rate
  createdAt: Date;
  updatedAt: Date;
}
```

**Ride Model** (`models/Ride.ts`)
```typescript
interface IRide {
  clientId: ObjectId;         // Reference to Client
  userId: ObjectId;           // Reference to User
  pickupLocation: string;
  dropoffLocation: string;
  fare: number;               // Currency amount
  date: Date;
  notes?: string;
  createdAt: Date;
}
```

**Indexes**:
- Client: `{ userId: 1, name: 1 }`, `{ userId: 1, phone: 1 }`
- Ride: `{ clientId: 1, date: -1 }`, `{ userId: 1, date: -1 }`

### Phase 3: Authentication (1 hour)

**NextAuth.js Configuration** (`lib/auth.ts`)
1. Credentials provider with email/password
2. JWT session strategy (stored in cookie)
3. Callbacks: `jwt()` and `session()` to attach user ID
4. Password verification with bcryptjs
5. Sign-in validation against User model

**API Route** (`app/api/auth/[...nextauth]/route.ts`)
- Export GET and POST handlers from NextAuth config

**Middleware** (`middleware.ts`)
- Protect all `/dashboard/*` routes
- Redirect unauthenticated users to `/login`

**Auth Pages**:
1. **Login Page** (`app/(auth)/login/page.tsx`)
   - Email and password fields (minimum 44px height)
   - "Login" button (minimum 44px height, fixed at bottom on mobile)
   - Link to registration page
   - Error message display (mobile-friendly)
   - Mobile-first responsive design

2. **Registration Page** (`app/(auth)/register/page.tsx`)
   - Name, email, password fields (minimum 44px height)
   - "Register" button (minimum 44px height, fixed at bottom on mobile)
   - Link to login page
   - Validation error messages
   - POST to `/api/auth/register` (custom endpoint for user creation)

**Registration API** (`app/api/auth/register/route.ts`)
- Validate email uniqueness
- Hash password with bcryptjs (10 rounds)
- Create User document
- Return success/error

### Phase 4: Feature 1 - Add Client Flow (1.5 hours)

**Add Client Page** (`app/dashboard/clients/new/page.tsx`)

**Form Fields** (all minimum 44px height):
- Name (required, text input)
- Phone (required, tel input with validation)
- Email (optional, email input)
- Notes (optional, textarea)
- Tags (multi-select or custom input, displayed as chips)
- Group (radio buttons or dropdown: VIP, Regular, New)

**Built-in Tags** (suggest these, allow custom):
- "Airport", "Business", "Medical", "Regular", "Late Night", "Weekend", "Long Distance", "Local"

**Empty State Guidance**:
"Add a new client. Required fields are marked with *. Everything can be edited later."

**Validation**:
- Name: required, 1-100 characters
- Phone: required, valid phone format (use basic regex or library)
- Email: optional, valid email format if provided
- Tags: optional array
- Group: required, must be one of the three enum values

**Save Button**:
- Fixed at bottom of viewport on mobile
- Minimum 44px height
- Primary color, clear "Save Client" text
- Loading state during submission

**API Endpoint** (`app/api/clients/route.ts` - POST)
- Authenticate user (extract userId from session)
- Validate required fields
- Create Client document with userId reference
- Return created client or validation errors

**Success Flow**:
- On successful save, redirect to Client Detail View (`/dashboard/clients/[id]`)
- Show success toast/message

### Phase 5: Feature 2 - Client List + Search + Filters (2 hours)

**Client List Page** (`app/dashboard/page.tsx`)

**Layout**:
1. **Search Bar** (top, minimum 44px height)
   - Search by name or phone number
   - Real-time filtering as user types
   - Clear button (X icon, minimum 44px touch target)

2. **Filter Controls** (below search bar)
   - Tag filters: tappable chips (minimum 44px height)
   - Group filters: VIP, Regular, New buttons (minimum 44px)
   - Active filters shown as removable chips above list
   - "Clear All Filters" button when filters active

3. **Sort Options** (dropdown or bottom sheet)
   - Newest First (default)
   - Most Rides
   - Alphabetical (A-Z)
   - Highest Revenue

4. **Client List** (scrollable)
   - Each client row shows:
     - Name (bold, large text)
     - Primary tag/group badge (colored chip)
     - Ride count (e.g., "12 rides")
     - Total revenue (e.g., "$1,240")
   - Tap row to open Client Detail View
   - Minimum 60px row height for easy tapping

5. **Add Client Button** (floating action button or fixed bottom)
   - Prominent, primary color
   - Minimum 56px diameter (FAB) or 44px height (button)
   - Icon + "Add Client" text
   - Links to `/dashboard/clients/new`

**Empty State**:
"No clients yet. Add your first client to get started."
- Show large icon
- Show "Add Client" button

**API Endpoint** (`app/api/clients/route.ts` - GET)
- Authenticate user
- Query parameters:
  - `search`: filter by name or phone (case-insensitive)
  - `tags`: array of tags to filter by
  - `group`: filter by group (VIP, Regular, New)
  - `sort`: newest, rides, alphabetical, revenue
- Aggregate rides data for each client (ride count, total revenue)
- Return array of clients with computed fields

**Client Card Component** (`components/ClientCard.tsx`)
- Reusable component for each list item
- Props: client data with computed ride count and revenue
- Mobile-optimized layout
- Tap handler to navigate to detail view

### Phase 6: Feature 3 - Client Detail View (2 hours)

**Client Detail Page** (`app/dashboard/clients/[id]/page.tsx`)

**Layout Sections**:

1. **Header**
   - Client name (large, bold)
   - Group badge (colored chip: VIP=gold, Regular=blue, New=green)
   - Edit button (minimum 44px, top-right)

2. **Contact Info Section**
   - Phone (large, tappable `tel:` link with phone icon, minimum 44px height)
   - Email (tappable `mailto:` link with email icon, minimum 44px height)
   - Both links styled as buttons for easy mobile tapping

3. **Tags Section**
   - Display tags as colored chips
   - "Edit Tags" button opens modal/sheet to add/remove tags
   - Each tag chip minimum 32px height with remove button (X)

4. **Insights Section** (2x2 grid of cards)
   - **Ride Frequency**: Computed from ride dates (e.g., "2/week", "1/month")
   - **Average Fare**: Mean fare across all rides (e.g., "$24.50")
   - **Total Spent**: Sum of all ride fares (e.g., "$1,200")
   - **Regularity Label**: 
     - "Very Regular" (2+ rides/week)
     - "Regular" (1+ ride/week)
     - "Occasional" (1-3 rides/month)
     - "New" (1-2 total rides)

5. **Driver Notes Section**
   - Editable textarea (minimum 44px height when empty)
   - "Save Notes" button (minimum 44px height)
   - Auto-save on blur or manual save button

6. **Preferences Section**
   - Group selector (dropdown or radio buttons)
   - Default Rate (optional number input for common fare, e.g., "$35")
   - Save button (minimum 44px height)

7. **Ride History Section**
   - Chronological list (newest first)
   - Each ride row shows:
     - Date (formatted: "Mar 15, 2026")
     - Pickup → Dropoff locations (truncated if long)
     - Fare amount (bold, e.g., "$28.50")
     - "Book Again" button (minimum 44px height)
   - Minimum 60px row height for easy tapping
   - Empty state: "No rides logged yet. Log the first ride to get started."

8. **Log Ride Button**
   - Prominent, fixed at bottom or floating
   - Minimum 56px height
   - Primary color
   - Links to ride log form with clientId pre-filled

**API Endpoints**:

**GET `/api/clients/[id]`**
- Authenticate user
- Fetch client by ID and userId (ensure ownership)
- Return 404 if not found or not owned by user

**PATCH `/api/clients/[id]`**
- Authenticate user
- Validate ownership
- Update fields: name, phone, email, notes, tags, group, defaultRate
- Return updated client

**GET `/api/rides?clientId=[id]`**
- Authenticate user
- Fetch all rides for client (sorted by date descending)
- Return array of rides

**Insights Computation** (do this in the page component or API):
- Ride Frequency: Calculate average days between rides, convert to rides/week or rides/month
- Average Fare: Sum of fares / ride count
- Total Spent: Sum of all fares
- Regularity: Based on ride frequency thresholds

### Phase 7: Feature 4 - Ride Logging (1.5 hours)

**Ride Log Form** (can be modal/sheet or separate page)

**Access Points**:
1. "Log Ride" button from Client Detail View (clientId pre-filled)
2. "Book Again" button from ride history (clientId + pickup/dropoff pre-filled)

**Form Fields** (all minimum 44px height):
- Pickup Location (text input, required)
- Dropoff Location (text input, required)
- Fare (currency input, required, e.g., `$25.00`)
- Date (date picker, defaults to today, required)
- Notes (textarea, optional)

**Save Button**:
- Fixed at bottom on mobile
- Minimum 44px height
- "Save Ride" text
- Loading state during submission

**API Endpoint** (`app/api/rides/route.ts` - POST)
- Authenticate user
- Validate required fields (clientId, pickupLocation, dropoffLocation, fare, date)
- Ensure client belongs to user (fetch client, verify userId)
- Create Ride document
- Return created ride

**Success Flow**:
- On successful save, redirect back to Client Detail View
- Show ride in ride history (updated list)
- Show success toast/message

**Component** (`components/RideLogForm.tsx`)
- Reusable form component
- Props: clientId (required), prefillData (optional for "Book Again")
- Form validation
- Submit handler

### Phase 8: Feature 5 - Quick Rebook ("Book Again") (30 minutes)

**Implementation**:
1. Each ride in Client Detail ride history has a "Book Again" button
2. On click, open Ride Log Form with:
   - `clientId` (from current client)
   - `pickupLocation` (from selected ride)
   - `dropoffLocation` (from selected ride)
   - `fare` (empty or from client's defaultRate if set)
   - `date` (today)
   - `notes` (empty)

3. Driver just updates fare, date, and optional notes, then saves

**UX Requirements**:
- Button must feel instant (no loading delay)
- Pre-filled data clearly visible
- Focus on fare field (most likely to change)
- "Book Again" button minimum 44px height

**Key Insight**: This is the core repeat-business action. Optimize for speed.

### Phase 9: Feature 6 - Earnings Summary Dashboard (1.5 hours)

**Earnings Page** (`app/dashboard/earnings/page.tsx`)

**Layout**:

1. **Time Period Selector** (top)
   - Tabs or dropdown: Today, This Week, This Month, All Time
   - Minimum 44px height for each tab/option

2. **Summary Cards** (grid layout, 2x2 on mobile)
   - **Total Earnings**: Sum of all fares in period (large, bold, e.g., "$1,240.50")
   - **Total Rides**: Count of rides in period (e.g., "48 rides")
   - **Average Fare**: Mean fare in period (e.g., "$25.84")
   - **Top Client**: Client with highest total revenue in period (name + amount)

3. **Earnings Chart** (optional for MVP, can be placeholder)
   - Line or bar chart showing earnings over time
   - Daily breakdown for "This Week"
   - Weekly breakdown for "This Month"
   - Use a lightweight chart library (e.g., recharts, chart.js)

4. **Recent Rides List**
   - Same format as Client Detail ride history
   - Shows rides for selected time period
   - Each row: date, client name, pickup → dropoff, fare
   - Tap to view client detail

5. **Bottom Navigation**
   - Tabs: Clients, Earnings (active), Profile (placeholder)
   - Minimum 56px height
   - Active tab highlighted

**API Endpoint** (`app/api/rides/summary` - GET)
- Authenticate user
- Query parameters: `period` (today, week, month, all)
- Calculate date range based on period
- Aggregate:
  - Total earnings (sum of fares)
  - Total rides (count)
  - Average fare
  - Top client (group by clientId, sum fares, sort, get top 1)
- Return summary object

**Computation**:
- Today: rides where `date >= startOfToday`
- This Week: rides where `date >= startOfWeek` (Monday)
- This Month: rides where `date >= startOfMonth`
- All Time: all rides

### Phase 10: Bottom Navigation & Layout (30 minutes)

**Bottom Navigation Component** (`components/BottomNav.tsx`)
- Fixed at bottom of viewport
- Minimum 56px height
- Three tabs:
  1. **Clients** (home icon) → `/dashboard`
  2. **Earnings** (dollar icon) → `/dashboard/earnings`
  3. **Profile** (user icon) → `/dashboard/profile` (placeholder for future)
- Active tab highlighted (different color/weight)
- Mobile-optimized spacing and touch targets

**Dashboard Layout** (`app/dashboard/layout.tsx`)
- Protected by middleware (requires authentication)
- Includes BottomNav component
- Renders children (page content)
- Max-width container for tablet/desktop (e.g., 640px centered)

### Phase 11: Mobile-First Styling & Accessibility (1 hour)

**Tailwind CSS Configuration** (`tailwind.config.ts`)
- Primary color palette (choose professional, readable colors)
- Font sizing optimized for mobile (minimum 16px for inputs to prevent zoom on iOS)
- Spacing scale for consistent touch targets

**Global Styles** (`app/globals.css`)
- Base styles for buttons, inputs, cards
- Touch target enforcement (44px minimum)
- Safe area insets for iOS notch/home bar
- Dark mode considerations (optional for MVP)

**Accessibility Checklist**:
- [ ] All interactive elements minimum 44px touch targets
- [ ] Form labels properly associated with inputs
- [ ] Error messages announced to screen readers
- [ ] Focus states visible on all interactive elements
- [ ] Color contrast meets WCAG AA standards (4.5:1 for text)
- [ ] Skip links for keyboard navigation
- [ ] Semantic HTML (buttons, links, headings)

**Mobile-Specific Optimizations**:
- Input fields:
  - `type="tel"` for phone numbers (brings up number pad)
  - `type="email"` for email (brings up email keyboard)
  - `inputmode="decimal"` for fare input
  - `autocomplete` attributes for name, email, phone
- Prevent zoom on input focus (font-size >= 16px)
- Use `touch-action` CSS where needed
- Optimize for one-handed use (important actions at bottom)
- Test on small screens (320px width) and large screens (428px+)

### Phase 12: Testing & Refinement (1 hour)

**Manual Testing Checklist**:
1. **Authentication Flow**
   - [ ] Register new user
   - [ ] Login with registered user
   - [ ] Protected routes redirect when not logged in
   - [ ] Logout functionality

2. **Add Client Flow**
   - [ ] Add client with all fields (< 30 seconds)
   - [ ] Add client with only required fields
   - [ ] Validation errors display correctly
   - [ ] Redirect to Client Detail on success

3. **Client List**
   - [ ] Search by name works
   - [ ] Search by phone works
   - [ ] Filter by tags works
   - [ ] Filter by group works
   - [ ] Sort options work
   - [ ] Empty state displays correctly
   - [ ] Tap row navigates to Client Detail

4. **Client Detail**
   - [ ] All sections display correctly
   - [ ] Phone link opens dialer
   - [ ] Email link opens email app
   - [ ] Edit tags works
   - [ ] Update notes works
   - [ ] Insights compute correctly
   - [ ] Ride history displays correctly
   - [ ] Empty ride history shows empty state

5. **Ride Logging**
   - [ ] Log ride from Client Detail
   - [ ] All fields validate correctly
   - [ ] Date picker works
   - [ ] Fare input accepts currency
   - [ ] Redirect to Client Detail on success
   - [ ] Ride appears in ride history

6. **Quick Rebook**
   - [ ] "Book Again" pre-fills pickup and dropoff
   - [ ] Can update fare and save
   - [ ] New ride appears in history

7. **Earnings Dashboard**
   - [ ] Summary cards compute correctly
   - [ ] Time period filters work
   - [ ] Recent rides list displays
   - [ ] Top client displays correctly

8. **Mobile Responsiveness**
   - [ ] All touch targets are 44px+
   - [ ] Layout works on 320px width (iPhone SE)
   - [ ] Layout works on 428px width (iPhone 14 Pro Max)
   - [ ] No horizontal scroll
   - [ ] Bottom nav always visible
   - [ ] Fixed bottom buttons don't overlap content

**Edge Cases to Test**:
- Client with 0 rides (insights should handle gracefully)
- Client with 100+ rides (pagination needed? or just scroll?)
- Long client names (truncate with ellipsis)
- Long location names (truncate with ellipsis)
- Special characters in names/notes
- Empty search results
- All filters applied with no matches

**Performance**:
- [ ] Client list loads in < 2 seconds with 100 clients
- [ ] Search is instant (< 100ms filter time)
- [ ] API routes respond in < 500ms
- [ ] No unnecessary re-renders

### Phase 13: Production Deployment Prep (30 minutes)

**Environment Variables for Production**:
- `MONGODB_URI`: Production MongoDB Atlas connection string
- `NEXTAUTH_SECRET`: Strong random secret (use `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Production URL (e.g., `https://clientbook.humrides.com`)

**Build & Deploy Commands** (for Arthur's Linode):
```bash
# On Linode server
git clone <repo-url> hum-client-book
cd hum-client-book
npm install
npm run build
npm start  # or use PM2: pm2 start npm --name "hum-client-book" -- start
```

**PM2 Configuration** (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'hum-client-book',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

**NGINX Configuration** (reverse proxy):
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

**SSL Certificate** (Certbot):
```bash
sudo certbot --nginx -d clientbook.humrides.com
```

**Health Check Endpoint** (`app/api/health/route.ts`):
- Simple GET endpoint that returns `{ status: 'ok' }`
- Use for monitoring and load balancer checks

## Output

### Deliverables

1. **Complete Next.js 14 Application**
   - All files properly organized in App Router structure
   - TypeScript for type safety
   - Tailwind CSS for styling
   - Mongoose models with proper schemas and indexes

2. **Feature Implementation**
   - ✅ Authentication (registration + login)
   - ✅ Add Client Flow (< 30 seconds on mobile)
   - ✅ Client List + Search + Filters
   - ✅ Client Detail View (with insights)
   - ✅ Ride Logging
   - ✅ Quick Rebook ("Book Again")
   - ✅ Earnings Summary Dashboard

3. **API Routes** (all authenticated and protected)
   - `POST /api/auth/register` - User registration
   - `GET/POST /api/auth/[...nextauth]` - NextAuth.js handlers
   - `POST /api/clients` - Create client
   - `GET /api/clients` - List/search/filter clients
   - `GET /api/clients/[id]` - Get client by ID
   - `PATCH /api/clients/[id]` - Update client
   - `DELETE /api/clients/[id]` - Delete client
   - `POST /api/rides` - Create ride
   - `GET /api/rides` - List rides (with clientId filter)
   - `GET /api/rides/[id]` - Get ride by ID
   - `PATCH /api/rides/[id]` - Update ride
   - `DELETE /api/rides/[id]` - Delete ride
   - `GET /api/rides/summary` - Earnings summary with period filter
   - `GET /api/health` - Health check

4. **Documentation**
   - README.md with:
     - Project overview
     - Setup instructions
     - Environment variables
     - Development commands
     - Deployment instructions (for Linode)
     - API route documentation
   - Code comments for complex logic
   - Type definitions for all data structures

5. **Production-Ready Code**
   - No console errors or warnings
   - All TypeScript types properly defined
   - Error handling in all API routes
   - Loading states in all forms
   - Success/error messages for user feedback
   - Mobile-optimized and tested

### Code Quality Standards

**TypeScript**:
- Use explicit types for all function parameters and return values
- Define interfaces for all data models
- No `any` types (use `unknown` and type guards if needed)

**React/Next.js**:
- Use Server Components by default
- Client Components only when needed (`'use client'` directive)
- Proper data fetching patterns (Server Components for initial data, client for mutations)
- No prop drilling (use context or pass props 1-2 levels max)

**Mongoose**:
- Define schemas with proper types and validation
- Use indexes for frequently queried fields
- Handle connection errors gracefully

**Error Handling**:
- Try/catch in all async functions
- Return appropriate HTTP status codes (200, 201, 400, 401, 404, 500)
- User-friendly error messages on client
- Log errors server-side for debugging

**Performance**:
- Minimize client-side JavaScript
- Use Server Components for static content
- Optimize images (Next.js Image component)
- Lazy load components where appropriate

## Constraints

### Critical Requirements (Non-Negotiable)

1. **Mobile-First Design**
   - All touch targets MUST be minimum 44px height/width
   - Test on 320px width screens (iPhone SE)
   - One-handed operation for primary flows
   - Fixed bottom buttons for important actions

2. **Speed Requirements**
   - Add Client flow MUST complete in < 30 seconds
   - Search/filter MUST feel instant (< 100ms)
   - API routes MUST respond in < 500ms
   - No loading spinners for < 200ms operations

3. **Authentication**
   - All API routes MUST verify user authentication
   - All database queries MUST include userId filter (data isolation)
   - No user can access another user's data
   - JWT sessions in httpOnly cookies

4. **Data Ownership**
   - Every Client belongs to exactly one User
   - Every Ride belongs to exactly one Client and one User
   - All queries MUST enforce ownership (userId filter)

5. **Deployment Target**
   - MUST work with standard Node.js deployment (PM2 + NGINX)
   - NO Vercel-specific APIs or features
   - NO serverless-specific optimizations that break traditional hosting
   - Must run with `npm run build && npm start`

### Technical Constraints

1. **No Third-Party Services**
   - No Vercel, Netlify, or serverless platforms
   - No external authentication providers (Google, GitHub OAuth) - use credentials only
   - No payment processing (future feature)
   - No SMS/email services (future feature)

2. **Database**
   - MongoDB Atlas only (existing cluster)
   - Mongoose ODM required
   - No direct MongoDB driver usage
   - Schema validation at Mongoose level

3. **Styling**
   - Tailwind CSS only (no CSS modules, styled-components, etc.)
   - Mobile-first approach (design for 375px width, scale up)
   - Responsive breakpoints: sm (640px), md (768px), lg (1024px)

4. **Browser Support**
   - Modern mobile browsers (iOS Safari 15+, Chrome 90+)
   - No IE11 support needed
   - Progressive enhancement for older browsers

### Scope Limitations (Out of Scope for 48-Hour MVP)

❌ **Not Included**:
- User profile editing
- Password reset flow
- Email verification
- Social login (Google, Apple)
- Push notifications
- Real-time updates (WebSockets)
- Ride scheduling (future booking)
- Payment processing
- Invoice generation
- Client rating system
- Driver team management
- Admin panel
- Analytics beyond earnings summary
- Export data (CSV, PDF)
- Dark mode toggle
- Multi-language support
- Client photo upload
- GPS location tracking
- Ride navigation integration

✅ **Included** (MVP Only):
- Basic authentication (email/password)
- CRUD operations for clients
- CRUD operations for rides
- Search and filter clients
- Computed insights (ride frequency, average fare, etc.)
- Earnings summary by time period
- Mobile-first responsive design

### Business Constraints

1. **Target User Requirements**
   - MUST be usable in 30-60 second windows between rides
   - MUST work offline-first (future: for now, require internet)
   - MUST feel faster than pen and paper

2. **Core Value Proposition**
   - Drivers own their client relationships (data not trapped in platform)
   - Visibility into business metrics (who are top clients?)
   - Easy repeat booking (core differentiator from rideshare apps)

3. **Evaluation Context**
   - Code will be reviewed by evaluators (prioritize readability)
   - Clean architecture matters (file organization, component structure)
   - Production-ready code (no TODOs, no placeholder functions)

### Security Constraints

1. **Password Handling**
   - MUST use bcryptjs with 10+ rounds
   - NEVER store plain text passwords
   - NEVER log passwords

2. **Session Management**
   - JWT in httpOnly cookies only
   - No tokens in localStorage or sessionStorage
   - Expire sessions after reasonable time (e.g., 7 days)

3. **Input Validation**
   - Validate all user inputs server-side
   - Sanitize before database insertion
   - Prevent NoSQL injection (Mongoose helps with this)

4. **API Security**
   - No public API routes (except auth endpoints)
   - Rate limiting on auth routes (future: for now, basic protection)
   - CORS configured for production domain only

### Development Workflow Constraints

1. **Single Branch**
   - Build on `main` branch
   - No feature branches for 48-hour sprint
   - Commit frequently with clear messages

2. **No External Review**
   - Arthur will review after completion
   - Build first, iterate second
   - Prioritize working features over perfect code

3. **Time Allocation** (48 hours total)
   - Setup: 30 min
   - Models: 30 min
   - Auth: 1 hour
   - Add Client: 1.5 hours
   - Client List: 2 hours
   - Client Detail: 2 hours
   - Ride Logging: 1.5 hours
   - Quick Rebook: 30 min
   - Earnings: 1.5 hours
   - Bottom Nav: 30 min
   - Styling: 1 hour
   - Testing: 1 hour
   - Deployment Prep: 30 min
   - **Buffer: 1.5 hours** for unexpected issues

---

## Build Checklist

Before marking complete, verify:

- [ ] All 7 MVP features implemented and tested
- [ ] All API routes authenticated and protected
- [ ] All touch targets minimum 44px
- [ ] Mobile-responsive on 320px to 428px widths
- [ ] No console errors or warnings
- [ ] TypeScript compiles with no errors
- [ ] `npm run build` succeeds
- [ ] `npm start` runs production server
- [ ] README.md with setup and deployment instructions
- [ ] Environment variables documented
- [ ] Database indexes created
- [ ] Error messages are user-friendly
- [ ] Loading states on all async actions
- [ ] Empty states on all lists
- [ ] Success messages on all mutations
- [ ] Add Client flow completes in < 30 seconds
- [ ] Search/filter feels instant
- [ ] No horizontal scroll on mobile
- [ ] Bottom nav always visible
- [ ] Can log out and log back in
- [ ] Can add 50+ clients without performance issues

---

## Success Criteria

This MVP is successful when:

1. A professional rideshare driver can:
   - Sign up and log in in < 2 minutes
   - Add a new client in < 30 seconds (on their phone, between rides)
   - Find any client in < 10 seconds (search by name or phone)
   - Log a ride in < 20 seconds
   - Book a repeat ride in < 15 seconds (using "Book Again")
   - See their daily/weekly/monthly earnings in < 5 seconds

2. The application:
   - Loads fast (< 2 seconds initial load)
   - Feels responsive (no lag on interactions)
   - Works on their phone (iOS or Android, 2020+ device)
   - Doesn't crash or lose data
   - Protects their client information (can't see other drivers' data)

3. The code:
   - Is readable and well-organized
   - Can be understood by the next engineer
   - Can be deployed to Linode with standard tools (PM2, NGINX)
   - Has no obvious bugs or security issues
   - Meets the 48-hour timeline

**This is the foundation for a business, not just a demo. Build it right.**
