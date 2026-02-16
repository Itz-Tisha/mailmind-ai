//duplicate drafts

// const express = require('express');
// const router = express.Router();
// const { google } = require('googleapis');
// const jwt = require('jsonwebtoken');
// const { getOAuthClientFromJWT } = require('../utils/googleAuth');

// router.post('/generate-drafts', async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'No JWT token' });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     if (!decoded.googleRefreshToken) {
//       return res.status(401).json({ message: 'Google auth expired. Re-login.' });
//     }

//     const auth = getOAuthClientFromJWT(decoded);
//     const gmail = google.gmail({ version: 'v1', auth });

//     const emails = req.body.emails || [];

//     let created = 0;
//     let skipped = 0;

//     for (const email of emails) {
//       try {
//         if (
//           email.from.toLowerCase().includes('no-reply') ||
//           email.from.toLowerCase().includes('noreply')
//         ) {
//           skipped++;
//           continue;
//         }

//         const replyText = `
// Hi,

// Thank you for your email regarding "${email.subject}".

// I have received your message and will get back to you shortly.

// Best regards,
// ${decoded.name || 'Regards'}
//         `.trim();

//         const rawMessage = [
//           `To: ${email.from}`,
//           `Subject: Re: ${email.subject}`,
//           '',
//           replyText,
//         ].join('\n');

//         const encodedMessage = Buffer.from(rawMessage)
//           .toString('base64')
//           .replace(/\+/g, '-')
//           .replace(/\//g, '_')
//           .replace(/=+$/, '');

//         await gmail.users.drafts.create({
//           userId: 'me',
//           requestBody: {
//             message: { raw: encodedMessage },
//           },
//         });

//         created++;
//       } catch (innerErr) {
//         skipped++;
//       }
//     }

//     res.json({ success: true, created, skipped });

//   } catch (err) {
//     console.error('Draft generation fatal error:', err.message);
//     res.status(500).json({ error: 'Draft generation failed' });
//   }
// });

// module.exports = router;





//not worked , still make duplicate , just learn where u wrong.
// const express = require('express');
// const router = express.Router();
// const { google } = require('googleapis');
// const jwt = require('jsonwebtoken');
// const { getOAuthClientFromJWT } = require('../utils/googleAuth');

// /* ---------------- REPLY GENERATOR ---------------- */

// function generateReply(email, userName = 'Regards') {
//   const subject = (email.subject || '').toLowerCase();
//   const body = (email.snippet || '').toLowerCase();

//   // ✅ Greeting / casual mails
//   if (
//     subject.includes('hi') ||
//     subject.includes('hello') ||
//     body.includes('how are you') ||
//     body.includes('hope you are')
//   ) {
//     return `
// Hi,

// I'm doing well, thank you for asking.
// Hope you're doing great too.

// Best regards,
// ${userName}
// `.trim();
//   }

//   if (subject.includes('seminar')) {
//     return `
// Hi,

// Thank you for the information regarding the seminar.
// I have noted the details and will review them.

// Regards,
// ${userName}
// `.trim();
//   }

//   if (subject.includes('assignment') || body.includes('deadline')) {
//     return `
// Hi,

// Thanks for informing me about the assignment.
// I will go through the requirements and take necessary action.

// Regards,
// ${userName}
// `.trim();
//   }

//   if (subject.includes('meeting')) {
//     return `
// Hi,

// Thank you for the meeting update.
// I have received the details and will be available accordingly.

// Regards,
// ${userName}
// `.trim();
//   }

//   // ✅ Polite fallback (less robotic)
//   return `
// Hi,

// Thank you for your message.
// I will get back to you soon.

// Regards,
// ${userName}
// `.trim();
// }

// /* ---------------- ROUTE ---------------- */

// router.post('/generate-drafts', async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'No JWT token' });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (!decoded.googleRefreshToken) {
//       return res.status(401).json({ message: 'Google auth expired. Re-login.' });
//     }

//     const auth = getOAuthClientFromJWT(decoded);
//     const gmail = google.gmail({ version: 'v1', auth });

//     const emails = req.body.emails || [];

