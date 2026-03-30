const swisseph = require('swisseph');

// ephemeris path
swisseph.swe_set_ephe_path(__dirname + '/ephe');

// Lahiri Ayanamsa (Vedic)
swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

// Julian Date
function toJulianDate(date) {
  return (date / 86400000) + 2440587.5;
}

// Planet list
const planets = {
  SUN: swisseph.SE_SUN,
  MOON: swisseph.SE_MOON,
  MARS: swisseph.SE_MARS,
  MERCURY: swisseph.SE_MERCURY,
  JUPITER: swisseph.SE_JUPITER,
  VENUS: swisseph.SE_VENUS,
  SATURN: swisseph.SE_SATURN,
  RAHU: swisseph.SE_MEAN_NODE
};

// ✅ Planet Position FIXED
// function getPlanetPosition(jd, planet) {
//   return new Promise((resolve, reject) => {
//     swisseph.swe_calc_ut(
//       jd,
//       planet,
//       swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SIDEREAL,
//       (res) => {
//         if (res.error) return reject(res.error);

//         if (!res.data || res.data.length < 4) {
//           return reject("Invalid planet data");
//         }

//         resolve({
//           longitude: res.data[0],
//           latitude: res.data[1],
//           distance: res.data[2],
//           speed: res.data[3]
//         });
//       }
//     );
//   });
// }
function getPlanetPosition(jd, planet) {
  return new Promise((resolve, reject) => {
    swisseph.swe_calc_ut(
      jd,
      planet,
      swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SIDEREAL,
      (res) => {
        if (res.error) return reject(res.error);

        console.log("PLANET RAW:", res); // debug once

        let longitude, latitude, distance, speed;

        // 🔥 handle all possible formats
        if (res.data && Array.isArray(res.data)) {
          longitude = res.data[0];
          latitude = res.data[1];
          distance = res.data[2];
          speed = res.data[3];
        } else if (Array.isArray(res)) {
          longitude = res[0];
          latitude = res[1];
          distance = res[2];
          speed = res[3];
        } else if (res.longitude !== undefined) {
          longitude = res.longitude;
          latitude = res.latitude;
          distance = res.distance;
          speed = res.speed;
        }

        if (longitude === undefined) {
          return reject("Invalid planet data structure");
        }

        resolve({
          longitude,
          latitude,
          distance,
          speed
        });
      }
    );
  });
}
function getPlanetStrength(planet, rashi, house) {
  const ownSigns = {
    SUN: ["Leo"],
    MOON: ["Cancer"],
    MARS: ["Aries", "Scorpio"],
    MERCURY: ["Gemini", "Virgo"],
    JUPITER: ["Sagittarius", "Pisces"],
    VENUS: ["Taurus", "Libra"],
    SATURN: ["Capricorn", "Aquarius"]
  };

  const exalted = {
    SUN: "Aries",
    MOON: "Taurus",
    MARS: "Capricorn",
    MERCURY: "Virgo",
    JUPITER: "Cancer",
    VENUS: "Pisces",
    SATURN: "Libra"
  };

  const debilitated = {
    SUN: "Libra",
    MOON: "Scorpio",
    MARS: "Cancer",
    MERCURY: "Pisces",
    JUPITER: "Capricorn",
    VENUS: "Virgo",
    SATURN: "Aries"
  };

  if (exalted[planet] === rashi) return "Exalted 🔥";
  if (debilitated[planet] === rashi) return "Debilitated ❌";
  if (ownSigns[planet]?.includes(rashi)) return "Own Sign 💪";

  if ([6, 8, 12].includes(house)) return "Weak ⚠️";

  return "Normal";
}
function checkRajYoga(planets) {
  if (
    planets.JUPITER.house === 5 &&
    planets.SATURN.house === 11
  ) {
    return "Raj Yoga Present 🔥";
  }
  return "No Major Raj Yoga";
}
function findStellium(planets) {
  const houseMap = {};

  for (let p in planets) {
    const h = planets[p].house;
    houseMap[h] = houseMap[h] ? houseMap[h] + 1 : 1;
  }

  return Object.keys(houseMap).filter(h => houseMap[h] >= 3);
}
function getLifeTheme(planets) {
  if (planets.JUPITER.house === 8) {
    return "Spiritual + Hidden Knowledge Life Path 🔮";
  }

  if (planets.MERCURY.house === 5) {
    return "Creative + Intellectual Career 💻";
  }

  return "Balanced Life";
}
function analyzeMoon(moon) {
  if (moon.house === 6) {
    return "Stress + Overthinking ⚠️";
  }
  return "Emotionally Stable";
}
function checkWealth(planets) {
  if (planets.SATURN.house === 11) {
    return "Slow but stable income 💰";
  }
  return "Average earning";
}
// function getHouses(jd, lat, lon) {
//   const res = swisseph.swe_houses(jd, lat, lon, 'P');

