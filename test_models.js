const { GoogleGenerativeAI } = require('@google/generative-ai');
async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // @google/generative-ai doesn't have listModels in some versions. Let's do a raw fetch instead.
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  const json = await res.json();
  console.log(json);
}
test();
