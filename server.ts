import express from "express";
console.log("Starting Companion Server...");
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import path from "path";
import { OAuth2Client } from 'google-auth-library';
import { v2 as cloudinary } from 'cloudinary';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import db, { initDb } from "./src/db.ts";

// ─── Database Initialisation ─────────────────────────────────────────────────
let dbReady = false;

try {
  initDb();
  dbReady = true;
  console.log('[DB] Database initialised successfully.');
} catch (dbError) {
  console.error('[DB] ❌ Database initialisation failed:', dbError);
  console.error('[DB] API routes will return 503 until the issue is resolved.');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "companion-secret-key";
const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const feedLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 300, standardHeaders: true, validate: { xForwardedForHeader: false, forwardedHeader: false } });
const swipeLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 50, standardHeaders: true, validate: { xForwardedForHeader: false, forwardedHeader: false } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, validate: { xForwardedForHeader: false, forwardedHeader: false } });

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function startServer() {
  try {
    const app = express();
    app.set('trust proxy', 1);

    // ─── DB readiness middleware ──────────────────────────────────────────────────
    app.use('/api', (req, res, next) => {
      if (!dbReady) {
        return res.status(503).json({
          error: 'Database not available. Check server logs.',
          code: 'DB_NOT_READY',
        });
      }
      next();
    });

    const server = http.createServer(app);
    const wss = new WebSocketServer({ server });

    app.use(express.json());
  app.use('/api/auth', authLimiter);
  app.use('/api/feed', feedLimiter);
  app.use('/api/events/:id/swipe', swipeLimiter);

  // --- Auth Middleware ---
  const authenticate = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token" });
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // --- Auth Routes ---
  app.post("/api/auth/signup", async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    try {
      db.prepare("INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)").run(id, name, email, hashedPassword);
      const token = jwt.sign({ id, email, name }, JWT_SECRET);
      res.json({ token, user: { id, name, email } });
    } catch (err: any) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, profile_photo_url: user.profile_photo_url, interests: user.interests } });
  });

  app.post('/api/auth/google', async (req, res) => {
    const { credential } = req.body;
    try {
      if (!googleClient) {
        return res.status(501).json({ error: 'Google login not configured' });
      }
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload()!;
      const { email, name, picture, sub: googleId } = payload;

      let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      if (!user) {
        const id = uuidv4();
        db.prepare(`
          INSERT INTO users (id, email, name, profile_photo_url, google_id, phone_verified)
          VALUES (?, ?, ?, ?, ?, 0)
        `).run(id, email, name, picture, googleId);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      }

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
      const needsOnboarding = !user.interests || user.interests === '[]';
      res.json({ token, user, needsOnboarding });
    } catch (err) {
      res.status(401).json({ error: 'Invalid Google token' });
    }
  });

  // --- Profile Routes ---
  app.get("/api/profile", authenticate, (req: any, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    res.json(user);
  });

  app.put("/api/profile", authenticate, (req: any, res) => {
    const { name, bio, interests, profile_photo_url, location_city, lat, lng, discovery_radius, phone_verified } = req.body;
    db.prepare(`
      UPDATE users 
      SET name = ?, bio = ?, interests = ?, profile_photo_url = ?, location_city = ?, lat = ?, lng = ?, discovery_radius = ?, phone_verified = ?
      WHERE id = ?
    `).run(name, bio, JSON.stringify(interests), profile_photo_url, location_city, lat, lng, discovery_radius || 50, phone_verified ? 1 : 0, req.user.id);
    res.json({ success: true });
  });

  app.get('/api/upload-signature', authenticate, (req: any, res) => {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = `companion/${req.user.id}`;
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder, moderation: 'aws_rek' },
      process.env.CLOUDINARY_API_SECRET!
    );
    res.json({
      signature, timestamp, folder,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
    });
  });

  // --- Event Routes ---
  app.post("/api/events", authenticate, (req: any, res) => {
    const { title, event_type, cover_photos, date_time, lat, lng, general_area, description, max_companions } = req.body;
    const id = uuidv4();
    db.prepare(`
      INSERT INTO events (id, organizer_id, title, event_type, cover_photos, date_time, lat, lng, general_area, description, max_companions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, title, event_type, JSON.stringify(cover_photos), date_time, lat, lng, general_area, description, max_companions);
    res.json({ id });
  });

  app.get("/api/feed", authenticate, (req: any, res) => {
    const userId = req.user.id;
    const user: any = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    
    const allEvents = db.prepare(`
      SELECT e.*, u.name as organizer_name, u.profile_photo_url as organizer_photo,
      (SELECT AVG(rating) FROM reviews WHERE reviewee_id = e.organizer_id) as avg_rating,
      (SELECT COUNT(*) FROM reviews WHERE reviewee_id = e.organizer_id) as review_count,
      (SELECT COUNT(*) FROM join_requests WHERE event_id = e.id AND status = 'APPROVED') as approved_count
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      WHERE e.organizer_id != ?
      AND e.status = 'ACTIVE'
      AND datetime(e.date_time) > datetime('now')
      AND e.id NOT IN (SELECT event_id FROM dismissed_events WHERE user_id = ?)
      AND e.id NOT IN (SELECT event_id FROM join_requests WHERE requester_id = ?)
      AND e.id NOT IN (SELECT event_id FROM swipe_history WHERE user_id = ? AND undone = 0)
      ORDER BY datetime(e.date_time) ASC
    `).all(userId, userId, userId, userId);
    
    // Filter by distance
    const radiusKm = (user.discovery_radius || 50) * 1.60934;
    const nearbyEvents = allEvents.filter((event: any) => {
      if (!event.lat || !event.lng || !user.lat || !user.lng) return true;
      return haversineKm(user.lat, user.lng, event.lat, event.lng) <= radiusKm;
    });

    res.json(nearbyEvents.map((e: any) => ({
      ...e,
      cover_photos: JSON.parse(e.cover_photos || "[]")
    })));
  });

  // --- Background Jobs ---
  cron.schedule('0 * * * *', () => {
    const now = new Date().toISOString();
    console.log('[CRON] Running hourly maintenance...');
    
    // 1. Auto-expire JoinRequests (48h)
    db.prepare(`
      UPDATE join_requests 
      SET status = 'EXPIRED', resolved_at = ? 
      WHERE status = 'PENDING' 
      AND datetime(created_at) < datetime('now', '-48 hours')
    `).run(now);

    // 2. Auto-complete Events
    db.prepare(`
      UPDATE events 
      SET status = 'COMPLETED' 
      WHERE status = 'ACTIVE' 
      AND datetime(date_time) < datetime('now', '-1 hour')
    `).run();

    // 3. Auto-decline pending requests for completed events
    db.prepare(`
      UPDATE join_requests
      SET status = 'DECLINED', resolved_at = ?
      WHERE status = 'PENDING'
      AND event_id IN (SELECT id FROM events WHERE status = 'COMPLETED')
    `).run(now);
  });

  // --- Event Routes Refinements ---
  app.post("/api/events/:id/swipe", authenticate, (req: any, res) => {
    const { direction } = req.body;
    const eventId = req.params.id;
    const userId = req.user.id;

    // Record history
    db.prepare("INSERT INTO swipe_history (user_id, event_id, direction) VALUES (?, ?, ?)").run(userId, eventId, direction);

    if (direction === 'left') {
      db.prepare("INSERT INTO dismissed_events (user_id, event_id) VALUES (?, ?)").run(userId, eventId);
      return res.json({ success: true });
    } else {
      // Check capacity
      const event: any = db.prepare(`
        SELECT e.*, 
        (SELECT COUNT(*) FROM join_requests WHERE event_id = e.id AND status = 'APPROVED') as approved_count
        FROM events e WHERE id = ?
      `).get(eventId);

      if (event.approved_count >= event.max_companions) {
        const requestId = uuidv4();
        db.prepare("INSERT INTO join_requests (id, event_id, requester_id, status, resolved_at) VALUES (?, ?, ?, 'DECLINED', CURRENT_TIMESTAMP)").run(requestId, eventId, userId);
        return res.status(409).json({ error: "CAPACITY_FULL", message: "This event is now full!" });
      }

      const requestId = uuidv4();
      db.prepare("INSERT INTO join_requests (id, event_id, requester_id) VALUES (?, ?, ?)").run(requestId, eventId, userId);
      res.json({ success: true });
    }
  });

  app.delete('/api/swipes/undo', authenticate, (req: any, res) => {
    const userId = req.user.id;

    const lastSwipe = db.prepare(`
      SELECT * FROM swipe_history
      WHERE user_id = ? AND undone = 0
      AND datetime(swiped_at) > datetime('now', '-24 hours')
      ORDER BY swiped_at DESC LIMIT 1
    `).get(userId) as any;

    if (!lastSwipe) return res.status(404).json({ error: 'Nothing to undo' });

    db.prepare('UPDATE swipe_history SET undone = 1 WHERE id = ?').run(lastSwipe.id);

    if (lastSwipe.direction === 'left') {
      db.prepare("DELETE FROM dismissed_events WHERE user_id = ? AND event_id = ?").run(userId, lastSwipe.event_id);
    } else {
      db.prepare(`
        UPDATE join_requests SET status = 'CANCELLED', resolved_at = CURRENT_TIMESTAMP
        WHERE event_id = ? AND requester_id = ? AND status = 'PENDING'
      `).run(lastSwipe.event_id, userId);
    }

    const event: any = db.prepare(`
      SELECT e.*, u.name as organizer_name, u.profile_photo_url as organizer_photo,
      (SELECT AVG(rating) FROM reviews WHERE reviewee_id = e.organizer_id) as avg_rating,
      (SELECT COUNT(*) FROM reviews WHERE reviewee_id = e.organizer_id) as review_count,
      (SELECT COUNT(*) FROM join_requests WHERE event_id = e.id AND status = 'APPROVED') as approved_count
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      WHERE e.id = ?
    `).get(lastSwipe.event_id);

    res.json({ 
      restored_event: {
        ...event,
        cover_photos: JSON.parse(event.cover_photos || "[]")
      } 
    });
  });

  app.post("/api/events/:id/cancel", authenticate, (req: any, res) => {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event: any = db.prepare("SELECT * FROM events WHERE id = ?").get(eventId);
    if (event.organizer_id !== userId) return res.status(403).json({ error: "Unauthorized" });

    db.prepare("UPDATE events SET status = 'CANCELLED' WHERE id = ?").run(eventId);
    db.prepare("UPDATE join_requests SET status = 'CANCELLED', resolved_at = CURRENT_TIMESTAMP WHERE event_id = ? AND status = 'PENDING'").run(eventId);
    
    res.json({ success: true });
  });

  app.put("/api/events/:id", authenticate, (req: any, res) => {
    const eventId = req.params.id;
    const userId = req.user.id;
    const { title, event_type, date_time, general_area, description, max_companions } = req.body;

    const event: any = db.prepare("SELECT * FROM events WHERE id = ?").get(eventId);
    if (event.organizer_id !== userId) return res.status(403).json({ error: "Unauthorized" });

    const requestCount: any = db.prepare("SELECT COUNT(*) as count FROM join_requests WHERE event_id = ?").get(eventId);
    
    if (requestCount.count > 0) {
      // Only description and max_companions can be edited
      db.prepare(`
        UPDATE events 
        SET description = ?, max_companions = ?
        WHERE id = ?
      `).run(description, max_companions, eventId);
    } else {
      db.prepare(`
        UPDATE events 
        SET title = ?, event_type = ?, date_time = ?, general_area = ?, description = ?, max_companions = ?
        WHERE id = ?
      `).run(title, event_type, date_time, general_area, description, max_companions, eventId);
    }
    res.json({ success: true });
  });

  // --- Review Routes Refinements ---
  app.get("/api/users/:id/reviews", (req, res) => {
    const reviews = db.prepare(`
      SELECT r.*, u.name as reviewer_name, u.profile_photo_url as reviewer_photo
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.reviewee_id = ? AND r.is_visible = 1
      ORDER BY r.created_at DESC
      LIMIT 5
    `).all(req.params.id);
    res.json(reviews);
  });

  app.post("/api/events/:id/undo", authenticate, (req: any, res) => {
    const eventId = req.params.id;
    const userId = req.user.id;
    db.prepare("DELETE FROM dismissed_events WHERE user_id = ? AND event_id = ?").run(userId, eventId);
    db.prepare("DELETE FROM join_requests WHERE requester_id = ? AND event_id = ? AND status = 'PENDING'").run(userId, eventId);
    res.json({ success: true });
  });

  app.get("/api/my-requests", authenticate, (req: any, res) => {
    const requests = db.prepare(`
      SELECT r.*, e.title as event_title, u.name as organizer_name, u.profile_photo_url as organizer_photo
      FROM join_requests r
      JOIN events e ON r.event_id = e.id
      JOIN users u ON e.organizer_id = u.id
      WHERE r.requester_id = ? AND r.status = 'PENDING'
    `).all(req.user.id);
    res.json(requests);
  });

  app.post("/api/requests/:id/cancel", authenticate, (req: any, res) => {
    db.prepare("UPDATE join_requests SET status = 'CANCELLED', resolved_at = CURRENT_TIMESTAMP WHERE id = ? AND requester_id = ?").run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  // --- Organizer Routes ---
  app.get("/api/my-events", authenticate, (req: any, res) => {
    const events = db.prepare(`
      SELECT e.*, 
      (SELECT COUNT(*) FROM join_requests WHERE event_id = e.id AND status = 'PENDING') as pending_count,
      (SELECT COUNT(*) FROM join_requests WHERE event_id = e.id AND status = 'APPROVED') as approved_count
      FROM events e
      WHERE e.organizer_id = ?
      ORDER BY datetime(e.date_time) DESC
    `).all(req.user.id);
    res.json(events.map((e: any) => ({ ...e, cover_photos: JSON.parse(e.cover_photos || "[]") })));
  });

  app.get("/api/events/:id/requests", authenticate, (req: any, res) => {
    const requests = db.prepare(`
      SELECT r.*, u.name as requester_name, u.profile_photo_url as requester_photo, u.interests as requester_interests, u.phone_verified,
      (SELECT AVG(rating) FROM reviews WHERE reviewee_id = r.requester_id) as avg_rating
      FROM join_requests r
      JOIN users u ON r.requester_id = u.id
      WHERE r.event_id = ?
    `).all(req.params.id);
    res.json(requests.map((r: any) => ({ ...r, requester_interests: JSON.parse(r.requester_interests || "[]") })));
  });

  app.post("/api/requests/:id/resolve", authenticate, (req: any, res) => {
    const { status } = req.body; // 'APPROVED' or 'DECLINED'
    const requestId = req.params.id;
    
    db.prepare("UPDATE join_requests SET status = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, requestId);
    
    if (status === 'APPROVED') {
      const request: any = db.prepare("SELECT * FROM join_requests WHERE id = ?").get(requestId);
      const event: any = db.prepare("SELECT * FROM events WHERE id = ?").get(request.event_id);
      const threadId = uuidv4();
      db.prepare(`
        INSERT INTO chat_threads (id, request_id, event_id, organizer_id, participant_id)
        VALUES (?, ?, ?, ?, ?)
      `).run(threadId, requestId, event.id, event.organizer_id, request.requester_id);
    }
    
    res.json({ success: true });
  });

  app.get("/api/users/:id", (req, res) => {
    const user = db.prepare("SELECT id, name, profile_photo_url, bio, interests, location_city, phone_verified FROM users WHERE id = ?").get(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  // --- Chat Routes ---
  app.get("/api/chats", authenticate, (req: any, res) => {
    const threads = db.prepare(`
      SELECT t.*, e.title as event_title, e.status as event_status, e.date_time as event_date,
      u1.name as organizer_name, u1.profile_photo_url as organizer_photo,
      u2.name as participant_name, u2.profile_photo_url as participant_photo,
      (SELECT content FROM messages WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT created_at FROM messages WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1) as last_message_at
      FROM chat_threads t
      JOIN events e ON t.event_id = e.id
      JOIN users u1 ON t.organizer_id = u1.id
      JOIN users u2 ON t.participant_id = u2.id
      WHERE t.organizer_id = ? OR t.participant_id = ?
    `).all(req.user.id, req.user.id);
    res.json(threads);
  });

  app.get("/api/chats/:id/messages", authenticate, (req: any, res) => {
    const messages = db.prepare("SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC").all(req.params.id);
    res.json(messages);
  });

  // --- Review Routes ---
  app.post("/api/reviews", authenticate, (req: any, res) => {
    const { reviewee_id, event_id, rating, review_text } = req.body;
    const id = uuidv4();
    db.prepare(`
      INSERT INTO reviews (id, reviewer_id, reviewee_id, event_id, rating, review_text)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, reviewee_id, event_id, rating, review_text);
    res.json({ success: true });
  });

  // --- WebSocket Logic ---
  const clients = new Map<string, WebSocket>();

  wss.on("connection", (ws, req) => {
    let userId: string | null = null;

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      
      if (message.type === "auth") {
        try {
          const decoded: any = jwt.verify(message.token, JWT_SECRET);
          userId = decoded.id;
          if (userId) clients.set(userId, ws);
        } catch (e) {}
      }

      if (message.type === "chat_message" && userId) {
        const { threadId, content } = message;
        const msgId = uuidv4();
        db.prepare("INSERT INTO messages (id, thread_id, sender_id, content) VALUES (?, ?, ?, ?)").run(msgId, threadId, userId, content);
        
        const thread: any = db.prepare("SELECT * FROM chat_threads WHERE id = ?").get(threadId);
        const recipientId = thread.organizer_id === userId ? thread.participant_id : thread.organizer_id;
        
        const payload = JSON.stringify({
          type: "new_message",
          message: { id: msgId, thread_id: threadId, sender_id: userId, content, created_at: new Date().toISOString() }
        });

        ws.send(payload);
        const recipientWs = clients.get(recipientId);
        if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
          recipientWs.send(payload);
        }
      }
    });

    ws.on("close", () => {
      if (userId) clients.delete(userId);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite server...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => res.sendFile(path.resolve("dist/index.html")));
  }

    const PORT = 3000;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
console.log("Server initialization script finished.");
