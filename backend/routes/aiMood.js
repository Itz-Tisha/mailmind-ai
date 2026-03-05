const express = require('express');
const axios = require('axios'); // kept in case you re-enable LLM later

const router = express.Router();

// Simple keyword-based fallback classifier used when LLM is unavailable
function classifyHeuristic(mail) {
  const text = `${mail.subject || ''} ${mail.body || ''}`.toLowerCase();

  const positiveKeywords = [
    'congratulations',
    'congrats',
    'promoted',
    'promotion',
    'offer',
    'deal',
    'discount',
    'thank you',
    'thanks',
    'great news',
    'happy to',
    'we are pleased',
  ];

  const negativeKeywords = [
    'unfortunately',
    'fired',
    'we regret',
    'rejected',
    'rejection',
    'resignation',
    'complaint',
    'issue',
    'problem',
    'error',
    'failed',
    'termination',
    'warning',
    'urgent',
    'asap',
    'overdue',
    'sorry',
    'too much work',
    'workload',
    'deadline',
  ];

  if (positiveKeywords.some(k => text.includes(k))) return 'happy';
  if (negativeKeywords.some(k => text.includes(k))) return 'sad';
  return 'neutral';
}

router.post('/daily', async (req, res) => {
  try {
    const { emails } = req.body;

    let moodCount = { happy: 0, sad: 0, neutral: 0 };

    for (const mail of emails) {
      const prompt = `
You are classifying *today's* emails by tone only.
For each email, pick exactly ONE mood:

- Happy: clearly positive tone or emotion. Examples: appreciation, gratitude, success, good news, rewards, promotions, celebrations, exciting offers/deals, congratulations, thanks.
- Sad: clearly negative tone or emotion. Examples: complaints, issues, rejections, resignation, bad news, warnings, errors, apologies for problems, heavy workload or deadline pressure.
- Neutral: purely informational, factual, or routine notifications *with no clear positive or negative emotion*.

Very important:
- Do NOT use Neutral as a default.
- If the email contains any clear positive or negative emotion, prefer Happy or Sad instead of Neutral.

Return only a single word: Happy, Sad, or Neutral.

Email:
Subject: ${mail.subject}
Body: ${mail.body}
`;

      // For now, use only the heuristic classifier so there is no dependency
      // on the Ollama LLM (this removes the mood LLM error completely).
      const mood = classifyHeuristic(mail);

      if (moodCount[mood] !== undefined) {
        moodCount[mood]++;
      } else {
        moodCount.neutral++;
      }
    }

    const total = emails.length || 1;

    const happyPercent = Math.round((moodCount.happy / total) * 100);
    const sadPercent = Math.round((moodCount.sad / total) * 100);
    const neutralPercent = Math.round((moodCount.neutral / total) * 100);

    // Pick user mood strictly by highest percentage
    let userMood = 'Neutral';
    if (happyPercent >= sadPercent && happyPercent >= neutralPercent) {
      userMood = 'Happy';
    } else if (sadPercent >= happyPercent && sadPercent >= neutralPercent) {
      userMood = 'Sad';
    }

    res.json({
      happy: happyPercent,
      sad: sadPercent,
      neutral: neutralPercent,
      counts: {
        happy: moodCount.happy,
        sad: moodCount.sad,
        neutral: moodCount.neutral,
      },
      total: total,
      userMood,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Mood analysis failed' });
  }
});

module.exports = router;