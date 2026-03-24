








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
