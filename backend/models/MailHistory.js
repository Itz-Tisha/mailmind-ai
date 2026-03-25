const mongoose = require("mongoose");

const MailSchema = new mongoose.Schema({
  subject: String,
  body: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MailHistorySchema = new mongoose.Schema({
  userId: String,
  recipient: String,
  history: [MailSchema]
});

module.exports = mongoose.model("MailHistory", MailHistorySchema);
