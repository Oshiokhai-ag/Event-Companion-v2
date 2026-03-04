// scripts/seed.ts
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db, initDb } from '../src/db.ts';

async function seed() {
  initDb();

  console.log('[SEED] Clearing existing data...');
  db.exec(`
    DELETE FROM messages; DELETE FROM chat_threads; DELETE FROM reviews;
    DELETE FROM swipe_history; DELETE FROM blocks; DELETE FROM reports;
    DELETE FROM join_requests; DELETE FROM events; DELETE FROM users; DELETE FROM dismissed_events;
  `);

  const hash = await bcrypt.hash('password123', 10);

  // Helper: ISO string for a date N hours from now
  const future = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();
  const past   = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

  // ── Users ─────────────────────────────────────────────────────────────────────
  const addUser = db.prepare(`
    INSERT INTO users (id, email, name, password, bio, interests, lat, lng,
                       phone_verified, average_rating, review_count, profile_photo_url)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `);

  const users = [
    {
      id: uuidv4(), email: 'alex@companion.app', name: 'Alex Morgan',
      bio: 'Big Nolan fan. Looking for people who appreciate good cinema and great post-film discussions.',
      interests: '["Cinema & Film","Sci-Fi","Photography","Dining & Foodie"]',
      lat: 40.7128, lng: -74.0060, phone_verified: 1,
      avg: 4.9, reviews: 12,
      photo: 'https://api.dicebear.com/7.x/personas/svg?seed=alex',
    },
    {
      id: uuidv4(), email: 'jamie@companion.app', name: 'Jamie Chen',
      bio: 'Jazz enthusiast and weekend hiker. Always up for spontaneous adventures.',
      interests: '["Music Concerts","Hiking & Outdoors","Art & Museums","Board Games"]',
      lat: 40.7580, lng: -73.9855, phone_verified: 1,
      avg: 4.8, reviews: 23,
      photo: 'https://api.dicebear.com/7.x/personas/svg?seed=jamie',
    },
    {
      id: uuidv4(), email: 'sam@companion.app', name: 'Sam Rivera',
      bio: 'Foodie and travel lover. Working through every Michelin-starred restaurant in the city.',
      interests: '["Dining & Foodie","Travel","Photography","Comedy Shows"]',
      lat: 40.7282, lng: -73.7949, phone_verified: 0,
      avg: 4.5, reviews: 7,
      photo: 'https://api.dicebear.com/7.x/personas/svg?seed=sam',
    },
    {
      id: uuidv4(), email: 'priya@companion.app', name: 'Priya Nair',
      bio: 'Tech lead by day, yoga instructor by evening.',
      interests: '["Yoga & Fitness","Tech Talks","Book Club","Hiking & Outdoors"]',
      lat: 40.6892, lng: -74.0445, phone_verified: 1,
      avg: 5.0, reviews: 4,
      photo: 'https://api.dicebear.com/7.x/personas/svg?seed=priya',
    },
    {
      id: uuidv4(), email: 'demo@companion.app', name: 'Demo User',
      bio: 'Test account for the seeker flow.',
      interests: '["Cinema & Film","Music Concerts","Dining & Foodie"]',
      lat: 40.7128, lng: -74.0060, phone_verified: 0,
      avg: 0, reviews: 0,
      photo: 'https://api.dicebear.com/7.x/personas/svg?seed=demo',
    },
  ];

  for (const u of users) {
    addUser.run(u.id, u.email, u.name, hash, u.bio, u.interests,
                u.lat, u.lng, u.phone_verified, u.avg, u.reviews, u.photo);
    console.log(`[SEED] User: ${u.name} (id ${u.id})`);
  }

  const alexId = users[0].id;
  const jamieId = users[1].id;
  const samId = users[2].id;
  const priyaId = users[3].id;
  const demoId = users[4].id;

  // ── Events ────────────────────────────────────────────────────────────────────
  const addEvent = db.prepare(`
    INSERT INTO events (id, organizer_id, title, event_type, cover_photos,
                        date_time, general_area, lat, lng, description, max_companions)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
  `);

  const eventDefs = [
    {
      id: uuidv4(), org: jamieId, title: 'Friday Night Jazz at The Blue Note',
      type: 'Music Concerts',
      photos: '["https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800"]',
      dt: future(8), general: 'West Village, NY',
      lat: 40.7306, lng: -74.0022,
      desc: 'Quartet plays Coltrane and Miles. Grab drinks before, discuss after. Looking for 1 companion who knows their jazz.',
      max: 1,
    },
    {
      id: uuidv4(), org: alexId, title: 'Dune: Part Two — 4K Screening + Discussion',
      type: 'Cinema & Film',
      photos: '["https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800"]',
      dt: future(28), general: 'Upper West Side, NY',
      lat: 40.7831, lng: -73.9812,
      desc: 'Catching the 4K re-release. Looking for someone who wants to deep-dive the Villeneuve cinematography after. Coffee on me.',
      max: 2,
    },
    {
      id: uuidv4(), org: priyaId, title: 'Sunday Hike — Breakneck Ridge',
      type: 'Hiking & Outdoors',
      photos: '["https://images.unsplash.com/photo-1551632811-561732d1e306?w=800"]',
      dt: future(52), general: 'Hudson Valley, NY',
      lat: 41.4418, lng: -73.9880,
      desc: 'Moderate 4-hour hike with incredible views. Leaving Grand Central 7:15am on Metro-North. Good fitness required.',
      max: 3,
    },
    {
      id: uuidv4(), org: samId, title: "Omakase at Chef's Counter — New Opening",
      type: 'Dining & Foodie',
      photos: '["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"]',
      dt: future(74), general: 'East Village, NY',
      lat: 40.7265, lng: -73.9815,
      desc: 'Scored a last-minute seat at a brand new 8-seat chef\'s counter. 12 courses. £180pp. One serious food lover only.',
      max: 1,
    },
    {
      id: uuidv4(), org: jamieId, title: 'Williamsburg Street Photography Walk',
      type: 'Photography',
      photos: '["https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=800"]',
      dt: future(102), general: 'Williamsburg, Brooklyn',
      lat: 40.7177, lng: -73.9563,
      desc: 'Casual 2-hour walk. Any camera welcome. Ends at a coffee shop to review shots.',
      max: 4,
    },
    {
      id: uuidv4(), org: priyaId, title: 'Yin Yoga + Breathwork Session',
      type: 'Yoga & Fitness',
      photos: '["https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800"]',
      dt: future(32), general: 'Flatiron, NY',
      lat: 40.7454, lng: -73.9878,
      desc: '90 minutes of deep yin poses + 20 minutes guided breathwork. Mats provided. Beginners welcome.',
      max: 2,
    },
  ];

  const eventIds: string[] = [];
  for (const e of eventDefs) {
    addEvent.run(e.id, e.org, e.title, e.type, e.photos, e.dt,
                 e.general, e.lat, e.lng, e.desc, e.max);
    console.log(`[SEED] Event: "${e.title}" (id ${e.id})`);
    eventIds.push(e.id);
  }

  // ── Pre-approved match: Alex ↔ Jamie's Jazz Night (to test chat immediately) ─
  const requestId = uuidv4();
  db.prepare(`
    INSERT INTO join_requests (id, event_id, requester_id, status, resolved_at)
    VALUES (?,?,?,'APPROVED',?)
  `).run(requestId, eventIds[0], alexId, past(2));

  const threadId = uuidv4();
  db.prepare(`
    INSERT INTO chat_threads (id, request_id, event_id, organizer_id, participant_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(threadId, requestId, eventIds[0], jamieId, alexId);

  const msgId1 = uuidv4();
  const msgId2 = uuidv4();
  const msgId3 = uuidv4();
  const msg = db.prepare('INSERT INTO messages (id, thread_id, sender_id, content, created_at) VALUES (?,?,?,?,?)');
  msg.run(msgId1, threadId, alexId,   "Hey Jamie! So excited for tonight — I'll be at the main entrance at 8:15.", past(1.5));
  msg.run(msgId2, threadId, jamieId,  "Perfect! I'll be wearing a charcoal jacket. All Coltrane tonight. 🎷",       past(1.4));
  msg.run(msgId3, threadId, alexId,   "Even better. See you there!",                                                 past(1.3));
  console.log(`[SEED] Chat (id ${threadId}) with 3 messages`);

  // ── One review (so Alex has a rating history visible on their profile) ─────────
  const reviewId = uuidv4();
  db.prepare(`
    INSERT INTO reviews (id, reviewer_id, reviewee_id, event_id, rating, review_text)
    VALUES (?,?,?,?,?,?)
  `).run(reviewId, jamieId, alexId, eventIds[0], 5, 'Alex was punctual, great conversation before and during the set. Would companion again.');
  db.prepare('UPDATE users SET average_rating=4.9, review_count=13 WHERE id=?').run(alexId);
  console.log('[SEED] Review added for Alex');

  console.log(`
═══════════════════════════════════════════════════════
✅  Database seeded — companion.db is ready
═══════════════════════════════════════════════════════

Test accounts  (all passwords: password123)
  alex@companion.app  — seeker, has a live chat with Jamie
  jamie@companion.app — organiser: Jazz Night + Photo Walk
  sam@companion.app   — organiser: Omakase Dinner
  priya@companion.app — organiser: Hike + Yoga
  demo@companion.app  — clean slate, no history

Full flow test:
  1. Sign in as demo@companion.app
  2. Swipe right on any event
  3. Sign out → sign in as that event's organiser
  4. My Events → approve the request
  5. Sign out → sign in as demo again → chat appears
═══════════════════════════════════════════════════════
`);
}

seed().catch(console.error);
