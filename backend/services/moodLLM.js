const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

module.exports = async function analyzeMoodWithLLM(emailText) {
  const prompt = `
Classify the mood of this email into ONE word only:
- happy (good news, promotion, deals, appreciation)
- sad (workload, deadlines, pressure, warnings)
- neutral (informational, mixed or light)

Email:
"${emailText}"

Answer:
`;

  const completion = await groq.chat.completions.create({
    model: process.env.LLM_MODEL,
    messages: [
      { role: 'user', content: prompt }
    ],
    temperature: 0,
  });

  const output = completion.choices[0].message.content.toLowerCase();

  if (output.includes('happy')) return 'happy';
  if (output.includes('sad')) return 'sad';
  return 'neutral';
};