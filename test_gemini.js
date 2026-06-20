
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Using API key starting with:', apiKey.substring(0, 5));
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });
    const result = await model.generateContent("Say hello");
    console.log('Success:', result.response.text());
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