//     let created = 0;
//     let skipped = 0;

//     for (const email of emails) {
//       try {
//         // ❌ Skip no-reply emails
//         if (
//           email.from?.toLowerCase().includes('no-reply') ||
//           email.from?.toLowerCase().includes('noreply')
//         ) {
//           skipped++;
//           continue;
//         }

//         // ✅ DUPLICATE CHECK (correct way)
//         const existingDraft = await gmail.users.messages.list({
//           userId: 'me',
//           q: `label:draft thread:${email.threadId}`,
//           maxResults: 1,
//         });

//         if (existingDraft.data.messages?.length) {
//           skipped++;
//           continue;
//         }

//         const replyText = generateReply(email, decoded.name);

//         const rawMessage = [
//           `To: ${email.from}`,
//           `Subject: Re: ${email.subject}`,
//           `In-Reply-To: ${email.messageId}`,
//           `References: ${email.messageId}`,
//           '',
//           replyText,
//         ].join('\n');

//         const encodedMessage = Buffer.from(rawMessage)
//           .toString('base64')
//           .replace(/\+/g, '-')
//           .replace(/\//g, '_')
//           .replace(/=+$/, '');

//         await gmail.users.drafts.create({
//           userId: 'me',
//           requestBody: {
//             message: {
//               raw: encodedMessage,
//               threadId: email.threadId,
//             },
//           },
//         });

//         created++;
//       } catch (err) {
//         console.error('Draft skipped:', err.message);
//         skipped++;
//       }
//     }

//     res.json({ success: true, created, skipped });
//   } catch (err) {
//     console.error('Draft generation fatal error:', err.message);
//     res.status(500).json({ error: 'Draft generation failed' });
//   }
// });

// module.exports = router;



//without duplicate
// const express = require('express');
// const router = express.Router();
// const { google } = require('googleapis');
// const jwt = require('jsonwebtoken');
// const { getOAuthClientFromJWT } = require('../utils/googleAuth');
// require('dotenv').config();

// const axios = require('axios');

// async function generateReply(email, userName = 'Regards') {
//   try {
//     const prompt = `
// You are a professional email assistant.

// Incoming email:
// From: ${email.from}
// Subject: ${email.subject}

// Body:
// ${email.snippet}

// Write a polite, professional reply.
// End with the sender name.
// `;

//     const response = await axios.post(
//       process.env.LLM_API_URL,
//       {
//         model: process.env.LLM_MODEL,
//         messages: [
//           { role: 'system', content: 'You write professional email replies.' },
//           { role: 'user', content: prompt }
//         ],
//         temperature: 0.3
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.LLM_API_KEY}`,
//           'Content-Type': 'application/json'
//         },
//         timeout: 15000
//       }
//     );

//     return response.data.choices[0].message.content.trim();
//   } catch (err) {
//     console.error('LLM failed, using fallback');

//     return `
// Hi,

// Thank you for your email.
// I have received your message and will respond shortly.

// Regards,
// ${userName}
// `.trim();
//   }
// }



// function normalizeEmail(email) {
//   // remove display name and lowercase
//   return email.replace(/.*<(.+)>/, '$1').trim().toLowerCase();
// }

// function normalizeSubject(subject) {
//   return subject.replace(/^(re:|fwd:)\s*/i, '').trim().toLowerCase();
// }

// router.post('/generate-drafts', async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'No JWT token' });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (!decoded.googleRefreshToken) return res.status(401).json({ message: 'Google auth expired' });

//     const auth = getOAuthClientFromJWT(decoded);
//     const gmail = google.gmail({ version: 'v1', auth });

//     const emails = req.body.emails || [];

//     let created = 0;
//     let skipped = 0;

//     // Track existing drafts
//     const draftKeys = new Set();
//     const draftThreadIds = new Set();

//     const draftsList = await gmail.users.drafts.list({ userId: 'me' });
//     const existingDrafts = draftsList.data.drafts || [];

//     for (const draft of existingDrafts) {
//       try {
//         const draftDetail = await gmail.users.drafts.get({ userId: 'me', id: draft.id });
//         const msg = draftDetail.data.message;
//         if (!msg) continue;

