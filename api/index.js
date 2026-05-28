const mongoose = require('mongoose');

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URL).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const app = require('../backend-project/server');

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
};
