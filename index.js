const express = require('express');
const bodyParser = require('body-parser');
const { calculateKundali } = require('./astro');

const app = express();
app.use(bodyParser.json());

app.post('/kundali', async (req, res) => {
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

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});