//         if (msg.threadId) draftThreadIds.add(msg.threadId);

//         const headers = msg.payload?.headers || [];
//         const to = headers.find(h => h.name.toLowerCase() === 'to')?.value || '';
//         const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';

//         const key = `${normalizeEmail(to)}|${normalizeSubject(subject)}`;
//         draftKeys.add(key);
//       } catch {}
//     }

//     for (const email of emails) {
//       try {
//         if (email.from?.toLowerCase().includes('no-reply')) {
//           skipped++;
//           continue;
//         }

//         // Skip if thread already has a draft
//         if (email.threadId && draftThreadIds.has(email.threadId)) {
//           skipped++;
//           continue;
//         }

//         const key = `${normalizeEmail(email.from)}|${normalizeSubject(email.subject)}`;
//         if (draftKeys.has(key)) {
//           skipped++;
//           continue;
//         }

//         // const replyText = generateReply(email, decoded.name);
//         const replyText = await generateReply(email, decoded.name);


//         const rawMessage = [
//           `To: ${email.from}`,
//           `Subject: Re: ${email.subject}`,
//           `In-Reply-To: ${email.messageId || ''}`,
//           `References: ${email.messageId || ''}`,
//           '',
//           replyText,
//         ].join('\n');

//         const encodedMessage = Buffer.from(rawMessage)
//           .toString('base64')
//           .replace(/\+/g, '-')
//           .replace(/\//g, '_')
//           .replace(/=+$/, '');

//         await gmail.users.drafts.create({
//           userId: 'me',
//           requestBody: { message: { raw: encodedMessage } },
//         });

//         draftKeys.add(key);
//         if (email.threadId) draftThreadIds.add(email.threadId);
//         created++;
//       } catch (err) {
//         skipped++;
//         console.error('Skipped:', email.subject, err.message);
//       }
//     }

//     res.json({ success: true, created, skipped });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Draft generation failed' });
//   }
// });


// module.exports = router;





// const express = require('express');
// const router = express.Router();
// const { google } = require('googleapis');
// const jwt = require('jsonwebtoken');
// const { getOAuthClientFromJWT } = require('../utils/googleAuth');
// require('dotenv').config();

// const axios = require('axios');

// async function generateReply(email, userName = 'Regards') {
//   try {
//     const prompt = `
// You are a professional email assistant.

// Incoming email:
// From: ${email.from}
// Subject: ${email.subject}

// Body:
// ${email.snippet}

// Write a polite, professional reply.
// End with the sender name.
// `;

//     const response = await axios.post(
//       process.env.LLM_API_URL,
//       {
//         model: process.env.LLM_MODEL,
//         messages: [
//           { role: 'system', content: 'You write professional email replies.' },
//           { role: 'user', content: prompt }
//         ],
//         stream: false
//       },
//       { timeout: 30000 }
//     );

//     return response.data.message.content.trim();
//   } catch (err) {
//     console.error('LLM failed, using fallback:', err.message);

//     return `
// Hi,

// Thank you for your email.
// I have received your message and will respond shortly.

// Regards,
// ${userName}
// `.trim();
//   }
// }

// function normalizeEmail(email) {
//   return email.replace(/.*<(.+)>/, '$1').trim().toLowerCase();
// }

// function normalizeSubject(subject) {
//   return subject.replace(/^(re:|fwd:)\s*/i, '').trim().toLowerCase();
// }

// router.post('/generate-drafts', async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'No JWT token' });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (!decoded.googleRefreshToken) return res.status(401).json({ message: 'Google auth expired' });

//     const auth = getOAuthClientFromJWT(decoded);
//     const gmail = google.gmail({ version: 'v1', auth });

//     const emails = req.body.emails || [];

//     let created = 0;
//     let skipped = 0;

//     const draftKeys = new Set();
//     const draftThreadIds = new Set();

//     const draftsList = await gmail.users.drafts.list({ userId: 'me' });
//     const existingDrafts = draftsList.data.drafts || [];

