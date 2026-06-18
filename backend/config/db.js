const mongoose = require("mongoose");
const dns = require("dns");

// ── Force IPv4 DNS resolution ─────────────────────────────────────────────────
// On Windows, Node.js queries IPv6 (AAAA) first. MongoDB Atlas has no IPv6
// addresses, so the AAAA lookup times out (~30-60 s) before falling back to
// IPv4. Setting ipv4first eliminates that silent timeout entirely.
dns.setDefaultResultOrder("ipv4first");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4, // IPv4 only — redundant safety net for dns setting above
      maxPoolSize: 10, // up to 10 concurrent DB connections
      serverSelectionTimeoutMS: 30000, // wait up to 30 s for Atlas to respond (safe for cold M0 start)
      socketTimeoutMS: 45000, // close idle sockets after 45 s
      heartbeatFrequencyMS: 10000, // check server health every 10 s (driver default — detects failures fast)
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    // ── Keep-alive ping ───────────────────────────────────────────────────────
    // Atlas M0 pauses after 60 min of no connections.
    // Pinging every 4 min keeps the cluster awake between requests.
    setInterval(
      async () => {
        try {
          await mongoose.connection.db.admin().ping();
        } catch (_) {
          // Mongoose reconnects automatically — silent failure is fine here
        }
      },
      4 * 60 * 1000,
    );
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
