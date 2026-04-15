const Groq = require('groq-sdk');
require('dotenv').config({ path: '.env.local' });

async function checkGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY not found");
    return;
  }
  
  const groq = new Groq({ apiKey });
  
  try {
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'What is the capital of France?' }],
      stream: true,
    });
    
    console.log("Response:");
    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || '');
    }
    console.log("\nSuccess!");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

checkGroq();