//     for (const draft of existingDrafts) {
//       try {
//         const draftDetail = await gmail.users.drafts.get({ userId: 'me', id: draft.id });
//         const msg = draftDetail.data.message;
//         if (!msg) continue;

//         if (msg.threadId) draftThreadIds.add(msg.threadId);

//         const headers = msg.payload?.headers || [];
//         const to = headers.find(h => h.name.toLowerCase() === 'to')?.value || '';
//         const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';

//         const key = `${normalizeEmail(to)}|${normalizeSubject(subject)}`;
//         draftKeys.add(key);
//       } catch {}
//     }
// const processedThreadIds = new Set();


// //changed below one
// //     for (const email of emails) {
// //       try {
// //         if (email.from?.toLowerCase().includes('no-reply')) {
// //           skipped++;
// //           continue;
// //         }
// //          if (processedThreadIds.has(email.threadId)) {
// //       skipped++;
// //       continue;
// //     }

// //         if (email.threadId && draftThreadIds.has(email.threadId)) {
// //           skipped++;
// //           continue;
// //         }

// //         const key = `${normalizeEmail(email.from)}|${normalizeSubject(email.subject)}`;
// //         if (draftKeys.has(key)) {
// //           skipped++;
// //           continue;
// //         }

// //         const replyText = await generateReply(email, decoded.name);

// //         const rawMessage = [
// //           `To: ${email.from}`,
// //           `Subject: Re: ${email.subject}`,
// //           `In-Reply-To: ${email.messageId || ''}`,
// //           `References: ${email.messageId || ''}`,
// //           '',
// //           replyText,
// //         ].join('\n');

// //         const encodedMessage = Buffer.from(rawMessage)
// //           .toString('base64')
// //           .replace(/\+/g, '-')
// //           .replace(/\//g, '_')
// //           .replace(/=+$/, '');

// //         await gmail.users.drafts.create({
// //           userId: 'me',
// //           requestBody: { message: { raw: encodedMessage, threadId: email.threadId, } },
// //         });
// // processedThreadIds.add(email.threadId);
// //         draftKeys.add(key);
// //         if (email.threadId) draftThreadIds.add(email.threadId);
// //         created++;
// //       } catch (err) {
// //         skipped++;
// //         console.error('Skipped:', email.subject, err.message);
// //       }
// //     }




// for (const email of emails) {
//   try {
//     if (!email.threadId) {
//       skipped++;
//       continue;
//     }

//     if (email.from?.toLowerCase().includes('no-reply')) {
//       skipped++;
//       continue;
//     }

//     // 🔒 HARD STOP duplicates (must be EARLY)
//     if (processedThreadIds.has(email.threadId)) {
//       skipped++;
//       continue;
//     }

//     // 🔥 ADD HERE — BEFORE async calls
//     processedThreadIds.add(email.threadId);

//     if (draftThreadIds.has(email.threadId)) {
//       skipped++;
//       continue;
//     }

//     const key = `${normalizeEmail(email.from)}|${normalizeSubject(email.subject)}`;
//     if (draftKeys.has(key)) {
//       skipped++;
//       continue;
//     }

//     const replyText = await generateReply(email, decoded.name);

//     const rawMessage = [
//       `To: ${email.from}`,
//       `Subject: Re: ${email.subject}`,
//       `In-Reply-To: ${email.messageId || ''}`,
//       `References: ${email.messageId || ''}`,
//       '',
//       replyText,
//     ].join('\n');

//     const encodedMessage = Buffer.from(rawMessage)
//       .toString('base64')
//       .replace(/\+/g, '-')
//       .replace(/\//g, '_')
//       .replace(/=+$/, '');

//     await gmail.users.drafts.create({
//       userId: 'me',
//       requestBody: {
//         message: {
//           raw: encodedMessage,
//           threadId: email.threadId,
//         },
//       },
//     });

//     draftKeys.add(key);
//     draftThreadIds.add(email.threadId);
//     created++;
//   } catch (err) {
//     skipped++;
//     console.error('Skipped:', email.subject, err.message);
//   }
// }


//     res.json({ success: true, created, skipped });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Draft generation failed' });
//   }
// });

// module.exports = router;





