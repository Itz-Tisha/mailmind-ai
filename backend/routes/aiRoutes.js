// const express = require('express');
// const router = express.Router();
// const axios = require('axios');

// router.post('/summarize', async (req, res) => {
//   try {
//     const { email } = req.body;

//     const prompt = `
// Summarize this email in 2–3 short lines.
// Do NOT add greetings.

// Email:
// From: ${email.from}
// Subject: ${email.subject}
// Body: ${email.snippet}
// `;

//     const response = await axios.post(
//       'http://localhost:11434/api/generate',
//       {
//         model: 'llama3',
//         prompt,
//         stream: false
//       }
//     );

//     res.json({ summary: response.data.response.trim() });

//   } catch (err) {
//     res.status(500).json({ error: 'Summarization failed' });
//   }
// });
// // router.post('/categorize', async (req, res) => {
// //   try {
// //     const { email } = req.body;

// //     if (!email) {
// //       return res.status(400).json({ error: 'Email is required' });
// //     }

// //     const prompt = `
// // You are an email classification system.

// // Return JSON with exactly these fields:
// // - category
// // - subcategory
// // - priority (High | Medium | Low)
// // - actionRequired (Yes | No)

// // Email:
// // From: ${email.from}
// // Subject: ${email.subject}
// // Body: ${email.snippet}
// // `;

// //     const response = await axios.post(
// //       'http://localhost:11434/api/generate',
// //       {
// //         model: 'llama3',
// //         prompt,
// //         stream: false,
// //         format: 'json'
// //       },
// //       { timeout: 60000 }
// //     );

// //     const parsed = response.data.response;

// //     // 🔥 LOG TO TERMINAL
// //     console.log('📩 Email Categorization Result:');
// //     console.log('Category:', parsed.category);
// //     console.log('Subcategory:', parsed.subcategory);
// //     console.log('Priority:', parsed.priority);
// //     console.log('Action Required:', parsed.actionRequired);
// //     console.log('-----------------------------');

// //     res.json({
// //       category: parsed.category ?? 'Unknown',
// //       subcategory: parsed.subcategory ?? 'General',
// //       priority: parsed.priority ?? 'Medium',
// //       actionRequired: parsed.actionRequired ?? 'No'
// //     });

// //   } catch (err) {
// //     console.error('❌ Categorize error:', err.response?.data || err.message);
// //     res.status(500).json({ error: 'Categorization failed' });
// //   }
// // });


// // router.post('/categorize', async (req, res) => {
// //   try {
// //     const { email } = req.body;

// //     if (!email) {
// //       return res.status(400).json({ error: 'Email is required' });
// //     }

// //     const prompt = `
// // You are an email classification system.

// // Return JSON with exactly these fields:
// // - category
// // - subcategory
// // - priority (High | Medium | Low)
// // - actionRequired (Yes | No)

// // Email:
// // From: ${email.from}
// // Subject: ${email.subject}
// // Body: ${email.snippet}
// // `;

// //     const response = await axios.post(
// //       'http://localhost:11434/api/generate',
// //       {
// //         model: 'llama3',
// //         prompt,
// //         stream: false,
// //         format: 'json'
// //       },
// //       { timeout: 60000 }
// //     );

// //     // ✅ PARSE JSON STRING
// //     const parsed = JSON.parse(response.data.response);

// //     // 🔥 LOG TO TERMINAL
// //     console.log('📩 Email Categorization Result:');
// //     console.log('Category:', parsed.category);
// //     console.log('Subcategory:', parsed.subcategory);
// //     console.log('Priority:', parsed.priority);
// //     console.log('Action Required:', parsed.actionRequired);
// //     console.log('-----------------------------');

// //     res.json({
// //       category: parsed.category ?? 'Unknown',
// //       subcategory: parsed.subcategory ?? 'General',
// //       priority: parsed.priority ?? 'Medium',
// //       actionRequired: parsed.actionRequired ?? 'No'
// //     });

// //   } catch (err) {
// //     console.error('❌ Categorize error:', err.response?.data || err.message);
// //     res.status(500).json({ error: 'Categorization failed' });
// //   }
// // });


// router.post('/categorize', async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ error: 'Email is required' });

//     const body = email.snippet || email.body || email.text || 'No email content provided';

// //     const prompt = `

// // You are an email classification system.

// // Return ONLY valid JSON.

// // {
// //   "category": "Work | Personal | Finance | Promotions | Spam | Other",
// //   "subcategory": "string",
// //   "priority": "High | Medium | Low",
// //   "actionRequired": "Yes | No"
// // }

// // Email:
// // From: ${email.from || 'Unknown'}
// // Subject: ${email.subject || 'No subject'}
// // Body: ${body}
// // `;


// const prompt = `
// You are an email classification system.

// Return ONLY valid JSON with the following schema:
// {
//   "category": "Work | Personal | Finance | Promotions | Spam | Other",
//   "subcategory": "string",
//   "priority": "High | Medium | Low",
//   "actionRequired": "Yes | No"
// }

// Instructions:
// - "Work" = emails related to professional tasks, meetings, projects
// - "Personal" = emails from friends or family
// - "Finance" = invoices, bills, bank notifications
// - "Promotions" = marketing emails, sales, offers
// - "Spam" = junk, phishing
// - "Other" = anything that doesn't fit above categories

// Examples:
// 1. Email: "Your invoice for January is ready." → {"category":"Finance","subcategory":"Invoice","priority":"Medium","actionRequired":"Yes"}
// 2. Email: "Don't miss our 50% off sale!" → {"category":"Promotions","subcategory":"Sale","priority":"High","actionRequired":"No"}

