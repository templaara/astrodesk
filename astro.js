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
//dasha anter dasha calculation 
// 🔥 Dasha Order
const dashaOrder = [
  "Ketu","Venus","Sun","Moon","Mars",
  "Rahu","Jupiter","Saturn","Mercury"
];

const dashaYears = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17
};

// 🔥 Balance calculation
function getDashaBalance(moonDegree) {
  const nakSize = 13.3333;
  const used = moonDegree % nakSize;
  const remaining = nakSize - used;
  return remaining / nakSize;
}

// 🔥 Antardasha
function generateAntardasha(mainPlanet, mainYears, startYear) {
  const subPeriods = [];
  let current = startYear;

  for (let sub of dashaOrder) {
    const subYears = (mainYears * dashaYears[sub]) / 120;

    subPeriods.push({
      planet: `${mainPlanet}/${sub}`,
      start: Math.floor(current),
      end: Math.floor(current + subYears)
    });

    current += subYears;
  }

  return subPeriods;
}

// 🔥 Full Dasha
function generateFullDasha(moonNakshatraLord, moonDegree) {
  const startIndex = dashaOrder.indexOf(moonNakshatraLord);

  const balance = getDashaBalance(moonDegree);

  let timeline = [];
  let currentYear = new Date().getFullYear();

  for (let i = 0; i < 9; i++) {
    const planet = dashaOrder[(startIndex + i) % 9];

    let years = dashaYears[planet];

    if (i === 0) {
      years = years * balance;
    }

    const endYear = currentYear + years;

    const antardasha = generateAntardasha(
      planet,
      years,
      currentYear
    );

    timeline.push({
      planet,
      start: Math.floor(currentYear),
      end: Math.floor(endYear),
      antardasha
    });

    currentYear = endYear;
  }

  return timeline;
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
function getMoonNakshatraReport(nakshatra, pada) {

  const reports = {

    Ashwini: {
      personality: "Fast, energetic, action-oriented ⚡",
      mind: "Quick decisions, impatient",
      career: "Entrepreneur, sports, startup",
      love: "Fast attraction, जल्दी break",
      strength: "Initiative power 🔥",
      weakness: "Impulsiveness ⚠️",
      lifePath: "Start things, lead from front"
    },

    Bharani: {
      personality: "Intense, تحمل শক্তি বেশি 🔥",
      mind: "Emotionally strong but दबाव में",
      career: "Creative, management",
      love: "Deep but possessive",
      strength: "Endurance 💪",
      weakness: "Emotional overload",
      lifePath: "Transformation through pressure"
    },

    Krittika: {
      personality: "Sharp, cutting thinker 🔪",
      mind: "Critical, perfectionist",
      career: "Leader, authority roles",
      love: "Dominating nature",
      strength: "Clarity",
      weakness: "Harsh speech",
      lifePath: "Remove negativity"
    },

    Rohini: {
      personality: "Attractive, creative 🌸",
      mind: "Comfort loving",
      career: "Art, luxury, design",
      love: "Romantic",
      strength: "Charm",
      weakness: "Attachment",
      lifePath: "Material success"
    },

    Mrigashira: {
      personality: "Curious, searching 🔍",
      mind: "Restless",
      career: "Research, travel",
      love: "Unstable",
      strength: "Exploration",
      weakness: "Indecision",
      lifePath: "Search for truth"
    },

    Ardra: {
      personality: "Stormy, intense 🌧️",
      mind: "Emotional chaos",
      career: "Tech, transformation",
      love: "Complicated",
      strength: "Rebirth power",
      weakness: "Depression risk",
      lifePath: "Destroy → rebuild"
    },

    Punarvasu: {
      personality: "Optimistic, comeback king 🌈",
      mind: "Positive",
      career: "Teaching, guidance",
      love: "Stable",
      strength: "Recovery power",
      weakness: "Repeating mistakes",
      lifePath: "Growth through cycles"
    },

    Pushya: {
      personality: "Nurturing, teacher 👨‍🏫",
      mind: "Stable",
      career: "Education, support roles",
      love: "Caring",
      strength: "Support",
      weakness: "Self-sacrifice",
      lifePath: "Guide others"
    },

    Ashlesha: {
      personality: "Deep, mysterious 🐍",
      mind: "Psychological",
      career: "Occult, strategy",
      love: "Complex",
      strength: "Mind control",
      weakness: "Manipulation",
      lifePath: "Inner mastery"
    },

    Magha: {
      personality: "Royal, ego strong 👑",
      mind: "Authority driven",
      career: "Leadership",
      love: "Dominant",
      strength: "Pride",
      weakness: "Ego",
      lifePath: "Legacy building"
    },

    Purva_phalguni: {
      personality: "Creative, pleasure loving 🎭",
      mind: "Relaxed",
      career: "Art, entertainment",
      love: "Romantic",
      strength: "Creativity",
      weakness: "Laziness",
      lifePath: "Enjoy life"
    },

    Uttara_Phalguni: {
      personality: "Responsible, stable 🏠",
      mind: "Balanced",
      career: "Management",
      love: "Stable",
      strength: "Commitment",
      weakness: "Rigidity",
      lifePath: "Build stability"
    },

    Hasta: {
      personality: "Skillful, smart 🤲",
      mind: "Analytical",
      career: "Coding, business",
      love: "Practical",
      strength: "Execution",
      weakness: "Control issues",
      lifePath: "Master skills"
    },

    Chitra: {
      personality: "Designer, creator 🎨",
      mind: "Perfectionist",
      career: "Design, tech",
      love: "High expectations",
      strength: "Creativity",
      weakness: "Restlessness",
      lifePath: "Build something unique"
    },

    Swati: {
      personality: "Independent 🌬️",
      mind: "Free thinker",
      career: "Business",
      love: "Detached",
      strength: "Freedom",
      weakness: "Instability",
      lifePath: "Self growth"
    },

    Vishakha: {
      personality: "Goal focused 🎯",
      mind: "Determined",
      career: "Success driven",
      love: "Intense",
      strength: "Focus",
      weakness: "Obsession",
      lifePath: "Achieve goals"
    },

    Anuradha: {
      personality: "Loyal 🤝",
      mind: "Friendly",
      career: "Team work",
      love: "Stable",
      strength: "Friendship",
      weakness: "Dependency",
      lifePath: "Relationships"
    },

    Jyeshtha: {
      personality: "Powerful, dominant 🧠",
      mind: "Control oriented",
      career: "Authority",
      love: "Complex",
      strength: "Leadership",
      weakness: "Jealousy",
      lifePath: "Handle power"
    },

    Mula: {
      personality: "Root seeker 🌱",
      mind: "Deep thinker",
      career: "Research",
      love: "Extreme",
      strength: "Truth finding",
      weakness: "Destruction",
      lifePath: "Break illusions"
    },

    Purva_Ashadha: {
      personality: "Winning mindset 🏆",
      mind: "Confident",
      career: "Public success",
      love: "Strong attraction",
      strength: "Victory",
      weakness: "Overconfidence",
      lifePath: "Win in life"
    },

    Uttara_Ashadha: {
      personality: "Stable success 🏔️",
      mind: "Strong",
      career: "Long-term success",
      love: "Serious",
      strength: "Persistence",
      weakness: "Slow progress",
      lifePath: "Permanent success"
    },

    Shravana: {
      personality: "Listener 👂",
      mind: "Learning",
      career: "Teaching",
      love: "Understanding",
      strength: "Knowledge",
      weakness: "Overthinking",
      lifePath: "Learn & teach"
    },

    Dhanishta: {
      personality: "Rich mindset 💰",
      mind: "Rhythmic",
      career: "Finance, music",
      love: "Balanced",
      strength: "Wealth",
      weakness: "Materialism",
      lifePath: "Success & wealth"
    },

    Shatabhisha: {
      personality: "Healer 🌌",
      mind: "Isolated",
      career: "Healing, tech",
      love: "Detached",
      strength: "Healing",
      weakness: "Loneliness",
      lifePath: "Serve humanity"
    },

    Purva_Bhadrapada: {
      personality: "Extreme thinker 🔥",
      mind: "Intense",
      career: "Philosophy",
      love: "Complex",
      strength: "Depth",
      weakness: "Dual nature",
      lifePath: "Balance extremes"
    },

    Uttara_Bhadrapada: {
      personality: "Calm wisdom 🌊",
      mind: "Deep calm",
      career: "Spiritual",
      love: "Stable",
      strength: "Peace",
      weakness: "Isolation",
      lifePath: "Inner peace"
    },

    Revati: {
      personality: "Soft, spiritual 🌸",
      mind: "Compassionate",
      career: "Helping others",
      love: "Gentle",
      strength: "Kindness",
      weakness: "Escapism",
      lifePath: "Guide others"
    }
  };

  return reports[nakshatra] || {
    personality: "Unique personality",
    mind: "Balanced",
    career: "General",
    love: "Normal",
    strength: "Mixed",
    weakness: "Mixed",
    lifePath: "Self discovery"
  };
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
    function getAscendant(jd, lat, lon) {
      return new Promise((resolve, reject) => {
        swisseph.swe_houses(jd, lat, lon, 'P', (res) => {
          if (res.error) return reject(res.error);

          const asc = res.ascendant || (res.ascmc ? res.ascmc[0] : null);

          if (!asc) return reject("Ascendant not found");

          resolve(asc);
        });
      });
    }
    //const houseData = await getHouses(jd, lat, lon);
     function getHouseFromSign(planetDegree, ascDegree) {
        const signs = [
          "Aries","Taurus","Gemini","Cancer",
          "Leo","Virgo","Libra","Scorpio",
          "Sagittarius","Capricorn","Aquarius","Pisces"
        ];

        const planetSignIndex = Math.floor(planetDegree / 30);
        const ascSignIndex = Math.floor(ascDegree / 30);

        return (planetSignIndex - ascSignIndex + 12) % 12 + 1;
      }
    const result = {};
 const ascDegree = await getAscendant(jd, lat, lon);
    for (let key in planets) {
      const pos = await getPlanetPosition(jd, planets[key]);

      if (!pos || pos.longitude === undefined) {
        throw new Error(`Planet calculation failed for ${key}`);
      }

      const degree = pos.longitude;
      const nak = getNakshatraDetails(degree);
      //const ascDegree = houseData.ascendant;
     
      const house = getHouseFromSign(degree, ascDegree);

      result[key] = {
        degree: degree.toFixed(2),
        rashi: getRashi(degree),
        //house: getHouse(degree, houseData.houses), //  fixed
        house: house,
        retrograde: pos.speed < 0,

        strength: getPlanetStrength(key, getRashi(degree),house,
        // getHouse(degree, houseData.houses)
       ),
        nakshatra: nak.nakshatra,
        pada: nak.pada,
        nakshatraLord: nak.lord,

        nakshatraMeaning: getNakshatraMeaning(nak.nakshatra),
        padaMeaning: getPadaMeaning(nak.pada),
        prediction: getPlanetNakshatraPrediction(key, nak.nakshatra),
        
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

    // 🔥 DASHA ADD
    const moonDegree = parseFloat(result.MOON.degree);
    const moonLord = result.MOON.nakshatraLord;

    const dasha = generateFullDasha(moonLord, moonDegree);

    const moonReport = getMoonNakshatraReport(
        result.MOON.nakshatra,
        result.MOON.pada
    );
    return {
      ascendant: ascDegree.toFixed(2),
      //houses: houseData.houses,
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
      moonReport,
      dasha

    //   nakshatra: nak.nakshatra,
    //   pada: nak.pada,
    //   nakshatraLord: nak.lord,
    };

  } catch (err) {
    throw err;
  }
}

module.exports = { calculateKundali };