// const express = require('express');
// const router = express.Router();
// const { google } = require('googleapis');
// const jwt = require('jsonwebtoken');
// const { getOAuthClientFromJWT } = require('../utils/googleAuth');
// require('dotenv').config();

// const axios = require('axios');

// async function generateReply(email, userName = 'Regards') {
//   try {
//     const prompt = `
// You are a professional email assistant.

// Incoming email:
// From: ${email.from}
// Subject: ${email.subject}

// Body:
// ${email.snippet}

// Write a polite, professional reply.
// End with the sender name.
// `;

//     const response = await axios.post(
//       process.env.LLM_API_URL,
//       {
//         model: process.env.LLM_MODEL,
//         messages: [
//           { role: 'system', content: 'You write professional email replies.' },
//           { role: 'user', content: prompt }
//         ],
//         stream: false
//       },
//       { timeout: 30000 }
//     );

//     return response.data.message.content.trim();
//   } catch (err) {
//     console.error('LLM failed, using fallback:', err.message);

//     return `
// Hi,

// Thank you for your email.
// I have received your message and will respond shortly.

// Regards,
// ${userName}
// `.trim();
//   }
// }

// function normalizeEmail(email) {
//   return email.replace(/.*<(.+)>/, '$1').trim().toLowerCase();
// }

// function normalizeSubject(subject) {
//   return subject.replace(/^(re:|fwd:)\s*/i, '').trim().toLowerCase();
// }

// router.post('/generate-drafts', async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'No JWT token' });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (!decoded.googleRefreshToken) return res.status(401).json({ message: 'Google auth expired' });

//     const auth = getOAuthClientFromJWT(decoded);
//     const gmail = google.gmail({ version: 'v1', auth });

//     const emails = req.body.emails || [];

//     let created = 0;
//     let skipped = 0;

//     const draftKeys = new Set();
//     const draftThreadIds = new Set();

//     const draftsList = await gmail.users.drafts.list({ userId: 'me' });
//     const existingDrafts = draftsList.data.drafts || [];

//     for (const draft of existingDrafts) {
//       try {
//         const draftDetail = await gmail.users.drafts.get({ userId: 'me', id: draft.id });
//         const msg = draftDetail.data.message;
//         if (!msg) continue;

//         if (msg.threadId) draftThreadIds.add(msg.threadId);

//         const headers = msg.payload?.headers || [];
//         const to = headers.find(h => h.name.toLowerCase() === 'to')?.value || '';
//         const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';

//         const key = `${normalizeEmail(to)}|${normalizeSubject(subject)}`;
//         draftKeys.add(key);
//       } catch {}
//     }

//     for (const email of emails) {
//       try {
//         if (email.from?.toLowerCase().includes('no-reply')) {
//           skipped++;
//           continue;
//         }

//         if (email.threadId && draftThreadIds.has(email.threadId)) {
//           skipped++;
//           continue;
//         }

//         const key = `${normalizeEmail(email.from)}|${normalizeSubject(email.subject)}`;
//         if (draftKeys.has(key)) {
//           skipped++;
//           continue;
//         }

//         const replyText = await generateReply(email, decoded.name);

//         const rawMessage = [
//           `To: ${email.from}`,
//           `Subject: Re: ${email.subject}`,
//           `In-Reply-To: ${email.messageId || ''}`,
//           `References: ${email.messageId || ''}`,
//           '',
//           replyText,
//         ].join('\n');

//         const encodedMessage = Buffer.from(rawMessage)
//           .toString('base64')
//           .replace(/\+/g, '-')
//           .replace(/\//g, '_')
//           .replace(/=+$/, '');

//         await gmail.users.drafts.create({
//           userId: 'me',
//           requestBody: { message: { raw: encodedMessage } },
//         });

//         draftKeys.add(key);
//         if (email.threadId) draftThreadIds.add(email.threadId);
//         created++;
//       } catch (err) {
//         skipped++;
//         console.error('Skipped:', email.subject, err.message);
//       }
//     }

//     res.json({ success: true, created, skipped });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Draft generation failed' });
//   }
// });

// module.exports = router;  


//groq



