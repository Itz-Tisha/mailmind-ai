const mongoose = require('mongoose');

const calendarFingerprintSchema = new mongoose.Schema(
  {
    fingerprint: {
      type: String,
      required: true,
      unique: true, // 🚀 Prevent duplicates at DB level
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 90, // ⏳ Auto delete after 90 days
    },
  },
  { timestamps: false }
);

// TTL index (MongoDB auto deletes after 90 days)
calendarFingerprintSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('CalendarFingerprint', calendarFingerprintSchema);