//   if (!res) {
//     throw new Error("No response from swisseph");
//   }

//   // 🔥 handle multiple formats
//   const houses = res.houses || res.cusps;
//   const ascendant = res.ascendant || (res.ascmc ? res.ascmc[0] : null);

//   if (!houses || !ascendant) {
//     console.log("DEBUG HOUSE RAW:", res);
//     throw new Error("Invalid house data from swisseph");
//   }

//   return {
//     houses,
//     ascendant
//   };
// }
function getHouses(jd, lat, lon) {
  const res = swisseph.swe_houses(jd, lat, lon, 'P');

  if (!res) {
    throw new Error("No response from swisseph");
  }

  // 🔥 actual structure অনুযায়ী fix
  const houses = res.house; // ✅ correct key
  const ascendant = res.ascendant;

  if (!houses || !ascendant) {
    console.log("DEBUG HOUSE RAW:", res);
    throw new Error("Invalid house data from swisseph");
  }

  return {
    houses,
    ascendant
  };
}
// Rashi
function getRashi(degree) {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  return signs[Math.floor(degree / 30)];
}
// 🔥 Nakshatra List
const nakshatras = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira",
  "Ardra","Punarvasu","Pushya","Ashlesha","Magha",
  "Purva Phalguni","Uttara Phalguni","Hasta","Chitra",
  "Swati","Vishakha","Anuradha","Jyeshtha","Mula",
  "Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta",
  "Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"
];

// 🔥 Nakshatra Lords
const nakshatraLords = [
  "Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter",
  "Saturn","Mercury"
];

// 🔥 Function
function getNakshatraDetails(degree) {
  const size = 13.3333;

  const index = Math.floor(degree / size);
  const pada = Math.floor((degree % size) / 3.3333) + 1;

  return {
    nakshatra: nakshatras[index],
    pada,
    lord: nakshatraLords[index % 9]
  };
}
const houseLords = {
  1: "MARS",
  2: "VENUS",
  3: "MERCURY",
  4: "MOON",
  5: "SUN",
  6: "MERCURY",
  7: "VENUS",
  8: "MARS",
  9: "JUPITER",
  10: "SATURN",
  11: "SATURN",
  12: "JUPITER"
};

function analyzeHouseLords(planets) {
  const result = {};

  for (let house in houseLords) {
    const lord = houseLords[house];
    result[house] = {
      lord,
      placedIn: planets[lord]?.house
    };
  }

  return result;
}
function getConjunctions(planets) {
  const map = {};

  for (let p in planets) {
    const h = planets[p].house;
    if (!map[h]) map[h] = [];
    map[h].push(p);
  }

  return Object.values(map).filter(arr => arr.length > 1);
}
function getElement(rashi) {
  const map = {
    Aries: "Fire", Leo: "Fire", Sagittarius: "Fire",
    Taurus: "Earth", Virgo: "Earth", Capricorn: "Earth",
    Gemini: "Air", Libra: "Air", Aquarius: "Air",
    Cancer: "Water", Scorpio: "Water", Pisces: "Water"
  };
  return map[rashi];
}

function elementBalance(planets) {
  const count = {};

  for (let p in planets) {
    const el = getElement(planets[p].rashi);
    count[el] = (count[el] || 0) + 1;
  }

  return count;
}
function getKetu(rahuDegree) {
  let ketu = (rahuDegree + 180) % 360;
  return ketu;
}

// House detect
function getHouse(planetDegree, houseCusps) {
  for (let i = 0; i < 12; i++) {
    let start = houseCusps[i];
    let end = houseCusps[(i + 1) % 12];

    if (start < end) {
      if (planetDegree >= start && planetDegree < end) return i + 1;
    } else {
      if (planetDegree >= start || planetDegree < end) return i + 1;
    }
  }
  return null;
}

