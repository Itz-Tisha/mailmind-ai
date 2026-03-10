const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');




const getBody = (payload) => {
  if (!payload) return '';

  // 1️⃣ Direct HTML body
  if (payload.mimeType === 'text/html' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }

  // 2️⃣ Multipart handling
  if (payload.parts) {
    let plainText = '';

    for (const part of payload.parts) {
      // Prefer HTML
      if (part.mimeType === 'text/html' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }

      // Fallback to plain text
      if (part.mimeType === 'text/plain' && part.body?.data) {
        plainText = Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }

    return plainText;
  }

  return '';
};




router.get('/emails', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No JWT' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.googleAccessToken || !decoded.googleRefreshToken) {
      return res.status(401).json({ message: 'Google auth expired' });
    }

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oAuth2Client.setCredentials({
      access_token: decoded.googleAccessToken,
      refresh_token: decoded.googleRefreshToken
    });

    // 🔄 Refresh access token
    try {
      const newTokens = await oAuth2Client.refreshAccessToken();
      oAuth2Client.setCredentials(newTokens.credentials);
    } catch (err) {
      return res.status(401).json({ message: 'Re-login required' });
    }

   
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // 📅 Date handling
    const { date } = req.query;

    let query = 'in:inbox';

    if (date) {
      const selectedDate = new Date(date);
      const nextDate = new Date(selectedDate);
      nextDate.setDate(selectedDate.getDate() + 1);

      const after = selectedDate.toISOString().split('T')[0];
      const before = nextDate.toISOString().split('T')[0];

      query += ` after:${after} before:${before}`;
    } else {
      // Default → today
      query += ' newer_than:1d';
    }

    const list = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 50
    });

    const messages = list.data.messages || [];
    if (!messages.length) {
      return res.json({ count: 0, emails: [] });
    }

    const emails = await Promise.all(
      messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id
        });

        const headers = detail.data.payload.headers;

        return {
          threadId: detail.data.threadId,   // ✅ ADD THIS
  subject: headers.find(h => h.name === 'Subject')?.value,
  from: headers.find(h => h.name === 'From')?.value,
  snippet: detail.data.snippet,
  body: getBody(detail.data.payload)
        };
      })
    );

    res.json({ count: emails.length, emails });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch emails' });
  }
});




module.exports = router;