// const express = require('express');
// const router = express.Router();
// const { google } = require('googleapis');
// const jwt = require('jsonwebtoken');
// const { getOAuthClientFromJWT } = require('../utils/googleAuth');
// require('dotenv').config();

// const axios = require('axios');

// async function generateReply(email, userName = 'Regards') {
//   try {
//     const prompt = `
// You are a professional email assistant.

// Incoming email:
// From: ${email.from}
// Subject: ${email.subject}

// Body:
// ${email.snippet}

// Write a polite, professional reply.
// End with the sender name.
// `;

//     const response = await axios.post(
//       process.env.LLM_API_URL,
//       {
//         model: process.env.LLM_MODEL,
//         messages: [
//           { role: 'system', content: 'You write professional email replies.' },
//           { role: 'user', content: prompt }
//         ],
//         stream: false
//       },
//       { timeout: 30000 }
//     );

//     return response.data.message.content.trim();
//   } catch (err) {
//     console.error('LLM failed, using fallback:', err.message);

//     return `
// Hi,

// Thank you for your email.
// I have received your message and will respond shortly.

// Regards,
// ${userName}
// `.trim();
//   }
// }

// function normalizeEmail(email) {
//   return email.replace(/.*<(.+)>/, '$1').trim().toLowerCase();
// }

// function normalizeSubject(subject) {
//   return subject.replace(/^(re:|fwd:)\s*/i, '').trim().toLowerCase();
// }

// router.post('/generate-drafts', async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'No JWT token' });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (!decoded.googleRefreshToken) return res.status(401).json({ message: 'Google auth expired' });

//     const auth = getOAuthClientFromJWT(decoded);
//     const gmail = google.gmail({ version: 'v1', auth });

//     const emails = req.body.emails || [];

//     let created = 0;
//     let skipped = 0;

//     const draftKeys = new Set();
//     const draftThreadIds = new Set();

//     const draftsList = await gmail.users.drafts.list({ userId: 'me' });
//     const existingDrafts = draftsList.data.drafts || [];

//     for (const draft of existingDrafts) {
//       try {
//         const draftDetail = await gmail.users.drafts.get({ userId: 'me', id: draft.id });
//         const msg = draftDetail.data.message;
//         if (!msg) continue;

//         if (msg.threadId) draftThreadIds.add(msg.threadId);

//         const headers = msg.payload?.headers || [];
//         const to = headers.find(h => h.name.toLowerCase() === 'to')?.value || '';
//         const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';

//         const key = `${normalizeEmail(to)}|${normalizeSubject(subject)}`;
//         draftKeys.add(key);
//       } catch {}
//     }

//     for (const email of emails) {
//       try {
//         if (email.from?.toLowerCase().includes('no-reply')) {
//           skipped++;
//           continue;
//         }

//         if (email.threadId && draftThreadIds.has(email.threadId)) {
//           skipped++;
//           continue;
//         }

//         const key = `${normalizeEmail(email.from)}|${normalizeSubject(email.subject)}`;
//         if (draftKeys.has(key)) {
//           skipped++;
//           continue;
//         }

//         const replyText = await generateReply(email, decoded.name);

//         const rawMessage = [
//           `To: ${email.from}`,
//           `Subject: Re: ${email.subject}`,
//           `In-Reply-To: ${email.messageId || ''}`,
//           `References: ${email.messageId || ''}`,
//           '',
//           replyText,
//         ].join('\n');

//         const encodedMessage = Buffer.from(rawMessage)
//           .toString('base64')
//           .replace(/\+/g, '-')
//           .replace(/\//g, '_')
//           .replace(/=+$/, '');

//         await gmail.users.drafts.create({
//           userId: 'me',
//           requestBody: { message: { raw: encodedMessage } },
//         });

//         draftKeys.add(key);
//         if (email.threadId) draftThreadIds.add(email.threadId);
//         created++;
//       } catch (err) {
//         skipped++;
//         console.error('Skipped:', email.subject, err.message);
//       }
//     }

//     res.json({ success: true, created, skipped });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Draft generation failed' });
//   }
// });

// module.exports = router;






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
