const express = require("express");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
const { getOAuthClientFromJWT } = require("../utils/googleAuth");
require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ==========================================
   GENERATE THREAD REPLY (NO SAVE)
========================================== */

router.post("/generate-reply", async (req, res) => {
  console.log("BODY:", req.body);
  try {
    const { threadId } = req.body;
    if (!threadId) return res.status(400).json({ error: "Thread ID required" });

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const auth = getOAuthClientFromJWT(decoded);
    const gmail = google.gmail({ version: "v1", auth });

    const thread = await gmail.users.threads.get({
      userId: "me",
      id: threadId,
      format: "full",
    });

    const messages = thread.data.messages;
    if (!messages?.length) {
      return res.status(404).json({ error: "No messages found" });
    }

    const extractBody = (payload) => {
      if (!payload) return "";

      if (payload.parts) {
        for (let part of payload.parts) {
          if (part.mimeType === "text/plain" && part.body?.data) {
            return Buffer.from(part.body.data, "base64").toString("utf-8");
          }
        }
      }

      if (payload.body?.data) {
        return Buffer.from(payload.body.data, "base64").toString("utf-8");
      }

      return "";
    };

    let conversation = "";

    messages.forEach((msg, i) => {
      const headers = msg.payload.headers;
      const from = headers.find(h => h.name === "From")?.value || "";
      const subject = headers.find(h => h.name === "Subject")?.value || "";
      const body = extractBody(msg.payload);

      conversation += `
Message ${i + 1}
From: ${from}
Subject: ${subject}
Body:
${body}

---------------------
`;
    });

    const prompt = `
You are a professional email assistant.

${conversation}

Reply to the LAST message.
Keep it professional.
Max 150 words.
Only output reply body.
`;

    /* =========================
       GROQ CALL (REPLACED HERE)
    ========================== */

    const completion = await groq.chat.completions.create({
      model: process.env.LLM_MODEL,
      messages: [
        { role: "system", content: "You write professional email replies." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });

    const replyBody = completion.choices[0].message.content.trim();

    res.json({ success: true, reply: replyBody, threadId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Generation failed" });
  }
});

/* ==========================================
   SAVE DRAFT (ONLY WHEN USER CLICKS SAVE)
========================================== */

router.post("/save-draft", async (req, res) => {
  try {
    const { threadId, replyBody } = req.body;
    if (!threadId || !replyBody)
      return res.status(400).json({ error: "Missing data" });

    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const auth = getOAuthClientFromJWT(decoded);
    const gmail = google.gmail({ version: "v1", auth });

    const thread = await gmail.users.threads.get({
      userId: "me",
      id: threadId,
      format: "metadata",
    });

    const lastMessage = thread.data.messages.at(-1);
    const headers = lastMessage.payload.headers;

    const to = headers.find(h => h.name === "From")?.value || "";
    const subject = headers.find(h => h.name === "Subject")?.value || "";

    const rawMessage = Buffer.from(
`To: ${to}
Subject: Re: ${subject}

${replyBody}`
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.drafts.create({
      userId: "me",
      requestBody: {
        message: {
          raw: rawMessage,
          threadId
        }
      }
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Draft save failed" });
  }
});

module.exports = router;