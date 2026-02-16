const express = require("express");
const router = express.Router();
const MailHistory = require("../models/MailHistory");
const Groq = require("groq-sdk");
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const { getOAuthClientFromJWT } = require("../utils/googleAuth");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/* ---------------- GENERATE ONLY ---------------- */

router.post("/generate", async (req, res) => {
  try {
    const { userId, to, subject, description } = req.body;

    let record = await MailHistory.findOne({ userId, recipient: to });

    let historyText = "";
    let sameSubjectCount = 0;

    if (record && record.history.length) {
      historyText = record.history
        .map(m => `Subject: ${m.subject}\nBody: ${m.body}`)
        .join("\n\n");

      sameSubjectCount = record.history.filter(
        h => h.subject === subject
      ).length;
    }

    let tone = "polite";

    if (sameSubjectCount === 1) tone = "reminder";
    if (sameSubjectCount === 2) tone = "firm";
    if (sameSubjectCount >= 3) tone = "strict";

    const prompt = `
You are a professional email assistant.

Recipient already knows the topic.

Email attempt number: ${sameSubjectCount + 1}
Tone level: ${tone}

TONE RULES:

polite:
friendly follow-up.

reminder:
short reminder.

firm:
direct and serious.

strict:
authoritative, deadline focused.

Previous emails:
${historyText || "None"}

RULES:
- Do NOT repeat full assignment details.
- No "I hope this email finds you well".
- Under 120 words.
- Change wording clearly every time.
- Match tone level.
- Ask for status or action.

Write email.

Subject: ${subject}
Details: ${description}

Return ONLY email body.
`;

    const completion = await groq.chat.completions.create({
      model: process.env.LLM_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    res.json({
      draft: completion.choices[0].message.content.trim()
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Generation failed" });
  }
});

/* ---------------- SAVE TO GMAIL + DB ---------------- */

router.post("/save", async (req, res) => {
  try {
    const { userId, to, subject, draft } = req.body;

    /* ---- Gmail ---- */

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const auth = getOAuthClientFromJWT(decoded);
    const gmail = google.gmail({ version: "v1", auth });

    const raw = Buffer.from(
      `To: ${to}\nSubject: ${subject}\n\n${draft}`
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    await gmail.users.drafts.create({
      userId: "me",
      requestBody: {
        message: { raw }
      }
    });

    /* ---- Mongo ---- */

    let record = await MailHistory.findOne({ userId, recipient: to });

    if (!record) {
      record = new MailHistory({
        userId,
        recipient: to,
        history: []
      });
    }

    if (record.history.length >= 6) record.history.shift();

    record.history.push({
      subject,
      body: draft
    });

    await record.save();

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Save failed" });
  }
});

module.exports = router;
