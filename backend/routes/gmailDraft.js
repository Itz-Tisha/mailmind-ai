




const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const { getOAuthClientFromJWT } = require('../utils/googleAuth');
require('dotenv').config();

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function generateReply(email, userName = 'Regards') {
  try {
    const prompt = `
You are a professional email assistant.

Incoming email:
From: ${email.from}
Subject: ${email.subject}

Body:
${email.snippet}

Write a polite, professional reply.
End with the sender name.
`;

    const completion = await groq.chat.completions.create({
      model: process.env.LLM_MODEL,
      messages: [
        { role: "system", content: "You write professional email replies." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    return completion.choices[0].message.content.trim();

  } catch (err) {
    console.error('LLM failed, using fallback:', err.message);

    return `
Hi,

Thank you for your email.
I have received your message and will respond shortly.

Regards,
${userName}
`.trim();
  }
}


function normalizeEmail(email) {
  return email.replace(/.*<(.+)>/, '$1').trim().toLowerCase();
}

function normalizeSubject(subject) {
  return subject.replace(/^(re:|fwd:)\s*/i, '').trim().toLowerCase();
}

router.post('/generate-drafts', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No JWT token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.googleRefreshToken) return res.status(401).json({ message: 'Google auth expired' });

    const auth = getOAuthClientFromJWT(decoded);
    const gmail = google.gmail({ version: 'v1', auth });

    const emails = req.body.emails || [];

    let created = 0;
    let skipped = 0;

    const draftKeys = new Set();
    const draftThreadIds = new Set();

    const draftsList = await gmail.users.drafts.list({ userId: 'me' });
    const existingDrafts = draftsList.data.drafts || [];

    for (const draft of existingDrafts) {
      try {
        const draftDetail = await gmail.users.drafts.get({ userId: 'me', id: draft.id });
        const msg = draftDetail.data.message;
        if (!msg) continue;

        if (msg.threadId) draftThreadIds.add(msg.threadId);

        const headers = msg.payload?.headers || [];
        const to = headers.find(h => h.name.toLowerCase() === 'to')?.value || '';
        const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';

        const key = `${normalizeEmail(to)}|${normalizeSubject(subject)}`;
        draftKeys.add(key);
      } catch {}
    }

    for (const email of emails) {
      try {
        if (email.from?.toLowerCase().includes('no-reply')) {
          skipped++;
          continue;
        }

        if (email.threadId && draftThreadIds.has(email.threadId)) {
          skipped++;
          continue;
        }

        const key = `${normalizeEmail(email.from)}|${normalizeSubject(email.subject)}`;
        if (draftKeys.has(key)) {
          skipped++;
          continue;
        }

        const replyText = await generateReply(email, decoded.name);

        const rawMessage = [
          `To: ${email.from}`,
          `Subject: Re: ${email.subject}`,
          `In-Reply-To: ${email.messageId || ''}`,
          `References: ${email.messageId || ''}`,
          '',
          replyText,
        ].join('\n');

        const encodedMessage = Buffer.from(rawMessage)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        await gmail.users.drafts.create({
          userId: 'me',
          requestBody: { message: { raw: encodedMessage } },
        });

        draftKeys.add(key);
        if (email.threadId) draftThreadIds.add(email.threadId);
        created++;
      } catch (err) {
        skipped++;
        console.error('Skipped:', email.subject, err.message);
      }
    }

    res.json({ success: true, created, skipped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Draft generation failed' });
  }
});

module.exports = router;