function getNakshatraMeaning(nakshatra) {
  const meanings = {
    "Ashwini": "Fast, energetic, healer type",
    "Bharani": "Intense, creative, تحمل শক্তি বেশি",
    "Krittika": "Sharp, কাটিং মাইন্ড",
    "Rohini": "Attractive, creative, materialistic",
    "Mrigashira": "Curious, searching mind",
    "Ardra": "Emotional storm, transformation",
    "Punarvasu": "Optimistic, comeback power",
    "Pushya": "Nurturing, teacher type",
    "Ashlesha": "Deep, রহস্যময়, manipulative tendency",
    "Magha": "Royal, ego strong",
    "Purva Phalguni": "Creative, pleasure loving",
    "Uttara Phalguni": "Responsible, stable",
    "Hasta": "Skillful, hand talent, smart",
    "Chitra": "Designer, creator, beauty lover",
    "Swati": "Independent, हवा जैसा",
    "Vishakha": "Goal focused, determined",
    "Anuradha": "Loyal, friendship oriented",
    "Jyeshtha": "Power, control",
    "Mula": "Destroyer, root finder",
    "Purva Ashadha": "Winning mindset",
    "Uttara Ashadha": "Permanent success",
    "Shravana": "Listener, learner",
    "Dhanishta": "Rich mindset, rhythm",
    "Shatabhisha": "Healer, hidden",
    "Purva Bhadrapada": "Extreme thinker",
    "Uttara Bhadrapada": "Deep calm wisdom",
    "Revati": "Soft, spiritual, guide"
  };

  return meanings[nakshatra] || "";
}
const nakshatraPredictions = {
  MOON: {
    Chitra: "Creative mind but restless emotions 🎨",
    Ashlesha: "Deep emotions, secretive nature 🌊"
  },

  MERCURY: {
    Hasta: "Highly skilled, coding/design mastery 💻"
  },

  RAHU: {
    Hasta: "Digital obsession, online success potential 🌐"
  },

  VENUS: {
    Swati: "Independent in love, unconventional relationships 💔"
  },

  MARS: {
    Ashwini: "Quick to act, impulsive energy ⚡"
  },

  JUPITER: {
    Punarvasu: "Optimistic teacher, good for education 📚"
  },

  SATURN: {
    Mula: "Disciplined, structured approach 🕒"
  },

  SUN: {
    Magha: "Strong ego, leadership qualities 👑"
  }
};

function getPlanetNakshatraPrediction(planet, nakshatra) {
  return (
    nakshatraPredictions[planet]?.[nakshatra] ||
    "General influence present"
  );
}


function getPadaMeaning(pada) {
  if (pada === 1) return "Initiator energy";
  if (pada === 2) return "Stability focus";
  if (pada === 3) return "Creative expansion";
  if (pada === 4) return "Emotional depth";

  return "";
}
// ✅ MAIN FUNCTION FIXED
async function calculateKundali({ date, time, lat, lon }) {
  try {
    // ⚠️ Timezone FIX (VERY IMPORTANT)
    const dob = new Date(`${date}T${time}+05:30`);

    const jd = toJulianDate(dob);

    const houseData = await getHouses(jd, lat, lon);

    const result = {};

    for (let key in planets) {
      const pos = await getPlanetPosition(jd, planets[key]);

      if (!pos || pos.longitude === undefined) {
        throw new Error(`Planet calculation failed for ${key}`);
      }

      const degree = pos.longitude;
      const nak = getNakshatraDetails(degree);

      result[key] = {
        degree: degree.toFixed(2),
        rashi: getRashi(degree),
        house: getHouse(degree, houseData.houses), // ✅ fixed
        retrograde: pos.speed < 0,

        strength: getPlanetStrength(key, getRashi(degree), getHouse(degree, houseData.houses)),
        nakshatra: nak.nakshatra,
        pada: nak.pada,
        nakshatraLord: nak.lord,

        nakshatraMeaning: getNakshatraMeaning(nak.nakshatra),
        padaMeaning: getPadaMeaning(nak.pada),
        prediction: getPlanetNakshatraPrediction(key, nak.nakshatra)
      };
    }
   




    
    const stellium = findStellium(result);
    const lifeTheme = getLifeTheme(result);
    const mentalState = analyzeMoon(result.MOON);
    const wealth = checkWealth(result);

    // 🔥 NEW
    const houseLords = analyzeHouseLords(result);
    const conjunctions = getConjunctions(result);
    const elements = elementBalance(result);

    // 🔥 Rahu → Ketu
    const rahuDeg = parseFloat(result.RAHU.degree);
    const ketuDeg = getKetu(rahuDeg);
    return {
      ascendant: houseData.ascendant.toFixed(2),
      houses: houseData.houses,
      planets: result,

      stellium,
      lifeTheme,
      mentalState,
      wealth,

      houseLords,
      conjunctions,
      elements,

      karmaAxis: {
         rahu: result.RAHU.house,
         ketuDegree: ketuDeg.toFixed(2)
      },

    //   nakshatra: nak.nakshatra,
    //   pada: nak.pada,
    //   nakshatraLord: nak.lord,
    };

  } catch (err) {
    throw err;
  }
}

module.exports = { calculateKundali };