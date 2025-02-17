const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

async function getOutfitSuggestions(userPreferences) {
  const prompt = `Suggest an outfit for someone who likes ${userPreferences} on a sunny day.`;
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });

  return completion.choices[0].message.content;
}

module.exports = { getOutfitSuggestions };
