/* Default game data — stored in localStorage after first load */
const DEFAULT_DATA = {
  mrWhite: {
    /* Each entry is a word pair: citizens get `word`, Mr. White gets `mrWhite` */
    easy: [
      { word: "Moses",           mrWhite: "Aaron" },
      { word: "David",           mrWhite: "Solomon" },
      { word: "Peter",           mrWhite: "Paul" },
      { word: "Matthew",         mrWhite: "Mark" },
      { word: "Adam",            mrWhite: "Eve" },
      { word: "Cain",            mrWhite: "Abel" },
      { word: "Abraham",         mrWhite: "Isaac" },
      { word: "Jacob",           mrWhite: "Esau" },
      { word: "Ruth",            mrWhite: "Esther" },
      { word: "Elijah",          mrWhite: "Elisha" },
      { word: "Mary",            mrWhite: "Martha" },
      { word: "Noah",            mrWhite: "Lot" },
      { word: "Joseph",          mrWhite: "Benjamin" },
      { word: "Passover",        mrWhite: "Sabbath" },
      { word: "Jerusalem",       mrWhite: "Bethlehem" },
      { word: "Psalm",           mrWhite: "Proverb" },
      { word: "Angel",           mrWhite: "Dove" },
      { word: "Miracle",         mrWhite: "Parable" },
      { word: "Shepherd",        mrWhite: "Fisherman" },
      { word: "Flood",           mrWhite: "Plague" },
      { word: "Ark",             mrWhite: "Temple" },
      { word: "Disciple",        mrWhite: "Apostle" },
      { word: "Heaven",          mrWhite: "Eden" },
      { word: "Baptism",         mrWhite: "Prayer" },
      { word: "Luke",            mrWhite: "John" },
      { word: "Manna",           mrWhite: "Quail" },
      { word: "Goliath",         mrWhite: "Pharaoh" },
      { word: "Faith",           mrWhite: "Hope" },
      { word: "Prophet",         mrWhite: "Priest" },
      { word: "Samson",          mrWhite: "Gideon" },
      { word: "Creation",        mrWhite: "Garden of Eden" },
      { word: "Cross",           mrWhite: "Crown of Thorns" },
      { word: "Jonah",           mrWhite: "Daniel" },
      { word: "King",            mrWhite: "Queen" },
      { word: "Sheep",           mrWhite: "Lamb" },
      { word: "Wilderness",      mrWhite: "Desert" },
      { word: "Resurrection",    mrWhite: "Ascension" },
      { word: "Bread",           mrWhite: "Wine" },
      { word: "Fire",            mrWhite: "Cloud" },
      { word: "Lion",            mrWhite: "Lamb" },
      { word: "Staff",           mrWhite: "Scepter" },
      { word: "Tomb",            mrWhite: "Cave" },
      { word: "Fisherman",       mrWhite: "Tax Collector" },
      { word: "Saul",            mrWhite: "David" },
      { word: "Wise Men",        mrWhite: "Shepherds" },
      { word: "Star",            mrWhite: "Manger" },
      { word: "Jordan River",    mrWhite: "Red Sea" },
      { word: "Commandments",    mrWhite: "Covenant" },
      { word: "Judas",           mrWhite: "Thomas" },
      { word: "Elizabeth",       mrWhite: "Mary" },
      { word: "John the Baptist",mrWhite: "Elijah" },
      { word: "Garden",          mrWhite: "Temple" },
      { word: "Donkey",          mrWhite: "Camel" },
      { word: "Wine",            mrWhite: "Water" },
      { word: "Rock",            mrWhite: "Sand" },
      { word: "Light",           mrWhite: "Darkness" },
      { word: "Sword",           mrWhite: "Shield" },
      { word: "Forgiveness",     mrWhite: "Repentance" },
      { word: "Blessing",        mrWhite: "Curse" },
      { word: "Fast",            mrWhite: "Feast" }
    ],
    medium: [
      /* Both words known to regular churchgoers; pairs share a clear dramatic connection */
      { word: "Prodigal Son",           mrWhite: "Good Samaritan" },       // famous parables
      { word: "Feeding of the 5000",    mrWhite: "Walking on Water" },     // famous miracles
      { word: "Sermon on the Mount",    mrWhite: "Transfiguration" },      // mountaintop events
      { word: "Thomas",                 mrWhite: "Judas Iscariot" },       // disciples known for one defining moment
      { word: "Joshua",                 mrWhite: "Caleb" },                // two faithful spies
      { word: "Deborah",                mrWhite: "Miriam" },               // female prophetesses
      { word: "Rebekah",                mrWhite: "Rachel" },               // matriarchs met at a well
      { word: "Jezebel",                mrWhite: "Herodias" },             // wicked queens who arranged murders
      { word: "Boaz",                   mrWhite: "Naomi" },                // Ruth's kinsman and mother-in-law
      { word: "Lazarus",                mrWhite: "Jairus" },               // both connected to Jesus raising the dead
      { word: "Nehemiah",               mrWhite: "Ezra" },                 // post-exile reformers
      { word: "Golden Calf",            mrWhite: "Tower of Babel" },       // acts of human rebellion against God
      { word: "Rahab",                  mrWhite: "Delilah" },              // pagan women in the stories of Israel's warriors
      { word: "Herod",                  mrWhite: "Pontius Pilate" },       // rulers who judged Jesus
      { word: "Pharisee",               mrWhite: "Sadducee" },             // rival religious sects
      { word: "Ezekiel",                mrWhite: "Isaiah" },               // major prophets
      { word: "Absalom",                mrWhite: "Adonijah" },             // sons of David who seized the throne
      { word: "Daniel",                 mrWhite: "Shadrach" },             // companions faithful in Babylon
      { word: "Nicodemus",              mrWhite: "Zacchaeus" },            // unlikely seekers of Jesus
      { word: "Barnabas",               mrWhite: "Silas" },                // Paul's missionary companions
      { word: "Tabernacle",             mrWhite: "Ark of the Covenant" },  // central holy structures of the OT
      { word: "Burning Bush",           mrWhite: "Pillar of Fire" },       // divine fire appearances
      { word: "Ten Commandments",       mrWhite: "Beatitudes" },           // famous moral teachings from God
      { word: "Resurrection",           mrWhite: "Ascension" },            // events after Jesus's death
      { word: "Gethsemane",             mrWhite: "Golgotha" },             // places of Jesus's passion
      { word: "Pentecost",              mrWhite: "Feast of Tabernacles" }, // important biblical celebrations
      { word: "Sea of Galilee",         mrWhite: "Dead Sea" },             // famous bodies of water in Israel
      { word: "Ahab",                   mrWhite: "Manasseh" },             // notoriously wicked kings
      { word: "Philistines",            mrWhite: "Amalekites" },           // persistent enemies of Israel
      { word: "Widow of Zarephath",     mrWhite: "Woman at the Well" }     // women transformed by encounter with a man of God
    ],
    hard: [
      /* Pairs require real Bible knowledge — dramatic stories, not academic jargon */
      { word: "Ananias",          mrWhite: "Sapphira" },          // couple who lied to the Holy Spirit and died
      { word: "Balaam",           mrWhite: "Balak" },             // the prophet and the king (talking donkey)
      { word: "Joab",             mrWhite: "Abner" },             // rival commanders — Joab killed Abner
      { word: "Hezekiah",         mrWhite: "Josiah" },            // the two greatest reforming kings of Judah
      { word: "Festus",           mrWhite: "Felix" },             // consecutive Roman governors who tried Paul
      { word: "Onesimus",         mrWhite: "Philemon" },          // runaway slave and master — Paul's shortest letter
      { word: "Gehazi",           mrWhite: "Simon the Sorcerer"}, // both tried to profit from God's power
      { word: "Bezalel",          mrWhite: "Hiram of Tyre" },     // craftsmen called to build God's sanctuary
      { word: "Haggai",           mrWhite: "Zechariah" },         // the two prophets who urged rebuilding the temple
      { word: "Jephthah",         mrWhite: "Othniel" },           // lesser-known judges of Israel
      { word: "Aquila",           mrWhite: "Apollos" },           // NT teachers who strengthened the early church
      { word: "Mephibosheth",     mrWhite: "Ziba" },              // Jonathan's crippled son and his deceptive servant
      { word: "Ahithophel",       mrWhite: "Hushai" },            // David's two counselors during Absalom's revolt
      { word: "Uriah",            mrWhite: "Naboth" },            // innocent men killed by a king for their land or loyalty
      { word: "Asaph",            mrWhite: "Jeduthun" },          // the temple choir leaders appointed by David
      { word: "Sisera",           mrWhite: "Haman" },             // powerful enemies of God's people defeated by unlikely heroes
      { word: "Phoebe",           mrWhite: "Junia" },             // NT women Paul praised as leaders and apostles
      { word: "Melchizedek",      mrWhite: "Aaron" },             // high priests — one mysterious, one established
      { word: "Dorcas",           mrWhite: "Rhoda" },             // two women with brief but memorable scenes in Acts
      { word: "Hophni",           mrWhite: "Phinehas" },          // the two wicked sons of Eli the priest
      { word: "Tiglath-Pileser",  mrWhite: "Sennacherib" },       // Assyrian kings who threatened Israel
      { word: "Agabus",           mrWhite: "Anna" },              // NT prophets — one foretold Paul's arrest, one saw baby Jesus
      { word: "Uzziah",           mrWhite: "Asa" },               // two mostly righteous kings of Judah
      { word: "Joash",            mrWhite: "Jehoiada" },          // the boy king hidden in the temple and the priest who raised him
      { word: "Eliezer",          mrWhite: "Zipporah" },          // people most closely connected to Moses's personal life
      { word: "Amnon",            mrWhite: "Tamar" },             // David's children in one of Scripture's most tragic stories
      { word: "Naaman",           mrWhite: "Widow of Zarephath" },// Gentiles miraculously helped by Elijah and Elisha
      { word: "Athaliah",         mrWhite: "Bathsheba" },         // two queen mothers of Judah — one murderous, one complicated
      { word: "Nebuchadnezzar",   mrWhite: "Belshazzar" },        // Babylonian kings who faced God's judgment
      { word: "Obadiah",          mrWhite: "Nahum" }              // minor prophets who pronounced doom on Israel's enemies
    ]
  },

  jeopardy: {
    categories: [
      {
        name: "In the Beginning",
        questions: [
          { value: 100, question: "God created the earth in this many days.", answer: "What is 6?" },
          { value: 200, question: "The first garden God planted for mankind.", answer: "What is the Garden of Eden?" },
          { value: 300, question: "The tree whose fruit was forbidden to Adam and Eve.", answer: "What is the Tree of the Knowledge of Good and Evil?" },
          { value: 400, question: "Adam's punishment was to toil this — the ground.", answer: "What is the soil / earth?" },
          { value: 500, question: "This person was the oldest in the Bible, living 969 years.", answer: "Who is Methuselah?" }
        ]
      },
      {
        name: "The Exodus",
        questions: [
          { value: 100, question: "Moses parted this body of water to escape Pharaoh.", answer: "What is the Red Sea?" },
          { value: 200, question: "God provided this bread-like food from heaven in the desert.", answer: "What is manna?" },
          { value: 300, question: "The number of plagues God sent on Egypt.", answer: "What is 10?" },
          { value: 400, question: "The mountain where Moses received the Ten Commandments.", answer: "What is Mount Sinai?" },
          { value: 500, question: "The golden object the Israelites built while Moses was on the mountain.", answer: "What is the Golden Calf?" }
        ]
      },
      {
        name: "Kings & Queens",
        questions: [
          { value: 100, question: "Israel's first king, anointed by Samuel.", answer: "Who is Saul?" },
          { value: 200, question: "The young shepherd who killed Goliath with a sling.", answer: "Who is David?" },
          { value: 300, question: "The wisest king of Israel, known for his proverbs.", answer: "Who is Solomon?" },
          { value: 400, question: "The queen who visited Solomon to test his wisdom.", answer: "Who is the Queen of Sheba?" },
          { value: 500, question: "This queen saved the Jewish people from Haman's plot in Persia.", answer: "Who is Esther?" }
        ]
      },
      {
        name: "The Gospels",
        questions: [
          { value: 100, question: "The number of disciples Jesus chose.", answer: "What is 12?" },
          { value: 200, question: "Jesus fed this many people with 5 loaves and 2 fish.", answer: "What is 5,000?" },
          { value: 300, question: "The disciple who denied Jesus three times.", answer: "Who is Peter?" },
          { value: 400, question: "Jesus raised this man from the dead after four days.", answer: "Who is Lazarus?" },
          { value: 500, question: "This woman was the first to see Jesus after the resurrection.", answer: "Who is Mary Magdalene?" }
        ]
      },
      {
        name: "Prophets Speak",
        questions: [
          { value: 100, question: "The prophet who was swallowed by a great fish.", answer: "Who is Jonah?" },
          { value: 200, question: "This prophet called down fire from heaven on Mount Carmel.", answer: "Who is Elijah?" },
          { value: 300, question: "The prophet who saw a valley of dry bones come to life.", answer: "Who is Ezekiel?" },
          { value: 400, question: "Isaiah prophesied that the Messiah would be born of a _____.", answer: "What is a virgin?" },
          { value: 500, question: "This minor prophet's book is the shortest in the Old Testament.", answer: "Who is Obadiah?" }
        ]
      },
      {
        name: "Acts & Epistles",
        questions: [
          { value: 100, question: "The event where the Holy Spirit descended like tongues of fire.", answer: "What is Pentecost?" },
          { value: 200, question: "Paul was blinded on the road to this city when he met Jesus.", answer: "What is Damascus?" },
          { value: 300, question: "The first Christian martyr who was stoned to death.", answer: "Who is Stephen?" },
          { value: 400, question: "Paul wrote more books of the New Testament than anyone else — how many?", answer: "What is 13?" },
          { value: 500, question: "The island where Paul was shipwrecked and bitten by a viper without harm.", answer: "What is Malta?" }
        ]
      }
    ]
  },

  mafia: {
    roles: [
      { id: "disciple",     name: "Disciple",      team: "good",    icon: "✝️",  count: 0, description: "A faithful follower with no special power. Seek truth by day and vote wisely." },
      { id: "prophet",      name: "Prophet",       team: "good",    icon: "👁️",  count: 1, description: "Each night you may look into one player's soul and learn if they are Good or Evil." },
      { id: "healer",       name: "Healer",        team: "good",    icon: "🌿",  count: 1, description: "Each night you may protect one person from elimination. You may not protect the same person twice in a row." },
      { id: "judge",        name: "Judge",         team: "good",    icon: "⚖️",  count: 0, description: "Once per game you may block one player from acting at night." },
      { id: "false_prophet",name: "False Prophet", team: "evil",    icon: "🐍",  count: 0, description: "You are the deceiver. Each night the mafia eliminates one faithful player. Blend in by day." },
      { id: "pharaoh",      name: "Pharaoh",       team: "evil",    icon: "👑",  count: 1, description: "Mafia leader. The Prophet's vision is blinded when they look at you — they see 'Good'." },
      { id: "sorcerer",     name: "Sorcerer",      team: "evil",    icon: "🔮",  count: 0, description: "Each night you redirect one player's action to a target of your choosing." },
      { id: "wanderer",     name: "Wanderer",      team: "neutral", icon: "🦅",  count: 0, description: "You have no allegiance. Survive to the final 3 to win — regardless of good or evil." }
    ],
    roleDistribution: {
      5:  { disciple: 2, prophet: 1, false_prophet: 1, pharaoh: 1 },
      6:  { disciple: 3, prophet: 1, false_prophet: 1, pharaoh: 1 },
      7:  { disciple: 3, prophet: 1, healer: 1, false_prophet: 1, pharaoh: 1 },
      8:  { disciple: 4, prophet: 1, healer: 1, false_prophet: 1, pharaoh: 1 },
      9:  { disciple: 4, prophet: 1, healer: 1, false_prophet: 2, pharaoh: 1 },
      10: { disciple: 4, prophet: 1, healer: 1, judge: 1, false_prophet: 2, pharaoh: 1 },
      11: { disciple: 5, prophet: 1, healer: 1, judge: 1, false_prophet: 2, pharaoh: 1 },
      12: { disciple: 5, prophet: 1, healer: 1, judge: 1, false_prophet: 2, pharaoh: 1, sorcerer: 1 }
    }
  },

  taboo: {
    timerSeconds: 60,
    cards: [
      { word: "Moses",         taboo: ["Egypt","Pharaoh","Exodus","Red Sea","Commandments"] },
      { word: "Noah",          taboo: ["Ark","Flood","Animals","Rainbow","Boat"] },
      { word: "David",         taboo: ["Goliath","King","Psalms","Shepherd","Jerusalem"] },
      { word: "Garden of Eden",taboo: ["Adam","Eve","Forbidden","Snake","Tree"] },
      { word: "Passover",      taboo: ["Lamb","Blood","Door","Egypt","Plague"] },
      { word: "Baptism",       taboo: ["Water","John","River","Holy","Immerse"] },
      { word: "Sermon on the Mount", taboo: ["Jesus","Blessed","Beatitudes","Mountain","Teach"] },
      { word: "Manna",         taboo: ["Bread","Desert","Wilderness","Heaven","Food"] },
      { word: "Goliath",       taboo: ["Giant","David","Stone","Philistine","Battle"] },
      { word: "Solomon",       taboo: ["Wisdom","Temple","King","David","Proverbs"] },
      { word: "Jonah",         taboo: ["Whale","Fish","Nineveh","Sea","Swallowed"] },
      { word: "Lazarus",       taboo: ["Dead","Tomb","Jesus","Raised","Sister"] },
      { word: "The Disciples", taboo: ["Twelve","Jesus","Apostles","Follow","Fishermen"] },
      { word: "Jerusalem",     taboo: ["City","Temple","Israel","Holy","David"] },
      { word: "Angel",         taboo: ["Heaven","Wings","God","Message","Messenger"] },
      { word: "Pharaoh",       taboo: ["Egypt","Moses","King","Plague","Slave"] },
      { word: "Covenant",      taboo: ["Promise","God","Abraham","Rainbow","Agreement"] },
      { word: "Prophet",       taboo: ["Message","God","Future","Isaiah","Predict"] },
      { word: "Miracle",       taboo: ["Jesus","Water","Wine","Heal","Power"] },
      { word: "Bethlehem",     taboo: ["Jesus","Birth","Star","Manger","Mary"] },
      { word: "Wilderness",    taboo: ["Desert","Moses","Israel","Forty","Wander"] },
      { word: "The Temple",    taboo: ["Jerusalem","Solomon","God","Worship","Building"] },
      { word: "Sabbath",       taboo: ["Rest","Day","Saturday","Work","Holy"] },
      { word: "Parable",       taboo: ["Story","Jesus","Teach","Lesson","Kingdom"] },
      { word: "Pentecost",     taboo: ["Spirit","Fire","Tongue","Wind","Disciples"] },
      { word: "Elijah",        taboo: ["Prophet","Fire","Chariot","Heaven","Elisha"] },
      { word: "Samson",        taboo: ["Hair","Strong","Delilah","Judge","Philistine"] },
      { word: "Ruth",          taboo: ["Naomi","Boaz","Loyal","Moab","Harvest"] },
      { word: "Esther",        taboo: ["Queen","Persia","Haman","Jewish","King"] },
      { word: "Daniel",        taboo: ["Lion","Den","Babylon","Dream","Furnace"] },
      { word: "Peter",         taboo: ["Rock","Jesus","Deny","Fish","Disciple"] },
      { word: "Paul",          taboo: ["Letters","Damascus","Apostle","Prison","Missionary"] },
      { word: "Abraham",       taboo: ["Isaac","Faith","Promise","Canaan","Father"] },
      { word: "Tower of Babel",taboo: ["Language","Confusion","Build","Sky","Babylon"] },
      { word: "The Ten Plagues",taboo: ["Egypt","Moses","Pharaoh","Frog","Darkness"] },
      { word: "Ten Commandments",taboo: ["Moses","Stone","Law","Sinai","God"] },
      { word: "The Shepherd",  taboo: ["Sheep","David","Psalm","Staff","Flock"] },
      { word: "The Dove",      taboo: ["Noah","Peace","Bird","White","Holy Spirit"] },
      { word: "Sea of Galilee",taboo: ["Jesus","Disciples","Storm","Fish","Walk"] },
      { word: "Jordan River",  taboo: ["Baptism","John","Israel","Water","Joshua"] },
      { word: "Mount Sinai",   taboo: ["Moses","Commandments","Mountain","Fire","God"] },
      { word: "Resurrection",  taboo: ["Alive","Tomb","Jesus","Easter","Death"] },
      { word: "Joseph",        taboo: ["Coat","Egypt","Brothers","Dream","Jacob"] },
      { word: "Rebekah",       taboo: ["Isaac","Well","Bride","Jacob","Esau"] },
      { word: "Pentateuch",    taboo: ["Five","Books","Moses","Torah","Law"] },
      { word: "Philistines",   taboo: ["Goliath","Enemy","David","Samson","Uncircumcised"] },
      { word: "Ark of the Covenant", taboo: ["Gold","Box","Moses","Holy","Temple"] },
      { word: "The Last Supper",taboo: ["Bread","Wine","Betray","Disciples","Jesus"] },
      { word: "Gethsemane",    taboo: ["Garden","Jesus","Pray","Betrayal","Olives"] },
      { word: "Mary Magdalene",taboo: ["Jesus","Woman","Tomb","First","Witness"] },
      { word: "Zacchaeus",     taboo: ["Tree","Short","Tax","Jesus","Jericho"] },
      { word: "Feeding the 5000", taboo: ["Fish","Bread","Loaves","Miracle","Crowd"] },
      { word: "Walking on Water",taboo: ["Jesus","Peter","Storm","Sea","Sink"] },
      { word: "Burning Bush",  taboo: ["Moses","Fire","God","Desert","Flame"] },
      { word: "The Prodigal Son",taboo: ["Father","Return","Pig","Lost","Money"] },
      { word: "Good Samaritan",taboo: ["Help","Road","Wounded","Neighbor","Priest"] },
      { word: "Widow's Mite",  taboo: ["Coin","Poor","Give","Offering","Temple"] },
      { word: "Pentecostal",   taboo: ["Spirit","Fire","Tongues","Church","Wind"] },
      { word: "Nebuchadnezzar",taboo: ["Babylon","King","Daniel","Dream","Furnace"] },
      { word: "Gideon",        taboo: ["Judge","Fleece","Three Hundred","Midian","Trumpet"] },
      { word: "The Nativity",  taboo: ["Baby","Manger","Star","Wise","Shepherd"] }
    ]
  }
};

