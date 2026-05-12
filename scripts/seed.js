const http = require("http");
const { URL } = require("url");

const BASE = "http://localhost:31912";
const EMAIL = "hum.test.driver.20260511.1748@example.com";
const PASSWORD = "TestPass123!";

function req(method, path, body, cookies) {
  return new Promise((resolve, reject) => {
    const u = new URL(path, BASE);
    const opts = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method,
      headers: {},
    };
    if (body) {
      if (typeof body === "string") {
        opts.headers["Content-Type"] = "application/x-www-form-urlencoded";
      } else {
        opts.headers["Content-Type"] = "application/json";
        body = JSON.stringify(body);
      }
    }
    if (cookies) opts.headers["Cookie"] = cookies;
    const r = http.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        const sc = (res.headers["set-cookie"] || [])
          .map((c) => c.split(";")[0]);
        resolve({ status: res.statusCode, body: d, cookies: sc, location: res.headers.location });
      });
    });
    r.on("error", reject);
    if (body) r.write(body);
    r.end();
  });
}

function mergeCookies(existing, newCookies) {
  const map = {};
  (existing || "").split("; ").filter(Boolean).forEach((c) => {
    const [k] = c.split("=");
    map[k] = c;
  });
  newCookies.forEach((c) => {
    const [k] = c.split("=");
    map[k] = c;
  });
  return Object.values(map).join("; ");
}

// DMX - "What These B***hes Want" full name roster (46 names, we use 30)
const CLIENTS = [
  { first: "Brenda",   last: "Johnson",    group: "VIP",     notes: "Day one. Always on time." },
  { first: "LaTisha",  last: "Williams",   group: "VIP",     notes: "Prefers the back seat, no small talk." },
  { first: "Linda",    last: "Davis",      group: "VIP",     notes: "Morning airport runs every Monday." },
  { first: "Felicia",  last: "Brown",      group: "Regular", notes: "Bye Felicia... nah she actually tips well." },
  { first: "Dawn",     last: "Martinez",   group: "Regular", notes: "Early bird, always needs a 5am pickup." },
  { first: "LeShaun",  last: "Jackson",    group: "VIP",     notes: "Corporate runs downtown. Big tipper." },
  { first: "Ines",     last: "Torres",     group: "Regular", notes: "Prefers quiet rides, no radio." },
  { first: "Alicia",   last: "Garcia",     group: "Regular", notes: "Works at the hospital, night shift pickups." },
  { first: "Theresa",  last: "Anderson",   group: "Regular", notes: "Church every Sunday, rain or shine." },
  { first: "Monica",   last: "Thompson",   group: "VIP",     notes: "Has three kids, always running late." },
  { first: "Sharron",  last: "White",      group: "Regular", notes: "Double r, she'll correct you." },
  { first: "Nicki",    last: "Harris",     group: "New",     notes: "Just started riding last week." },
  { first: "Lisa",     last: "Clark",      group: "Regular", notes: "Wants the scenic route every time." },
  { first: "Veronica", last: "Lewis",      group: "Regular", notes: "Business meetings in Midtown." },
  { first: "Karen",    last: "Robinson",   group: "New",     notes: "Will ask to speak to your manager." },
  { first: "Vicky",    last: "Walker",     group: "Regular", notes: "Quick runs to the grocery store." },
  { first: "Cookie",   last: "Lyon",       group: "VIP",     notes: "Met her at the ice cream parlor. Sweetest client on the roster." },
  { first: "Tonya",    last: "Young",      group: "Regular", notes: "Late night pickups from the lounge." },
  { first: "Dianne",   last: "Allen",      group: "New",     notes: "Referred by LaTisha." },
  { first: "Lori",     last: "King",       group: "Regular", notes: "Weekend shopping trips." },
  { first: "Carla",    last: "Wright",     group: "Regular", notes: "Likes R&B during the ride." },
  { first: "Marina",   last: "Scott",      group: "New",     notes: "Visiting from out of town." },
  { first: "Selena",   last: "Hill",       group: "Regular", notes: "Hair salon every other Saturday." },
  { first: "Katrina",  last: "Adams",      group: "New",     notes: "Night owl, only books after midnight." },
  { first: "Sabrina",  last: "Nelson",     group: "Regular", notes: "Gym at 6am, never misses." },
  { first: "Kim",      last: "Lee",        group: "VIP",     notes: "The first Kim. The original." },
  { first: "Kim",      last: "Chen",       group: "Regular", notes: "The second Kim. Unrelated to the first." },
  { first: "Kim",      last: "Park",       group: "New",     notes: "The third Kim. Yes, another one." },
  { first: "Latoya",   last: "Baker",      group: "Regular", notes: "Brunch crew leader." },
  { first: "Tina",     last: "Rodriguez",  group: "VIP",     notes: "Simply the best. Better than all the rest." },
];

