import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import UserSession from '../models/UserSession.js';

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!uri) {
  console.error('Missing MONGO_URI in .env');
  process.exit(1);
}

await mongoose.connect(uri);

const users = await User.find({ deletedAt: null }).sort({ createdAt: -1 }).lean();
const sessionIds = users.map((u) => u.user_session_id).filter(Boolean);
const sessions = await UserSession.find({ user_session_id: { $in: sessionIds } }).lean();
const sMap = new Map(sessions.map((s) => [s.user_session_id, s]));

const rows = users.map((u) => {
  const s = sMap.get(u.user_session_id) || {};
  const loc = s.location || {};
  return {
    name: u.name || '',
    phone: u.isd_code ? `${u.isd_code}${u.phone || ''}` : (u.phone || ''),
    email: u.email || '',
    first_landing_url: s.first_landing_url || '',
    device: s.device_details || '',
    browser: s.browser_details || '',
    location: [loc.city, loc.region, loc.country].filter(Boolean).join(', '),
    sessions: s.count_of_sessions ?? '',
    created: u.createdAt ? new Date(u.createdAt).toISOString() : '',
  };
});

console.log(`\nTotal users: ${rows.length}\n`);
console.table(rows);

await mongoose.disconnect();