// Classify this email:

// From: ${email.from || 'Unknown'}
// Subject: ${email.subject || 'No subject'}
// Body: ${body}
// `;

//     // 🔥 Use codellama:instruct for reliable JSON
//     const response = await axios.post(
//       'http://localhost:11434/api/generate',
//       {
//         model: 'codellama:instruct',
//         prompt,
//         stream: false
//       },
//       { timeout: 60000 }
//     );

//     console.log('🧠 RAW:', response.data.response);

//     let parsed = {};
//     try {
//       parsed = JSON.parse(response.data.response);
//     } catch (err) {
//       console.error('❌ JSON parse error:', err.message);
//     }

//     console.log('📩 Email Categorization Result:', parsed);

//     res.json({
//       category: parsed.category || 'Unknown',
//       subcategory: parsed.subcategory || 'General',
//       priority: parsed.priority || 'Medium',
//       actionRequired: parsed.actionRequired || 'No'
//     });

//   } catch (err) {
//     console.error('❌ Categorize error:', err.message);
//     res.status(500).json({ error: 'Categorization failed' });
//   }
// });




// module.exports = router;













const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


router.post('/summarize', async (req, res) => {
  try {
    const { email } = req.body;

    const prompt = `
Summarize this email in 2–3 short lines.
Do NOT add greetings.

From: ${email.from}
Subject: ${email.subject}
Body: ${email.snippet}
`;

    const completion = await groq.chat.completions.create({
      model: process.env.LLM_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });

    res.json({
      summary: completion.choices[0].message.content.trim()
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Summarization failed' });
  }
});

// router.post('/categorize', async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ error: 'Email is required' });
//     }

//     const prompt = `
// You are an email classification system.

// Return JSON with exactly these fields:
// - category
// - subcategory
// - priority (High | Medium | Low)
// - actionRequired (Yes | No)

// Email:
// From: ${email.from}
// Subject: ${email.subject}
// Body: ${email.snippet}
// `;

//     const response = await axios.post(
//       'http://localhost:11434/api/generate',
//       {
//         model: 'llama3',
//         prompt,
//         stream: false,
//         format: 'json'
//       },
//       { timeout: 60000 }
//     );

//     const parsed = response.data.response;

//     // 🔥 LOG TO TERMINAL
//     console.log('📩 Email Categorization Result:');
//     console.log('Category:', parsed.category);
//     console.log('Subcategory:', parsed.subcategory);
//     console.log('Priority:', parsed.priority);
//     console.log('Action Required:', parsed.actionRequired);
//     console.log('-----------------------------');

//     res.json({
//       category: parsed.category ?? 'Unknown',
//       subcategory: parsed.subcategory ?? 'General',
//       priority: parsed.priority ?? 'Medium',
//       actionRequired: parsed.actionRequired ?? 'No'
//     });

//   } catch (err) {
//     console.error('❌ Categorize error:', err.response?.data || err.message);
//     res.status(500).json({ error: 'Categorization failed' });
//   }
// });


// router.post('/categorize', async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ error: 'Email is required' });
//     }

//     const prompt = `
// You are an email classification system.

// Return JSON with exactly these fields:
// - category
// - subcategory
// - priority (High | Medium | Low)
// - actionRequired (Yes | No)

// Email:
// From: ${email.from}
// Subject: ${email.subject}
// Body: ${email.snippet}
// `;

//     const response = await axios.post(
//       'http://localhost:11434/api/generate',
//       {
//         model: 'llama3',
//         prompt,
//         stream: false,
//         format: 'json'
//       },
//       { timeout: 60000 }
//     );

//     // ✅ PARSE JSON STRING
//     const parsed = JSON.parse(response.data.response);

//     // 🔥 LOG TO TERMINAL
//     console.log('📩 Email Categorization Result:');
//     console.log('Category:', parsed.category);
//     console.log('Subcategory:', parsed.subcategory);
//     console.log('Priority:', parsed.priority);
//     console.log('Action Required:', parsed.actionRequired);
//     console.log('-----------------------------');

//     res.json({
//       category: parsed.category ?? 'Unknown',
//       subcategory: parsed.subcategory ?? 'General',
//       priority: parsed.priority ?? 'Medium',
//       actionRequired: parsed.actionRequired ?? 'No'
//     });

//   } catch (err) {
//     console.error('❌ Categorize error:', err.response?.data || err.message);
//     res.status(500).json({ error: 'Categorization failed' });
//   }
// });


router.post('/categorize', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const body = email.snippet || 'No content';

    const prompt = `
You are an email classification system.

Return ONLY valid JSON:
{
  "category": "Work | Personal | Finance | Promotions | Spam | Other",
  "subcategory": "string",
  "priority": "High | Medium | Low",
  "actionRequired": "Yes | No"
}

From: ${email.from}
Subject: ${email.subject}
Body: ${body}
`;

    const completion = await groq.chat.completions.create({
      model: process.env.LLM_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });

    let parsed = {};

    try {
      parsed = JSON.parse(completion.choices[0].message.content);
    } catch {
      return res.status(500).json({ error: 'Invalid JSON from Groq' });
    }

    res.json({
      category: parsed.category || 'Unknown',
      subcategory: parsed.subcategory || 'General',
      priority: parsed.priority || 'Medium',
      actionRequired: parsed.actionRequired || 'No'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Categorization failed' });
  }
});





module.exports = router;
