


// const express = require('express');
// const router = express.Router();
// const axios = require('axios');

// router.post('/extract-events', async (req, res) => {
//   try {
//     const { emails } = req.body;

//     if (!emails || emails.length === 0) {
//       return res.status(400).json({ error: 'No emails provided' });
//     }

//     const prompt = `
// You are an AI assistant.
// Extract calendar events from emails.

// Rules:
// - Return ONLY valid JSON
// - No explanation
// - No markdown
// - Use this format:

// [
//   {
//     "title": "Event title",
//     "date": "YYYY-MM-DD",
//     "time": "HH:MM or null",
//     "description": "Short description"
//   }
// ]

// Emails:
// ${emails.map(e => `
// From: ${e.from}
// Subject: ${e.subject}
// Body: ${e.snippet}
// `).join('\n')}
// `;

//     const response = await axios.post(
//       'http://localhost:11434/api/generate',
//       {
//         model: 'llama3',
//         prompt,
//         stream: false
//       },
//       { timeout: 60000 }
//     );

//     let output = response.data.response.trim();

//     // 🔒 SAFETY: Extract JSON only
//     const jsonStart = output.indexOf('[');
//     const jsonEnd = output.lastIndexOf(']') + 1;

//     if (jsonStart === -1 || jsonEnd === -1) {
//       throw new Error('Invalid JSON from LLaMA');
//     }

//     const events = JSON.parse(output.slice(jsonStart, jsonEnd));

//     res.json({ events });

//   } catch (err) {
//     console.error('Extract events error:', err.message);
//     res.status(500).json({
//       error: 'Failed to extract events',
//       details: err.message
//     });
//   }
// });

// module.exports = router;









// const express = require('express');
// const router = express.Router();
// const axios = require('axios');

// router.post('/extract-events', async (req, res) => {
//   try {
//     const { emails } = req.body;

//     if (!emails || emails.length === 0) {
//       return res.status(400).json({ error: 'No emails provided' });
//     }

//     // 🔹 LLaMA prompt
//     const prompt = `
// You are an AI assistant.
// Extract calendar events from emails.

// Rules:
// - Return ONLY valid JSON
// - No explanation
// - No markdown
// - Only include events that have a real date (YYYY-MM-DD) and/or time (HH:MM)
// - Use this format:

// [
//   {
//     "title": "Event title",
//     "date": "YYYY-MM-DD",
//     "time": "HH:MM or null",
//     "description": "Short description"
//   }
// ]

// Emails:
// ${emails.map(e => `
// From: ${e.from}
// Subject: ${e.subject}
// Body: ${e.snippet}
// `).join('\n')}
// `;

//     // 🔹 Call local LLaMA API
//     const response = await axios.post(
//       'http://localhost:11434/api/generate',
//       {
//         model: 'llama3',
//         prompt,
//         stream: false
//       },
//       { timeout: 60000 }
//     );

//     let output = response.data.response.trim();

//     // 🔹 Extract JSON from AI output
//     const jsonStart = output.indexOf('[');
//     const jsonEnd = output.lastIndexOf(']') + 1;

//     if (jsonStart === -1 || jsonEnd === -1) {
//       throw new Error('Invalid JSON from LLaMA');
//     }

//     let events = JSON.parse(output.slice(jsonStart, jsonEnd));

//     // 🔹 FILTER: Only keep events with a valid date
//     events = events.filter(e => e.date && e.date !== 'null' && e.date.trim() !== '');

//     res.json({ events });

//   } catch (err) {
//     console.error('Extract events error:', err.message);
//     res.status(500).json({
//       error: 'Failed to extract events',
//       details: err.message
//     });
//   }
// });

// module.exports = router;



// const express = require('express');
// const router = express.Router();
// const axios = require('axios');

// router.post('/extract-events', async (req, res) => {
//   try {
//     const { emails } = req.body;

//     if (!emails || emails.length === 0) {
//       return res.status(400).json({ error: 'No emails provided' });
//     }

//     // 🔹 Stronger AI instructions
//     const prompt = `
// You are an AI assistant.
// Extract calendar events from emails ONLY IF the email mentions a real date and/or time for an event.

// Rules:
// - Return ONLY valid JSON
// - No explanation, no markdown
// - Skip any email that does NOT contain an actual event date/time
// - Use this format ONLY:

// [
//   {
//     "title": "Event title",
//     "date": "YYYY-MM-DD",
//     "time": "HH:MM or null",
//     "description": "Short description"
//   }
// ]

// Emails:
// ${emails.map(e => `
// From: ${e.from}
// Subject: ${e.subject}
// Body: ${e.snippet}
// `).join('\n')}
// `;

//     const response = await axios.post(
//       'http://localhost:11434/api/generate',
//       {
//         model: 'llama3',
//         prompt,
//         stream: false
//       },
//       { timeout: 60000 }
//     );

//     let output = response.data.response.trim();

//     // 🔹 Extract JSON safely
//     const jsonStart = output.indexOf('[');
//     const jsonEnd = output.lastIndexOf(']') + 1;

//     if (jsonStart === -1 || jsonEnd === -1) {
//       throw new Error('Invalid JSON from LLaMA');
//     }

//     let events = JSON.parse(output.slice(jsonStart, jsonEnd));

//     // 🔹 FILTER: Only keep events with a valid date
//     events = events.filter(e => e.date && e.date !== 'null' && e.date.trim() !== '');

//     res.json({ events });

//   } catch (err) {
//     console.error('Extract events error:', err.message);
//     res.status(500).json({
//       error: 'Failed to extract events',
//       details: err.message
//     });
//   }
// });

// module.exports = router;





const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post('/extract-events', async (req, res) => {
  try {
    const { emails } = req.body;

    if (!emails || emails.length === 0) {
      return res.status(400).json({ error: 'No emails provided' });
    }

        const prompt = `
    You are an AI assistant.
    Extract calendar events from emails ONLY IF the email mentions a real date and/or time for an event.

    Rules:
    - Return ONLY valid JSON
    - No explanation, no markdown
    - Skip any email that does NOT contain an actual event date/time
    - Use this format ONLY:

    [
      {
        "title": "Event title",
        "date": "YYYY-MM-DD",
        "time": "HH:MM or null",
        "description": "Short description"
      }
    ]

    Emails:
${emails.map(e => `
From: ${e.from}
Subject: ${e.subject}
Body: ${e.snippet}
`).join('\n')}
`;

    const completion = await groq.chat.completions.create({
      model: process.env.LLM_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });

    let output = completion.choices[0].message.content.trim();

    const jsonStart = output.indexOf('[');
    const jsonEnd = output.lastIndexOf(']') + 1;

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('Invalid JSON from Groq');
    }

    let events = JSON.parse(output.slice(jsonStart, jsonEnd));

    events = events.filter(e => e.date && e.date !== 'null' && e.date.trim() !== '');

    res.json({ events });

  } catch (err) {
    console.error('Extract events error:', err.message);
    res.status(500).json({
      error: 'Failed to extract events',
      details: err.message
    });
  }
});

module.exports = router;