const GROUPS = ["VIP", "Regular", "New"];
const TAG_POOL = ["Airport", "Business", "Medical", "Regular", "Late Night", "Weekend", "Long Distance", "Local"];

const PICKUPS = [
  "123 Main St", "456 Oak Ave", "789 Elm Blvd", "321 Pine Rd",
  "555 Broadway", "100 Park Ave", "200 Market St", "350 Vine St",
  "42 Sunset Blvd", "88 Lake Dr", "1200 Corporate Pkwy", "75 Harbor Way",
  "900 University Ave", "250 Mission St", "600 Grand Ave",
];

const DROPOFFS = [
  "JFK Terminal 4", "LaGuardia Airport", "Grand Central Station",
  "Penn Station", "Times Square", "Downtown Medical Center",
  "Midtown Office Tower", "Wall Street Financial", "Brooklyn Heights",
  "Harlem Hospital", "Columbia University", "Newark Airport Terminal B",
  "Central Park South", "Madison Square Garden", "World Trade Center",
];

const ICE_CREAM_SPOTS = [
  "Cones & Scoops Ice Cream Parlor",
  "Sweet Swirls Creamery",
  "Big Poppa's Ice Cream Shop",
  "Frozen Bliss Parlor",
  "The Waffle Cone Stand",
];

