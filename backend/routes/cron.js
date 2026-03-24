const express = require("express");
const router = express.Router();

const dailySummary = require("../cron/dailySummary");

router.get("/run-daily-report", async (req, res) => {
  try {
    if (req.query.key !== process.env.CRON_SECRET) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await dailySummary(); // ✅ YOUR FUNCTION NAME

    res.json({ success: true, message: "Daily summary executed" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;