function loadGameData() {
  try {
    const stored = localStorage.getItem('zionGamesData');
    if (stored) {
      const data = JSON.parse(stored);
      if (!data.taboo) data.taboo = JSON.parse(JSON.stringify(DEFAULT_DATA.taboo));
      // Migrate old mrWhite format (plain strings → word pairs)
      ['easy','medium','hard'].forEach(d => {
        if (Array.isArray(data.mrWhite?.[d]) && typeof data.mrWhite[d][0] === 'string') {
          data.mrWhite[d] = JSON.parse(JSON.stringify(DEFAULT_DATA.mrWhite[d]));
        }
      });
      return data;
    }
  } catch(_) {}
  saveGameData(DEFAULT_DATA);
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function saveGameData(data) {
  try { localStorage.setItem('zionGamesData', JSON.stringify(data)); } catch(_) {}
}

function getGameData() { return loadGameData(); }

function updateMrWhiteWords(difficulty, words) {
  const data = loadGameData();
  data.mrWhite[difficulty] = words;
  saveGameData(data);
}

function updateJeopardyCategories(categories) {
  const data = loadGameData();
  data.jeopardy.categories = categories;
  saveGameData(data);
}

function updateMafiaRoles(roles) {
  const data = loadGameData();
  data.mafia.roles = roles;
  saveGameData(data);
}
