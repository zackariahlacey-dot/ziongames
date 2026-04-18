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
    finalJeopardy: {
      category: "Scripture & Prophecy",
      question: "This prophet, swallowed by a great fish after fleeing God's command, ultimately brought an entire pagan city to repentance — the largest revival in the Old Testament.",
      answer: "Who is Jonah?"
    },
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
      //        Good roles                              Evil roles                     Neutral   Evil%
      5:  { disciple: 3, prophet: 1,                   pharaoh: 1                                     }, // 4G 1E  — 20%
      6:  { disciple: 3, prophet: 1, healer: 1,        pharaoh: 1                                     }, // 5G 1E  — 17%
      7:  { disciple: 4, prophet: 1, healer: 1,        pharaoh: 1                                     }, // 6G 1E  — 14%
      8:  { disciple: 3, prophet: 1, healer: 1, judge: 1, false_prophet: 1, pharaoh: 1                }, // 6G 2E  — 25%
      9:  { disciple: 4, prophet: 1, healer: 1, judge: 1, false_prophet: 1, pharaoh: 1                }, // 7G 2E  — 22%
      10: { disciple: 4, prophet: 1, healer: 1, judge: 1, false_prophet: 1, pharaoh: 1, wanderer: 1   }, // 7G 2E 1N — 20%
      11: { disciple: 4, prophet: 1, healer: 1, judge: 1, false_prophet: 2, pharaoh: 1, wanderer: 1   }, // 7G 3E 1N — 27%
      12: { disciple: 5, prophet: 1, healer: 1, judge: 1, false_prophet: 2, pharaoh: 1, wanderer: 1   }  // 8G 3E 1N — 25%
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
  },

  charades: {
    easy: [
      { act: "Noah building the Ark", hint: "Hammering giant planks of wood while confused neighbors watch" },
      { act: "David vs Goliath", hint: "A small shepherd swinging a sling at a massive warrior" },
      { act: "Moses parting the Red Sea", hint: "Arms raised wide, water splitting on both sides" },
      { act: "Jesus walking on water", hint: "Stepping calmly across waves, then a friend starts sinking" },
      { act: "Jonah inside the whale", hint: "Cramped inside a giant stomach, praying in the dark" },
      { act: "The Last Supper", hint: "Thirteen people at a long table, bread and a cup being passed" },
      { act: "Jesus feeding 5000", hint: "One small lunch basket, enormous crowd, food multiplying" },
      { act: "Moses receiving the Ten Commandments", hint: "Climbing a mountain, lightning, coming down with two heavy stone tablets" },
      { act: "Daniel in the lion's den", hint: "Surrounded by lions that won't touch you, praying calmly" },
      { act: "Zacchaeus climbing a tree", hint: "A very short man scrambling up a sycamore to see over the crowd" },
      { act: "Adam and Eve hiding from God", hint: "Covering yourself with leaves, cowering behind bushes, hearing footsteps" },
      { act: "Joseph and his coat of many colors", hint: "Showing off a spectacular rainbow-colored robe to jealous siblings" },
      { act: "Jesus riding a donkey into Jerusalem", hint: "Bouncing on a small animal while people wave branches" },
      { act: "Samson pushing down the pillars", hint: "Arms spread wide between two columns, pushing with everything left" },
      { act: "Peter denying Jesus three times", hint: "Asked the same question three times, backing away each time" }
    ],
    hard: [
      { act: "Ezekiel's vision of the wheels", hint: "Spinning wheels within wheels, covered in eyes, beside a river — total confusion" },
      { act: "Elijah taken up in a chariot of fire", hint: "Grabbed into a flaming horse-drawn vehicle disappearing into the sky" },
      { act: "The handwriting on the wall at Belshazzar's feast", hint: "Partying stops as a floating hand writes mysterious words on the wall" },
      { act: "Gideon laying out a fleece", hint: "Putting a wool cloth on the ground at night, checking it for dew in the morning" },
      { act: "Elisha and the floating axe head", hint: "Axe falls in the river, throw in a stick, iron floats up" },
      { act: "Ananias and Sapphira falling dead", hint: "Lie told, money placed down, dramatic collapse — then your spouse does the same thing" },
      { act: "Paul and Silas singing in prison at midnight", hint: "Chained in a dungeon, singing hymns, earthquake shakes everything open" },
      { act: "Joshua making the sun stand still", hint: "Fighting a battle, pointing at the sky, commanding the sun to freeze" },
      { act: "Philip teleported after baptizing the Ethiopian", hint: "Walk out of the water, suddenly standing somewhere completely different" },
      { act: "Ezekiel prophesying to dry bones", hint: "Speaking to a field of scattered bones as they rattle, reconnect, and stand up" },
      { act: "The Valley of Dry Bones coming to life", hint: "Bones shaking, connecting, flesh appearing, an army of the dead breathing again" },
      { act: "Elisha mocking the prophets of Baal on Mt. Carmel", hint: "Cupping your ear, maybe your god is sleeping or on a journey?" },
      { act: "John writing Revelation on the island of Patmos", hint: "Alone on a rocky island, writing frantically about dragons and visions" },
      { act: "Balaam's donkey refusing to move and talking back", hint: "Kicking an animal that stops, sits down, and then begins a calm conversation" },
      { act: "The stoning of Stephen while looking into heaven", hint: "Rocks being thrown, kneeling, looking up at a bright opening in the sky" }
    ],
    funny: [
      { act: "Jonah sulking under the plant after Nineveh repents", hint: "City saved, everyone happy — you alone under a dead plant, deeply offended" },
      { act: "Peter cutting off the soldier's ear", hint: "Wild sword swing in total panic, small piece of ear on the ground, Jesus sighs" },
      { act: "David dancing wildly before the Lord", hint: "Full uninhibited celebration dancing in front of a crowd — no dignity whatsoever" },
      { act: "Disciples arguing about who is the greatest", hint: "Group of adults pointing at themselves, each insisting they are the most important" },
      { act: "Elijah mocking the prophets of Baal", hint: "Baal not answering — maybe he's in the bathroom? Shout louder!" },
      { act: "Zacchaeus scrambling up a tree to see Jesus", hint: "Very short man desperately climbing a tree, then Jesus calls him down" },
      { act: "Jesus asking who touched him in a huge crowd", hint: "Surrounded by jostling people, sincerely asking who specifically touched his robe" },
      { act: "Paul accidentally preaching until Eutychus falls asleep and out a window", hint: "Very long sermon, audience member asleep in window frame, suddenly gone" },
      { act: "Jacob impersonating Esau with hairy arms", hint: "Tying goat fur to your arms to trick your nearly-blind father" },
      { act: "Eli thinking Hannah was drunk in the temple", hint: "Woman praying silently with moving lips — priest goes over to confront her about drinking" },
      { act: "Noah explaining the ark to his neighbors", hint: "Pointing to the sky, pointing to blueprints, neighbors laughing and walking away" },
      { act: "The disciples waking Jesus during the storm", hint: "Boat going sideways, crew panicking, someone peacefully asleep below — go wake him!" },
      { act: "Balaam arguing with his talking donkey", hint: "Heated argument with an animal who has a better point than you do" },
      { act: "Jesus turning water into wine at a wedding — running out would have been embarrassing", hint: "Party running dry, wedding host panicking, enormous stone jars of water" },
      { act: "Peter sinking after walking on water", hint: "Confident first steps, looks down, instant panic, gurgling below the surface" }
    ],
    serious: [
      { act: "Jesus praying in Gethsemane", hint: "Kneeling alone in a garden, sweating, pleading — friends asleep nearby" },
      { act: "Abraham about to sacrifice Isaac", hint: "Father with knife raised over his bound son, frozen — then a sound behind him" },
      { act: "Jesus carrying the cross", hint: "Stumbling under an enormous weight through a jeering crowd" },
      { act: "Mary finding the empty tomb", hint: "Running to a sealed rock, finding it open, grave clothes folded, no body" },
      { act: "Job sitting in ashes", hint: "Everything lost — family, wealth, health — sitting in ruins, scraping wounds" },
      { act: "Stephen being stoned while looking up at heaven", hint: "Kneeling under a hail of stones, face peaceful, eyes fixed upward" },
      { act: "Jesus weeping at Lazarus's tomb", hint: "Standing before a sealed cave, overcome with grief, tears falling" },
      { act: "Joseph forgiving his brothers in Egypt", hint: "Powerful man breaking down sobbing in front of the people who sold him" },
      { act: "Ruth saying 'Where you go I will go'", hint: "Two women at a crossroads, one turning back, one refusing to leave" },
      { act: "The Prodigal Son returning home", hint: "Ragged, humiliated, rehearsing a speech — then a father running toward you from a distance" },
      { act: "Peter weeping after denying Jesus", hint: "The rooster crows, eyes meet across the courtyard, going outside to weep bitterly" },
      { act: "Elijah burned out under the juniper tree", hint: "Prophet alone in the wilderness, exhausted, asking to die" },
      { act: "Hannah praying desperately for a child", hint: "Silent, shaking, weeping prayer in the temple — priest thinks you're drunk" },
      { act: "Moses saying farewell to the Israelites before death", hint: "Old man on a mountain, speaking final words to a nation he can't cross into the Promised Land with" },
      { act: "The Crucifixion", hint: "Arms wide, lifted up, the sky turning dark at midday" }
    ],
    miracles: [
      { act: "Jesus turning water into wine", hint: "Six stone jars of water, one taste, everyone looks surprised" },
      { act: "Moses turning his staff into a snake", hint: "Throw a walking stick on the ground — it writhes and hisses" },
      { act: "Elisha multiplying the widow's oil", hint: "One small jar, pouring into every empty vessel in the house — it never runs out" },
      { act: "Jesus healing a leper", hint: "Touch someone marked unclean — skin immediately restored before everyone's eyes" },
      { act: "Jesus calming the storm", hint: "Stand up in a rocking boat, speak to the wind and waves, instant silence" },
      { act: "Moses striking the rock for water", hint: "Desert, dying of thirst, strike a rock — water gushes out" },
      { act: "The walls of Jericho falling", hint: "Marching in silence for seven days then everyone shouts at once — walls collapse" },
      { act: "Jesus raising Lazarus from the dead", hint: "Standing at a sealed tomb, shouting a name — a wrapped figure shuffles out" },
      { act: "The burning bush that wouldn't burn up", hint: "A bush on fire that is not being destroyed — take off your sandals, holy ground" },
      { act: "Peter's shadow healing the sick", hint: "Walking through a street while sick people are laid out — shadow passes over them" },
      { act: "Elijah calling fire from heaven", hint: "Water-soaked altar, prayer to God — lightning bolt from a clear sky" },
      { act: "The floating axe head", hint: "Iron axe handle, river, throw a stick in — iron floats up" },
      { act: "Feeding 5000 with 5 loaves and 2 fish", hint: "Small boy's lunch in a basket, pass it around — five thousand people fed" },
      { act: "Paul healing a lame man at Lystra", hint: "A man who has never walked in his life suddenly leaping to his feet" },
      { act: "Jesus restoring the severed ear", hint: "Reach down, pick up an ear, put it back — good as new" }
    ],
    parables: [
      { act: "The Prodigal Son returning home", hint: "Filthy, broke, rehearsing a speech about being unworthy — father sprinting toward you" },
      { act: "The Good Samaritan helping the wounded man", hint: "Everyone else passing by on the other side — unexpected person stops and helps" },
      { act: "The Lost Sheep found by the shepherd", hint: "Leaving 99 sheep to search alone for one wandering one — carrying it home on shoulders" },
      { act: "The Sower casting seeds", hint: "Scattering seeds everywhere — path, rocks, thorns, good soil — watching what grows" },
      { act: "The Mustard Seed growing into a tree", hint: "Tiniest seed imaginable, planted, becomes enormous tree with birds in the branches" },
      { act: "The Talents — servant burying coins", hint: "Digging a hole, wrapping coins in cloth, burying them, patting down the dirt" },
      { act: "The Ten Virgins — foolish ones with empty lamps", hint: "Midnight, bridegroom coming, frantically shaking a lamp with no oil" },
      { act: "The Pharisee and Tax Collector praying", hint: "One praying with arms wide and chin up — one barely able to look up, beating chest" },
      { act: "The Lost Coin — woman sweeping the whole house", hint: "On hands and knees with a broom, searching every corner for one small coin" },
      { act: "The Rich Fool building bigger barns", hint: "Pointing proudly at overflowing barns, planning bigger ones, then suddenly falling dead" },
      { act: "The Unmerciful Servant choking his debtor", hint: "Just forgiven an enormous debt — immediately grabbing a fellow servant by the throat" },
      { act: "The Workers in the Vineyard complaining about equal pay", hint: "Worked all day in the heat, watching latecomers get the same wages" },
      { act: "The Pearl of Great Price", hint: "Merchant finds one perfect pearl — sells literally everything to buy it" },
      { act: "The Wise Builder on the rock", hint: "Two builders — one on solid rock, one on sand — storm comes and one house stands" },
      { act: "The Wedding Banquet — guests making excuses", hint: "Phone calls of refusal: I bought a field, I bought oxen, I got married" }
    ],
    animals: [
      { act: "Jonah's whale swallowing him", hint: "Giant mouth opening, person swallowed whole, darkness, stomach walls" },
      { act: "Balaam's donkey talking back calmly", hint: "Stubborn animal stopping, sitting down, turning its head and starting a rational conversation" },
      { act: "Daniel's lions refusing to eat him", hint: "Lions pacing around a man all night — sniffing, then lying down without touching him" },
      { act: "Noah's dove returning with an olive branch", hint: "Small bird launched from a window, returns hours later with a tiny green leaf" },
      { act: "Elijah's ravens bringing food", hint: "Sitting by a brook in the wilderness as black birds keep arriving with bread and meat" },
      { act: "The serpent tempting Eve in the Garden", hint: "Coiled in a tree, persuasive, smooth, offering something that looks delicious" },
      { act: "Samson killing a lion with bare hands", hint: "Young man alone on a road, lion leaps — torn apart like a young goat" },
      { act: "The dove descending on Jesus at baptism", hint: "Coming up from the water, bird descending gently from the sky" },
      { act: "Elisha and the two bears from the forest", hint: "Mocking a bald man, then the sound of something large coming out of the trees" },
      { act: "The Passover lamb being slaughtered", hint: "Perfect lamb, no blemish, blood painted on doorposts with a branch" },
      { act: "Peter's rooster crowing the third time", hint: "Denying someone, turning, the rooster crowing — locking eyes across the courtyard" },
      { act: "Moses' staff becoming a snake before Pharaoh", hint: "Dramatic court scene, staff thrown down, it coils and hisses before the king" },
      { act: "Sheep and goats separated at the judgment", hint: "Massive flock divided: one group to the right, one to the left" },
      { act: "Jonah's shade plant growing and dying overnight", hint: "Plant appears instantly overnight — you're thrilled — worm kills it by morning, furious" },
      { act: "The camel through the eye of a needle", hint: "Pushing an enormous animal toward a tiny tiny hole — impossible" }
    ],
    oldTestament: [
      { act: "Moses parting the Red Sea", hint: "Arms raised wide, towering walls of water on both sides, walking through on dry ground" },
      { act: "Samson pushing down the temple pillars", hint: "Blind, chained, feeling for columns, final prayer, pushing with everything left" },
      { act: "David playing the harp for troubled King Saul", hint: "Playing gentle music while a king sits hunched and trembling" },
      { act: "Joshua marching around Jericho in silence", hint: "Seven days of silent marching in a circle, then one massive shout" },
      { act: "Elijah challenging 450 prophets of Baal on Mount Carmel", hint: "Long dramatic contest — their altar silent, your altar on fire" },
      { act: "Joseph interpreting Pharaoh's dream", hint: "Seven fat cows, seven skinny cows — standing before Pharaoh explaining what it means" },
      { act: "Esther approaching the king uninvited", hint: "Walking slowly toward a throne, orb extended, everything on the line" },
      { act: "Ruth gleaning grain in Boaz's field", hint: "Following harvesters, picking up what they leave, back bent under hot sun" },
      { act: "Gideon's 300 breaking jars and blowing trumpets", hint: "Midnight, surround the enemy camp, smash your torch jar, blow the horn, shout" },
      { act: "Solomon proposing to cut the baby in half", hint: "King raising a sword — one woman screams stop, one says go ahead" },
      { act: "Jeremiah thrown into a cistern in the mud", hint: "Lowered by ropes into a muddy pit, sinking slowly" },
      { act: "The spies carrying a cluster of grapes", hint: "Two men carrying a single grape cluster on a pole between them — enormous" },
      { act: "Shadrach, Meshach and Abednego in the fiery furnace", hint: "Thrown in, the fire doesn't touch you — and someone else is in there too" },
      { act: "Nehemiah rebuilding the walls while enemies mock", hint: "One hand building, other hand on a sword, ignoring jeers" },
      { act: "Elijah fleeing from Jezebel in exhaustion", hint: "Running through the wilderness, collapsing under a tree, too tired to go on" }
    ],
    newTestament: [
      { act: "Jesus baptized in the Jordan River", hint: "Water, dove descending, voice from the sky — everything begins here" },
      { act: "Peter walking on water then sinking", hint: "Confident first steps, looks down, eyes widen, immediately going under" },
      { act: "The Transfiguration", hint: "Jesus glowing like the sun on a mountain, Moses and Elijah on either side, disciples falling down" },
      { act: "Jesus overturning the money changers' tables", hint: "Tables flying, coins scattering, animals loose, everyone running" },
      { act: "Paul's blinding conversion on the road to Damascus", hint: "Riding confidently, knocked to the ground, blinded by blazing light, hearing a voice" },
      { act: "Pentecost — tongues of fire on each disciple", hint: "Waiting in an upper room, rushing wind, small flames appearing above each head" },
      { act: "Jesus washing the disciples' feet", hint: "Getting on your knees with a basin and towel, washing each foot — disciples protesting" },
      { act: "Mary pouring costly perfume on Jesus's feet", hint: "Breaking open a precious jar, pouring it over someone's feet, wiping with your hair" },
      { act: "The wise men following the star", hint: "Travelling by night, eyes fixed upward on one moving star" },
      { act: "Jesus appearing to Mary Magdalene at the tomb", hint: "Weeping at an empty tomb, turning to see someone you think is the gardener" },
      { act: "Saul throwing Christians in prison before his conversion", hint: "Dragging families out of their homes with great confidence and zeal" },
      { act: "Peter escaping prison with an angel", hint: "Chains falling off in your sleep, angel leading you past guards who don't see you" },
      { act: "Paul shipwrecked on Malta — bitten by a viper", hint: "Survived a shipwreck, gathering firewood, snake latches onto your hand — you shake it off" },
      { act: "Cornelius receiving the Holy Spirit unexpectedly", hint: "Roman soldier listening to a sermon — suddenly everyone starts speaking in tongues" },
      { act: "John exiled alone on Patmos writing Revelation", hint: "Rocky island, completely alone, writing page after page of visions — dragons, angels, thrones" }
    ],
    prophets: [
      { act: "Jonah boarding a ship to flee from God", hint: "Paying full fare, going below deck, trying very hard to look casual" },
      { act: "Elijah calling fire from heaven on Mt. Carmel", hint: "Soaked altar, kneel, pray — fire falls from a clear sky" },
      { act: "Isaiah walking barefoot and naked as a prophetic sign", hint: "Three years of this. No shoes. That's the message." },
      { act: "Jeremiah buying a field as Jerusalem falls to Babylon", hint: "City on fire, enemies at the gates — signing a property deed" },
      { act: "Ezekiel lying on his left side for 390 days straight", hint: "Set up like a piece of furniture, unmoving, for over a year" },
      { act: "Elisha mocking the Baal prophets who keep praying", hint: "Watching a group shout and cut themselves for hours — maybe he's on vacation?" },
      { act: "Hosea marrying an unfaithful woman as God commanded", hint: "Wedding, devoted, she leaves, you go find her and bring her back anyway" },
      { act: "Daniel refusing the king's food in Babylon", hint: "Pushing away royal food, politely requesting vegetables and water instead" },
      { act: "Isaiah seeing the seraphim and declaring himself unclean", hint: "Six-winged creatures, the throne, smoke filling the room — falling on your face shouting 'woe is me'" },
      { act: "Amos confronting Israel at the temple gates", hint: "Shepherd from the south, shows up uninvited at the king's sanctuary, starts pointing and preaching" },
      { act: "John the Baptist eating locusts and wild honey in the wilderness", hint: "Long hair, camel skin clothing, catching locusts, dipping them in honey" },
      { act: "Zechariah having a vision of a flying scroll", hint: "Massive rolled-up document floating through the air — that's the curse" },
      { act: "Haggai urging the people to stop building their own houses first", hint: "Pointing at fancy homes, pointing at the empty temple site, pointing at heaven" },
      { act: "Micah weeping and wailing in the streets like an owl", hint: "Prophet walking through town howling and shrieking as a prophetic act" },
      { act: "Elisha asking for a double portion of Elijah's spirit", hint: "Two men walking together, one about to disappear, asking for something impossible" }
    ]
  },

  twentyQuestions: {
    people: [
      { name: "Moses", description: "The prophet who led Israel out of Egypt", facts: ["I never entered the Promised Land", "I spoke to God face to face on a mountain", "I lived to be exactly 120 years old"] },
      { name: "David", description: "Shepherd, warrior, king, and poet of Israel", facts: ["I killed a giant with a sling and a stone", "I wrote most of the Psalms", "My most famous sin involved a woman named Bathsheba"] },
      { name: "Abraham", description: "The father of the Jewish, Christian, and Islamic faiths", facts: ["God asked me to sacrifice my only son", "I was 100 when my promised son was born", "I came from a city called Ur of the Chaldeans"] },
      { name: "Noah", description: "The man who survived the great flood", facts: ["I built a boat bigger than a football field", "I was 600 years old when the flood came", "A dove brought me an olive leaf to signal the water was receding"] },
      { name: "Joseph", description: "Son of Jacob who rose from slavery to second in command of Egypt", facts: ["My brothers sold me for 20 pieces of silver", "I interpreted Pharaoh's dream about cows and grain", "My father gave me a very special coat"] },
      { name: "Peter", description: "The fisherman who became the rock of the early church", facts: ["I walked on water — briefly", "I denied Jesus three times on the night of his arrest", "I was crucified upside down, by my own request"] },
      { name: "Paul", description: "The apostle who wrote most of the New Testament", facts: ["I used to arrest and kill Christians before I became one", "I was blinded for three days when Jesus appeared to me", "I was shipwrecked at least three times"] },
      { name: "Samson", description: "The strongest man in the Bible, who was a judge of Israel", facts: ["My power came from my hair, which I never cut", "A woman named Delilah was my downfall", "I killed a lion with my bare hands on the way to a wedding"] },
      { name: "Elijah", description: "The prophet of fire who was taken to heaven without dying", facts: ["Ravens brought me food in the wilderness", "I called fire from heaven to beat 450 prophets of Baal", "God spoke to me not in wind or fire but in a still small voice"] },
      { name: "Daniel", description: "The prophet who stayed faithful in Babylon", facts: ["I survived a night in a den of lions", "I interpreted King Nebuchadnezzar's dreams", "I refused the king's food and ate only vegetables"] },
      { name: "Esther", description: "A Jewish girl who became queen of Persia and saved her people", facts: ["I approached the king uninvited, which was punishable by death", "My cousin Mordecai raised me after my parents died", "My enemy was a man named Haman who built gallows for my cousin"] },
      { name: "Ruth", description: "A Moabite woman whose loyalty became one of the great love stories of Scripture", facts: ["I left my homeland to stay with my mother-in-law", "I gleaned grain in the fields of a man named Boaz", "I am an ancestor of both King David and Jesus"] },
      { name: "Solomon", description: "The wisest man who ever lived, and builder of the first Temple", facts: ["God appeared to me in a dream and offered me anything I wanted", "I am famous for settling a dispute between two women over a baby", "I wrote Proverbs, Ecclesiastes, and Song of Solomon"] },
      { name: "John the Baptist", description: "The prophet who prepared the way for Jesus", facts: ["I ate locusts and wild honey in the wilderness", "I baptized Jesus in the Jordan River", "My head was given as a gift to a dancing girl at a birthday party"] },
      { name: "Mary Magdalene", description: "A devoted follower of Jesus who was the first witness of the resurrection", facts: ["Jesus drove seven demons out of me", "I was at the cross when the disciples had fled", "I mistook Jesus for the gardener when I saw him risen"] }
    ],
    places: [
      { name: "Jerusalem", description: "The holy city of Israel and site of the Temple", facts: ["Two temples were built here — both destroyed", "Jesus was crucified just outside my walls", "David conquered me and made me his capital"] },
      { name: "Bethlehem", description: "The small town where two great Israelites were born", facts: ["King David was born here", "Jesus was born here in a manger", "My name means 'house of bread'"] },
      { name: "Egypt", description: "The great kingdom where Israel was enslaved for 400 years", facts: ["Joseph rose to second in command here", "Moses led a nation of people out of me", "Ten plagues were sent against me"] },
      { name: "Garden of Eden", description: "The first home God prepared for humanity", facts: ["A serpent deceived my inhabitants", "A cherub with a flaming sword guards my entrance", "Two special trees stood at my center"] },
      { name: "Mount Sinai", description: "The mountain where God met Moses and gave the Law", facts: ["Moses spent 40 days here receiving commandments", "Fire and thick smoke covered me when God descended", "Elijah also fled here when burned out and afraid"] },
      { name: "Jericho", description: "The fortified city that fell without a single sword swing", facts: ["Israel marched around me for seven days in silence", "My walls collapsed at a shout and the sound of trumpets", "A woman named Rahab hid spies in her house here and was saved"] },
      { name: "Nineveh", description: "The great Assyrian capital that God wanted to save", facts: ["Jonah was sent to warn me and really didn't want to go", "My people repented in sackcloth and ashes", "I had more than 120,000 people who didn't know their right hand from their left"] },
      { name: "Babylon", description: "The empire that conquered Jerusalem and exiled the Israelites", facts: ["Daniel served in my royal court", "Shadrach, Meshach and Abednego were thrown into my furnace", "Mysterious handwriting appeared on one of my walls"] },
      { name: "Sea of Galilee", description: "The freshwater lake where Jesus spent most of his ministry", facts: ["Jesus walked on top of me", "Jesus calmed a violent storm on me", "Most of the disciples were fishermen on my waters"] },
      { name: "Jordan River", description: "The river that marks the boundary of the Promised Land", facts: ["Israel crossed me on dry ground, just like the Red Sea", "Jesus was baptized in me by John the Baptist", "Elijah and Elisha both parted me by striking it with a cloak"] },
      { name: "Bethany", description: "A village just outside Jerusalem where Jesus had close friends", facts: ["Lazarus was raised from the dead here after four days", "Mary and Martha lived here", "Jesus often stayed here when visiting Jerusalem"] },
      { name: "Gethsemane", description: "The garden where Jesus prayed before his arrest", facts: ["Jesus sweat drops of blood here in anguish", "Three disciples fell asleep here while Jesus prayed", "Judas led soldiers here to betray Jesus with a kiss"] },
      { name: "The Red Sea", description: "The body of water God parted for Israel's escape from Egypt", facts: ["An entire nation walked through me on dry ground", "Pharaoh's army drowned in me trying to follow", "Moses stretched his hand over me and the waters divided"] },
      { name: "Nazareth", description: "The small town where Jesus grew up", facts: ["People said nothing good could come from me", "Jesus was rejected in my synagogue by his own hometown", "Mary and Joseph lived here before traveling to Bethlehem"] },
      { name: "Patmos", description: "A small rocky island in the Aegean Sea", facts: ["The apostle John was exiled here", "The book of Revelation was written here", "I am where the vision of the seven churches began"] }
    ],
    objects: [
      { name: "Noah's Ark", description: "The massive wooden vessel that saved creation from the flood", facts: ["I was about 450 feet long — larger than a football field", "God gave Noah my exact measurements", "I came to rest on the mountains of Ararat"] },
      { name: "Ark of the Covenant", description: "The golden chest holding the tablets of God's law", facts: ["Two golden cherubim spread their wings over my top", "Uzzah was struck dead for touching me without authorization", "The Philistines captured me, and disaster followed wherever I went"] },
      { name: "The Burning Bush", description: "The fire that consumed nothing — where God first spoke to Moses", facts: ["I burned but did not burn up", "God told Moses to remove his sandals here — holy ground", "I was located on the mountain of God, Horeb"] },
      { name: "Moses' Staff", description: "The simple shepherd's rod that God used for great miracles", facts: ["I became a serpent before Pharaoh, swallowing the Egyptian staffs", "Moses struck the Red Sea with me and it parted", "Moses struck a rock with me and water gushed out"] },
      { name: "David's Sling", description: "The simple weapon that changed history", facts: ["I launched a single stone that hit Goliath in the forehead", "David chose five smooth stones from a stream before the fight", "After the kill, David used Goliath's own sword to finish the job"] },
      { name: "The Ten Commandments", description: "The stone tablets engraved by God's own finger", facts: ["Moses smashed the first set in anger when he saw the golden calf", "God wrote a second set after Moses prepared new stone tablets", "I was stored inside the Ark of the Covenant"] },
      { name: "Samson's Hair", description: "The source of the world's most famous supernatural strength", facts: ["I was never cut from the day of Samson's birth", "Delilah cut me off while Samson slept", "When I grew back in prison, Samson's strength returned one final time"] },
      { name: "Joseph's Coat", description: "The multi-colored robe that started a family feud", facts: ["Jacob gave me to Joseph to show he was the favorite son", "Samson's brothers stripped it off him and dipped me in goat's blood", "I was used as false evidence that a wild animal had killed Joseph"] },
      { name: "The Star of Bethlehem", description: "The celestial sign that led the magi to the newborn king", facts: ["Wise men from the east followed me across a great distance", "King Herod asked the magi to report back to him about me", "I stopped and stood over the exact place where Jesus was"] },
      { name: "The Crown of Thorns", description: "The mock crown placed on Jesus before the crucifixion", facts: ["Roman soldiers pressed me onto Jesus's head in mockery", "I was meant to humiliate — they called him 'King of the Jews'", "My image has become one of the most recognized symbols in history"] },
      { name: "The Forbidden Fruit", description: "The fruit from the one tree God commanded Adam and Eve not to eat", facts: ["The serpent told Eve it would make her like God, knowing good and evil", "Eve saw I was pleasing to the eyes and desirable for gaining wisdom", "Eating me changed everything — for all of humanity"] },
      { name: "Gideon's Fleece", description: "The wool Gideon used to test God's will before going to battle", facts: ["First test: I was wet, ground dry. Second test: I was dry, ground wet.", "God graciously agreed to both tests", "After this confirmation, Gideon reduced his army from 32,000 to 300"] },
      { name: "Elijah's Mantle", description: "The prophet's cloak that became a symbol of God's power", facts: ["Elijah struck the Jordan River with me and the water parted", "When Elijah was taken to heaven, I fell from him", "Elisha picked me up, struck the river, and it parted again"] },
      { name: "The Widow's Two Mites", description: "The smallest coins given as the greatest offering", facts: ["Worth less than a penny", "Jesus watched from across the temple courtyard", "He said this woman gave more than all the rich because she gave everything she had"] },
      { name: "Goliath's Sword", description: "The massive weapon that ended up in unexpected hands", facts: ["David used it to cut off Goliath's own head after the stone knocked him down", "It was later kept at the tabernacle in Nob, wrapped in cloth", "David retrieved me when fleeing from Saul — the priest gave it to him"] }
    ],
    events: [
      { name: "The Creation", description: "God making everything from nothing in six days", facts: ["Light was made on day one, but the sun and moon not until day four", "Humans were made last, on day six", "God rested on the seventh day and declared it holy"] },
      { name: "The Fall of Man", description: "The moment humanity's relationship with God was broken", facts: ["A serpent convinced Eve the fruit would make her wise like God", "Adam and Eve hid from God and sewed fig leaves together for clothing", "God made them garments of animal skin before expelling them"] },
      { name: "The Great Flood", description: "Forty days of rain that covered the entire earth", facts: ["Only eight humans survived — Noah, his wife, three sons, and their wives", "The rain came from above and water also burst from underground springs", "A rainbow became the sign of God's promise never to flood the earth again"] },
      { name: "The Exodus from Egypt", description: "Israel's dramatic escape from 400 years of slavery", facts: ["Ten plagues preceded the departure", "Pharaoh's army chased Israel to the Red Sea", "Six hundred thousand men left, plus women and children"] },
      { name: "The Giving of the Ten Commandments", description: "God speaking his law directly to a nation at a mountain", facts: ["Moses was on the mountain for 40 days", "The people were so terrified they begged Moses to go instead of them", "The first set of tablets were smashed by Moses when he saw the golden calf"] },
      { name: "The Fall of Jericho", description: "The city whose walls fell without a single weapon used", facts: ["Israel marched in silence for six days, seven priests with rams' horns leading", "On day seven they marched seven times, then blew the trumpets and shouted", "Only Rahab's household was spared because she had hidden the spies"] },
      { name: "The Crucifixion", description: "The death of Jesus on a Roman cross outside Jerusalem", facts: ["The sky turned dark from noon to three in the afternoon", "The temple curtain tore from top to bottom at the moment of death", "Jesus was buried in a tomb belonging to Joseph of Arimathea"] },
      { name: "The Resurrection", description: "Jesus rising from the dead on the third day", facts: ["The stone was rolled away by an angel whose appearance was like lightning", "Mary Magdalene was the first to see the risen Jesus", "Jesus appeared to over 500 people before ascending to heaven"] },
      { name: "Pentecost", description: "The outpouring of the Holy Spirit on the early church", facts: ["A sound like a rushing mighty wind filled the house", "Tongues of fire appeared on each person present", "Three thousand people were added to the church that same day"] },
      { name: "The Tower of Babel", description: "Humanity's attempt to build a tower to heaven", facts: ["Before this, all people spoke one language", "God confused the languages so people could not understand each other", "The city was named Babel because God confused speech there"] },
      { name: "David kills Goliath", description: "A teenage shepherd defeating the Philistines' greatest warrior", facts: ["Goliath taunted Israel every morning for forty days", "David refused the king's armor — it didn't fit", "He picked five smooth stones from a stream, but only needed one"] },
      { name: "The Last Supper", description: "Jesus's final meal with his disciples before the crucifixion", facts: ["Jesus washed all twelve disciples' feet before eating", "Jesus said one person at the table would betray him", "This meal is the origin of communion / the Lord's Supper"] },
      { name: "Paul's Conversion on the Road to Damascus", description: "The moment the greatest persecutor became the greatest apostle", facts: ["A blinding light knocked Paul to the ground", "He heard a voice saying 'Why are you persecuting me?'", "He was blind for three days and neither ate nor drank"] },
      { name: "The Transfiguration", description: "The moment Jesus's divine glory was revealed on a mountain", facts: ["Moses and Elijah appeared and spoke with Jesus", "Jesus's face shone like the sun, his clothes became dazzling white", "A voice from a cloud said 'This is my Son, whom I love — listen to him'"] },
      { name: "The Feeding of the Five Thousand", description: "The miracle where a small boy's lunch fed an enormous crowd", facts: ["A young boy offered 5 loaves of bread and 2 fish", "Jesus blessed the food, broke it, and distributed it through the disciples", "Twelve baskets of leftover food were collected after everyone was full"] }
    ],
    parables: [
      { name: "The Prodigal Son", description: "A father's love for a son who wasted everything and came back", facts: ["The younger son asked for his inheritance before his father was even dead", "He ended up feeding pigs and envying their food", "While he was still a great way off, his father saw him and ran to meet him"] },
      { name: "The Good Samaritan", description: "The story that defined 'neighbor' forever", facts: ["A man was beaten and left for dead on the road to Jericho", "A priest and a Levite both passed by without helping", "The Samaritans were despised by the Jews — making the hero unexpected"] },
      { name: "The Lost Sheep", description: "A shepherd who leaves ninety-nine to rescue one", facts: ["There is more rejoicing in heaven over one sinner who repents than ninety-nine who don't need to", "The shepherd carries the found sheep home on his shoulders", "Jesus told this parable in response to the Pharisees complaining he ate with sinners"] },
      { name: "The Sower and the Seeds", description: "Four types of soil representing four responses to God's word", facts: ["Seeds on the path were eaten by birds immediately", "Seeds on rocky ground grew fast but withered without roots", "Seeds in good soil produced a harvest of 30, 60, or 100 times what was sown"] },
      { name: "The Ten Virgins", description: "Five who were prepared and five who were not", facts: ["They were waiting for a bridegroom who came at midnight", "The foolish five had lamps but no extra oil", "The door was shut before the latecomers returned — 'I don't know you'"] },
      { name: "The Talents", description: "What you do with what God gives you matters", facts: ["One servant received five talents, one two, one one", "The five-talent and two-talent servants doubled what they had", "The one-talent servant buried his and was severely judged for it"] },
      { name: "The Mustard Seed", description: "The smallest beginning producing the greatest result", facts: ["The mustard seed is described as the smallest of all seeds", "It grows into the largest of garden plants — large enough for birds to nest in", "Jesus used this to explain how the kingdom of heaven grows"] },
      { name: "The Pharisee and the Tax Collector", description: "Two prayers — only one was heard", facts: ["The Pharisee thanked God he was not like other sinners", "The tax collector couldn't even look up, just beat his chest saying 'God, have mercy on me'", "Jesus said the tax collector — not the Pharisee — went home justified"] },
      { name: "The Rich Man and Lazarus", description: "A beggar and a wealthy man — their fates reversed after death", facts: ["Lazarus lay at the rich man's gate covered in sores", "Angels carried Lazarus to Abraham's side", "The rich man begged Abraham to send Lazarus to warn his five brothers"] },
      { name: "The Unmerciful Servant", description: "Forgiven a fortune, refused to forgive a penny", facts: ["The servant owed his master ten thousand talents — an unpayable amount", "His master forgave the entire debt", "He then went out and had a fellow servant thrown in prison for a hundred denarii"] },
      { name: "The Workers in the Vineyard", description: "Everyone gets the same grace regardless of when they arrived", facts: ["Some workers labored all day in the heat", "Some were hired at five in the afternoon — just one hour before quitting time", "Everyone received the same wage, which infuriated the all-day workers"] },
      { name: "The Pearl of Great Price", description: "Giving up everything for the one thing of ultimate worth", facts: ["A merchant was searching for fine pearls", "He found one of extraordinary value", "He sold everything he had — everything — to buy it"] },
      { name: "The Rich Fool", description: "Planning for the future while ignoring the eternal present", facts: ["His land produced such an abundant harvest he ran out of storage", "He planned to tear down his barns and build bigger ones", "God said 'You fool — this very night your life will be demanded from you'"] },
      { name: "The Two Builders", description: "Where you build determines whether you survive the storm", facts: ["Both men built houses — one on rock, one on sand", "The rain, floods, and winds came and struck both houses", "The one on rock stood; the one on sand fell with a great crash"] },
      { name: "The Lost Coin", description: "Heaven celebrates every single sinner who is found", facts: ["A woman had ten silver coins and lost one", "She lit a lamp and swept the whole house searching carefully", "When she found it she called her neighbors and friends to celebrate"] }
    ]
  }
};

function loadGameData() {
  try {
    const stored = localStorage.getItem('zionGamesData');
    if (stored) {
      const data = JSON.parse(stored);
      if (!data.taboo) data.taboo = JSON.parse(JSON.stringify(DEFAULT_DATA.taboo));
      if (!data.charades) data.charades = JSON.parse(JSON.stringify(DEFAULT_DATA.charades));
      if (!data.twentyQuestions) data.twentyQuestions = JSON.parse(JSON.stringify(DEFAULT_DATA.twentyQuestions));
      if (!data.jeopardy?.finalJeopardy) {
        if (data.jeopardy) data.jeopardy.finalJeopardy = JSON.parse(JSON.stringify(DEFAULT_DATA.jeopardy.finalJeopardy));
      }
      // Always refresh roleDistribution from defaults (balance changes take effect immediately)
      if (data.mafia) data.mafia.roleDistribution = JSON.parse(JSON.stringify(DEFAULT_DATA.mafia.roleDistribution));
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