const COOKIE_DROPOFFS = [
  "Downtown Loft", "Midtown Studio", "Uptown Penthouse",
  "Brooklyn Brownstone", "Harlem Condo", "SoHo Gallery",
  "Chelsea Market", "West Village Apt", "Tribeca Spot",
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomTags() {
  const count = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...TAG_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomPhone() {
  const area = Math.floor(Math.random() * 900) + 100;
  const mid = Math.floor(Math.random() * 900) + 100;
  const end = Math.floor(Math.random() * 9000) + 1000;
  return `${area}-${mid}-${end}`;
}

function randomFare() {
  return Math.round((15 + Math.random() * 85) * 100) / 100;
}

function randomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d.toISOString().split("T")[0];
}

async function main() {
  console.log("1. Getting CSRF token...");
  const csrfRes = await req("GET", "/api/auth/csrf");
  let cookies = mergeCookies("", csrfRes.cookies);
  const { csrfToken } = JSON.parse(csrfRes.body);

  console.log("2. Signing in...");
  const loginBody = `csrfToken=${encodeURIComponent(csrfToken)}&email=${encodeURIComponent(EMAIL)}&password=${encodeURIComponent(PASSWORD)}`;
  const loginRes = await req("POST", "/api/auth/callback/credentials", loginBody, cookies);
  cookies = mergeCookies(cookies, loginRes.cookies);

  if (loginRes.location) {
    const cbRes = await req("GET", loginRes.location, null, cookies);
    cookies = mergeCookies(cookies, cbRes.cookies);
  }

  const sessionRes = await req("GET", "/api/auth/session", null, cookies);
  cookies = mergeCookies(cookies, sessionRes.cookies);
  const session = JSON.parse(sessionRes.body);

  if (!session || !session.user) {
    console.error("Login failed. Session:", sessionRes.body);
    process.exit(1);
  }
  console.log("   Logged in as:", session.user.email);

  // Delete existing clients first
  console.log("3. Deleting existing clients...");
  const existingRes = await req("GET", "/api/clients?sort=newest", null, cookies);
  if (existingRes.status === 200) {
    const existing = JSON.parse(existingRes.body);
    for (let i = 0; i < existing.length; i++) {
      await req("DELETE", `/api/clients/${existing[i]._id}`, null, cookies);
      process.stdout.write(`   Deleted ${i + 1}/${existing.length}\r`);
    }
    if (existing.length > 0) console.log(`\n   Deleted ${existing.length} old clients`);
    else console.log("   No existing clients to delete");
  }

  console.log("4. Creating 30 clients (DMX roster)...");
  const clientIds = [];
  const clientNames = [];
  const cookieIndex = CLIENTS.findIndex(c => c.first === "Cookie");

  for (let i = 0; i < CLIENTS.length; i++) {
    const c = CLIENTS[i];
    const name = `${c.first} ${c.last}`;
    const client = {
      name,
      phone: randomPhone(),
      email: `${c.first.toLowerCase().replace(/\s/g, "")}${c.last.toLowerCase()}@example.com`,
      group: c.group,
      tags: randomTags(),
      defaultRate: c.group === "VIP" ? Math.round((40 + Math.random() * 30) * 100) / 100
                 : Math.round((20 + Math.random() * 40) * 100) / 100,
      notes: c.notes,
    };

    if (c.first === "Cookie") {
      client.tags = ["Late Night", "Weekend", "Local"];
      client.defaultRate = 25;
    }

    const res = await req("POST", "/api/clients", client, cookies);
    if (res.status === 201) {
      const data = JSON.parse(res.body);
      clientIds.push(data._id);
      clientNames.push(name);
      process.stdout.write(`   Client ${i + 1}/30: ${name}                    \r`);
    } else {
      console.error(`\n   Failed to create ${name}:`, res.status, res.body);
      clientIds.push(null);
      clientNames.push(name);
    }
  }
  console.log(`\n   Created ${clientIds.filter(Boolean).length} clients`);

  console.log("5. Creating 125 rides...");
  let rideCount = 0;
  const ridesPerClient = [];

  for (let i = 0; i < CLIENTS.length; i++) {
    const group = CLIENTS[i].group;
    if (CLIENTS[i].first === "Cookie") {
      ridesPerClient.push(12); // Cookie gets lots of rides from the parlor
    } else if (group === "VIP") {
      ridesPerClient.push(Math.floor(Math.random() * 6) + 7);
    } else if (group === "Regular") {
      ridesPerClient.push(Math.floor(Math.random() * 4) + 2);
    } else {
      ridesPerClient.push(Math.floor(Math.random() * 2) + 1);
    }
  }

  let total = ridesPerClient.reduce((a, b) => a + b, 0);
  while (total < 125) {
    const idx = Math.floor(Math.random() * 20);
    if (clientIds[idx]) { ridesPerClient[idx]++; total++; }
  }
  while (total > 125) {
    const idx = Math.floor(Math.random() * CLIENTS.length);
    if (ridesPerClient[idx] > 1 && idx !== cookieIndex) {
      ridesPerClient[idx]--;
      total--;
    }
  }

  for (let i = 0; i < CLIENTS.length; i++) {
    if (!clientIds[i]) continue;

    const isCookie = CLIENTS[i].first === "Cookie";

    for (let j = 0; j < ridesPerClient[i]; j++) {
      let ride;

      if (isCookie) {
        ride = {
          clientId: clientIds[i],
          pickupLocation: randomFrom(ICE_CREAM_SPOTS),
          dropoffLocation: randomFrom(COOKIE_DROPOFFS),
          fare: Math.round((20 + Math.random() * 15) * 100) / 100,
          date: randomDate(90),
          notes: randomFrom([
            "Got a double scoop before the ride",
            "She brought me a waffle cone, no charge",
            "Rocky road kinda day",
            "Mint chocolate chip — her usual",
            "Brought the whole sundae in the car, no drips tho",
            "Said the butter pecan was calling her name",
            "Strawberry shortcake ice cream cake in the trunk",
            "She knows all the staff by name at this point",
            "Cookie brought cookies and cream, obviously",
            "Vanilla bean with sprinkles for the road",
            "Had to wait 10 min, the line was crazy",
            "She said she only came for the free samples",
          ]),
        };
      } else {
        ride = {
          clientId: clientIds[i],
          pickupLocation: randomFrom(PICKUPS),
          dropoffLocation: randomFrom(DROPOFFS),
          fare: randomFare(),
          date: randomDate(90),
          notes: Math.random() > 0.6 ? randomFrom([
            "Smooth ride", "Traffic delay", "Tipped well",
            "Express route", "Asked about Cookie",
            "Good conversation", "In a rush", "Played her own playlist",
            "Fell asleep in the back", "On the phone the whole time",
          ]) : undefined,
        };
      }

      const res = await req("POST", "/api/rides", ride, cookies);
      if (res.status === 201) {
        rideCount++;
        process.stdout.write(`   Ride ${rideCount}/125\r`);
      } else {
        console.error(`\n   Failed ride for ${clientNames[i]}:`, res.status);
      }
    }
  }

  console.log(`\n   Created ${rideCount} rides`);
  console.log("\n==========================================");
  console.log("  SEED COMPLETE — DMX ROSTER LOADED");
  console.log("==========================================");
  console.log(`  30 clients, ${rideCount} rides`);
  console.log(`  Login: ${EMAIL}`);
  console.log(`  Pass:  ${PASSWORD}`);
  console.log("\n  There was Brenda, LaTisha, Linda, Felicia...");
  console.log("  ...and Cookie (met her at the ice cream parlor)");
  console.log("  Plus three Kims. Yes, three.");
  console.log("==========================================");
}

main().catch(console.error);
