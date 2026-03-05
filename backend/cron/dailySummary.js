// backend/cron/dailySummary.js
const cron = require('node-cron');
const User = require('../models/User');
const { google } = require('googleapis');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const sendMailWithAttachment = require('../services/sendWithGmail');
const Groq = require('groq-sdk');

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function decodeBase64Url(data) {
  if (!data) return '';
  try {
    const normalized = data.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(normalized, 'base64').toString('utf8');
  } catch {
    return '';
  }
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findBestBodyFromPayload(payload) {
  if (!payload) return '';

  const mimeType = payload.mimeType || '';
  const bodyData = payload?.body?.data;

  if (mimeType.startsWith('text/plain') && bodyData) {
    return decodeBase64Url(bodyData).trim();
  }

  if (mimeType.startsWith('text/html') && bodyData) {
    return stripHtml(decodeBase64Url(bodyData)).trim();
  }

  const parts = payload.parts || [];
  if (!Array.isArray(parts) || parts.length === 0) return '';

  // Prefer text/plain, then text/html, otherwise recurse
  for (const p of parts) {
    const t = p?.mimeType || '';
    if (t.startsWith('text/plain') && p?.body?.data) {
      const txt = decodeBase64Url(p.body.data).trim();
      if (txt) return txt;
    }
  }

  for (const p of parts) {
    const t = p?.mimeType || '';
    if (t.startsWith('text/html') && p?.body?.data) {
      const txt = stripHtml(decodeBase64Url(p.body.data)).trim();
      if (txt) return txt;
    }
  }

  for (const p of parts) {
    const txt = findBestBodyFromPayload(p);
    if (txt) return txt;
  }

  return '';
}

function startDailyReportCron() {
  cron.schedule('54 16 * * *', async () => {
    console.log('🤖 Running AI Daily Report Cron');

    const users = await User.find({
      googleRefreshToken: { $exists: true }
    });

    for (const user of users) {
      try {
        // 🔐 OAuth for Gmail
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({
          refresh_token: user.googleRefreshToken
        });

        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);

        const gmail = google.gmail({
          version: 'v1',
          auth: oauth2Client
        });

        // 📩 Fetch emails from last 1 day
        const list = await gmail.users.messages.list({
          userId: 'me',
          q: 'newer_than:1d',
          maxResults: 20
        });

        const messages = list.data.messages || [];
        if (!messages.length) continue;

        // Store email details for individual analysis
        const emailDetails = [];

        for (const msg of messages) {
          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'full'
          });

          const headers = detail.data.payload.headers;
          const subject = headers.find(h => h.name === 'Subject')?.value || '';
          const from = headers.find(h => h.name === 'From')?.value || '';
          const to = headers.find(h => h.name === 'To')?.value || '';
          const date = headers.find(h => h.name === 'Date')?.value || '';
          const snippet = detail.data.snippet || '';
          const body = findBestBodyFromPayload(detail.data.payload) || '';

          emailDetails.push({
            from,
            subject,
            to,
            date,
            snippet,
            body
          });
        }

        // 🧠 AI REPORT GENERATION USING GROQ - Analyze each email individually
        const emailText = emailDetails.map((email, index) => {
          const fullText = (email.body || email.snippet || '').replace(/\s+/g, ' ').trim();
          const clipped = fullText.length > 1800 ? `${fullText.slice(0, 1800)}...` : fullText;
          return `Email ${index + 1}:
From: ${email.from}
To: ${email.to}
Date: ${email.date}
Subject: ${email.subject}
Content: ${clipped}
-------------------------`
        }).join('\n\n');

        const prompt = `
You are an advanced email analyst.

Analyze each email individually and create a structured report in JSON format.

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no code blocks
2. Do NOT use emojis or special Unicode characters in the JSON
3. Use only plain ASCII text in all string fields
4. If an email subject contains emojis, remove them or replace with plain text
5. All string values must be valid JSON strings (properly escaped quotes)

Return ONLY valid JSON with this exact structure:

{
  "totalEmails": number,
  "emails": [
    {
      "index": number,
      "from": "sender email address",
      "subject": "email subject line without emojis",
      "summary": "short summary of this email in 2-3 sentences",
      "category": "Work"
    }
  ],
  "categories": {
    "Work": number,
    "Personal": number,
    "Finance": number,
    "Promotions": number,
    "Spam": number,
    "Other": number
  }
}

Category must be exactly one of: "Work", "Personal", "Finance", "Promotions", "Spam", "Other"
Index must match the Email number above (Email 1 => index 1, Email 2 => index 2, etc).

Emails to analyze:
${emailText}
`;

        let report = {};

        try {
          const completion = await groq.chat.completions.create({
            model: process.env.LLM_MODEL,
            messages: [
              { role: 'user', content: prompt }
            ],
            temperature: 0,
            response_format: { type: "json_object" }
          });

          const responseContent = completion.choices[0].message.content;
          
          // Clean up any potential JSON issues
          let cleanedContent = responseContent.trim();
          
          // Remove any leading/trailing markdown code blocks if present
          if (cleanedContent.startsWith('```json')) {
            cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanedContent.startsWith('```')) {
            cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }

          // Fix invalid Unicode escape sequences
          cleanedContent = cleanedContent.replace(/\\u\{([0-9A-Fa-f]+)\}/g, (match, hex) => {
            // Convert to valid JSON Unicode escape or remove if it's an emoji
            return '';
          });

          report = JSON.parse(cleanedContent);
        } catch (err) {
          console.error("AI JSON generation/parse failed for user:", user.email);
          
          // If Groq API error, try to extract JSON from error message
          if (err.message && err.message.includes('failed_generation')) {
            try {
              // The error message contains escaped JSON string
              // Extract the JSON string from the error message
              const errorStr = err.message;
              
              // Try to parse the error message as JSON to extract failed_generation
              let errorObj;
              try {
                // The error message might be in format: 400 {"error":{...}}
                const jsonMatch = errorStr.match(/\{.*\}/s);
                if (jsonMatch) {
                  errorObj = JSON.parse(jsonMatch[0]);
                }
              } catch (e) {
                // If direct parse fails, try manual extraction
              }
              
              if (errorObj && errorObj.error && errorObj.error.failed_generation) {
                let failedJson = errorObj.error.failed_generation;
                
                // Clean up invalid Unicode escapes before parsing
                failedJson = failedJson.replace(/\\u\{[0-9A-Fa-f]+\}/g, '');
                
                // Parse the cleaned JSON
                report = JSON.parse(failedJson);
                console.log("✅ Recovered JSON from error message");
              } else {
                // Fallback: manual extraction
                const startIdx = errorStr.indexOf('"failed_generation":"') + '"failed_generation":"'.length;
                const endIdx = errorStr.lastIndexOf('"}}');
                
                if (startIdx > 0 && endIdx > startIdx) {
                  let failedJson = errorStr.substring(startIdx, endIdx);
                  
                  // Unescape: \\n -> \n, \\" -> ", \\\\ -> \
                  failedJson = failedJson
                    .replace(/\\\\n/g, '\n')
                    .replace(/\\\\"/g, '"')
                    .replace(/\\\\u\{[0-9A-Fa-f]+\}/g, '') // Remove invalid Unicode escapes
                    .replace(/\\\\/g, '\\');
                  
                  report = JSON.parse(failedJson);
                  console.log("✅ Recovered JSON from error message (fallback)");
                } else {
                  console.error("Could not extract JSON from error");
                  continue;
                }
              }
            } catch (recoveryErr) {
              console.error("Could not recover JSON:", recoveryErr.message);
              continue;
            }
          } else {
            console.error("Error details:", err.message);
            continue;
          }
        }

        // 📄 Create PDF
        const filePath = path.join(
          __dirname,
          `../reports/report-${user._id}.pdf`
        );

        fs.mkdirSync(path.dirname(filePath), { recursive: true });

        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(fs.createWriteStream(filePath));

        // (Pie chart helper removed – no chart in the PDF now)

        // Title
        doc.fontSize(20).text('AI Daily Email Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Total Emails: ${report.totalEmails || 0}`, { align: 'center' });
        doc.moveDown(1);

        // Individual Email Reports
        if (report.emails && Array.isArray(report.emails)) {
          doc.fontSize(16).text('Individual Email Reports', { underline: true });
          doc.moveDown(0.5);

          report.emails.forEach((email, index) => {
            // Check if we need a new page
            if (doc.y > 650) {
              doc.addPage();
            }

            doc.fontSize(12).fillColor('#000000').text(`Email ${index + 1}:`, { continued: false });
            doc.moveDown(0.3);
            
            doc.fontSize(10).fillColor('#333333');
            doc.text(`From: ${email.from || 'N/A'}`, { indent: 10 });
            doc.text(`Subject: ${email.subject || 'N/A'}`, { indent: 10 });
            doc.moveDown(0.2);
            
            doc.fontSize(10).fillColor('#0066cc');
            doc.text(`Category: ${email.category || 'Other'}`, { indent: 10 });
            doc.moveDown(0.2);
            
            doc.fontSize(10).fillColor('#000000');
            doc.text(`Summary: ${email.summary || 'No summary available'}`, { 
              indent: 10,
              width: 500,
              align: 'left'
            });
            
            doc.moveDown(0.5);
            doc.strokeColor('#cccccc').lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);
          });
        }

        doc.end();

        // Wait for PDF to finish writing
        await new Promise(resolve => setTimeout(resolve, 1000));

        const fileContent = fs.readFileSync(filePath).toString('base64');

        // 📧 Send Email
        await sendMailWithAttachment({
          accessToken: credentials.access_token,
          to: user.email,
          subject: '🤖 Your AI Daily Email Report',
          text: 'Attached is your AI-generated report.',
          fileContent
        });

        fs.unlinkSync(filePath);

        console.log(`✅ AI Report sent to ${user.email}`);

      } catch (err) {
        console.error('🔥 FULL ERROR:', {
          message: err.message,
          stack: err.stack,
          response: err.response?.data
        });
      }
    }

  }, {
    timezone: 'Asia/Kolkata'
  });
}

module.exports = startDailyReportCron;