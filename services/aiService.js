const axios = require("axios");

async function generateAIResponse(kundali) {
  try {

    const prompt = `
You are a Vedic astrologer.

কুণ্ডলী তথ্য:

Lagna Degree: ${kundali.ascendant}
Moon Sign: ${kundali.planets.MOON.rashi}

Important:
- Mercury: ${kundali.planets.MERCURY.strength}
- Jupiter: ${kundali.planets.JUPITER.strength}
- Rahu House: ${kundali.planets.RAHU.house}

Life Theme: ${kundali.lifeTheme}
Mental State: ${kundali.mentalState}

নিচের বিষয়গুলো সুন্দরভাবে ব্যাখ্যা করো:
1. Personality
2. Love life
3. Career
4. Money
5. Marriage
6. Advice

Make it natural, human-like.
`;

    console.log("🚀 Calling Ollama...");

    const res = await axios.post("http://127.0.0.1:11434/api/generate", {
      //model: "llama3:latest", // 🔥 FIXED
      model: "mistral",
      prompt,
      stream: false
    });

    return res.data.response;

  } catch (err) {
    console.log("❌ AI ERROR:", err.response?.data || err.message);

    return "AI generate করতে সমস্যা হয়েছে ❌";
  }
}

module.exports = { generateAIResponse };