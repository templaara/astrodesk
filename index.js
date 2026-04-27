const express = require('express');
const bodyParser = require('body-parser');
const { calculateKundali } = require('./astro');
const { generateAIResponse } = require("./services/aiService");
const cors = require("cors");


const app = express();
app.use(bodyParser.json());
app.use(cors()); 
// app.post("/kundali", async (req, res) => {
//   try {

//     // 🔥 STEP A: Kundali calculate
//     const kundali = await calculateKundali(req.body);

//     // 🔥 STEP B: AI call (NEW)
//     const aiPrediction = await generateAIResponse(kundali);

//     // 🔥 STEP C: Response send
//     res.json({
//       ...kundali,
//       aiPrediction
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
app.post("/kundali", async (req, res) => {
  try {
    const kundali = await calculateKundali(req.body);
    const aiPrediction = await generateAIResponse(kundali);

    res.json({
      ...kundali,
      aiPrediction
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/kundalis', async (req, res) => {
  try {
    const { date, time, lat, lon } = req.body;

    if (!date || !time || !lat || !lon) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const result = await calculateKundali({
      date,
      time,
      lat,
      lon
    });

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.toString() });
  }
});

//get api
app.get('/', async (req, res) => {
  try {
    res.status(200).json({ message: "Welcome to the Kundali API. Please use POST /kundali to calculate your Kundali." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.toString() });
  }
});


app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});