const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function askLLM(prompt) {
  const completion = await groq.chat.completions.create({
    model: process.env.LLM_MODEL,
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt }
    ],
  });

  return completion.choices[0].message.content;
}

module.exports = askLLM;
