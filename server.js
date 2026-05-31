const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ============================================================
// CITY / DISTRICT SPECIFIC LOCAL RULES
// ============================================================
const cityRules = {
  // ── TAMIL NADU ──
  "chennai": {
    city: "Chennai", state: "Tamil Nadu",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Speed limit reduced to 30 km/h in school zones (8AM–9AM, 3PM–4PM)",
      "No-honking zones: Government General Hospital, Rajiv Gandhi Govt. General Hospital",
      "Anna Salai (Mount Road): No U-turns between 8AM–10PM",
      "Pondy Bazaar & T. Nagar: No vehicle entry 10AM–10PM (pedestrian zone)",
      "Marina Beach Road: One-way traffic enforced on weekends",
      "Chennai Port Area: Special permit required for heavy vehicles",
      "CMBT Bus Terminus area: No private vehicles parking 6AM–10PM",
      "e-Challan cameras active at 120+ junctions across Chennai",
      "Drunk driving checkpoints every Friday and Saturday night",
      "Helmet mandatory even for pillion riders — strictly enforced",
    ],
    fineNotes: "Chennai Traffic Police operate 24×7 e-challan system. Fines dispatched via SMS to registered vehicle owner.",
    helpline: "044-28447000", authority: "Chennai Traffic Police"
  },
  "coimbatore": {
    city: "Coimbatore", state: "Tamil Nadu",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "DB Road & Avinashi Road: No heavy vehicles 7AM–10AM and 5PM–9PM",
      "Gandhipuram Bus Stand area: No private parking within 200m",
      "Town Hall area: Pedestrian priority zone — vehicles must yield",
      "Speed cameras installed on Avinashi Road and Trichy Road",
      "No triple riding strictly enforced city-wide",
      "Auto-rickshaws must display fare meter — ₹500 fine for refusal",
    ],
    helpline: "0422-2301100", authority: "Coimbatore City Traffic Police"
  },
  "madurai": {
    city: "Madurai", state: "Tamil Nadu",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Meenakshi Temple area: No vehicles within 500m on festival days",
      "Madurai Junction surroundings: No parking 6AM–10PM",
      "Bypass roads: Speed cameras every 3 km",
      "Old city core: One-way traffic strictly enforced",
      "No diesel autos permitted within city limits since 2022",
    ],
    helpline: "0452-2530229", authority: "Madurai City Traffic Police"
  },
  "trichy": {
    city: "Tiruchirappalli", state: "Tamil Nadu",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Rock Fort area: No heavy vehicles at any time",
      "Srirarangam during festival: Complete vehicle ban within 1 km",
      "National Highway 38: Speed cameras every 5 km",
      "Junction 8 area: ANPR cameras active 24×7",
    ],
    helpline: "0431-2414100", authority: "Trichy City Traffic Police"
  },

  // ── MAHARASHTRA ──
  "mumbai": {
    city: "Mumbai", state: "Maharashtra",
    speedLimits: { urban: 40, highway: 80, expressway: 120 },
    localRules: [
      "Western Express Highway: Speed cameras every 2 km — limit 80 km/h",
      "Eastern Express Highway: 80 km/h limit, ANPR cameras active",
      "No-honking zones: All hospitals, courts, schools — ₹1,000 fine",
      "Dadar, Bandra, Kurla: No heavy vehicle entry 7AM–11PM",
      "Mumbai-Pune Expressway: 120 km/h cars, 80 km/h trucks",
      "Worli Sea Link: Speed limit 80 km/h, no stopping on bridge",
      "CST & Churchgate area: No private vehicle parking 9AM–6PM",
      "Juhu Beach Road: No vehicles on beach access road after 10PM",
      "Auto-rickshaws banned south of Mahim — taxis only",
      "No entry for goods vehicles in South Mumbai 7AM–11PM",
      "Drunk driving: Breath analyser test compulsory on weekend nights",
      "Signal-free corridors: No stopping — ₹5,000 fine",
    ],
    helpline: "022-22621855", authority: "Mumbai Traffic Police"
  },
  "pune": {
    city: "Pune", state: "Maharashtra",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Pune-Nashik Highway: ANPR cameras active, 80 km/h limit",
      "FC Road & JM Road: No vehicle entry 8PM–12AM (pedestrian street)",
      "Shivajinagar area: No parking on main roads 9AM–9PM",
      "Odd-even scheme for private cars during pollution alerts",
      "PMC area: Electric vehicles given free parking at designated spots",
      "Katraj Ghat: Overtaking ban — ₹2,000 fine",
      "Hadapsar IT zone: No heavy vehicles 8AM–10AM, 5PM–8PM",
      "Sinhagad Road: Speed limit 30 km/h on ghat section",
    ],
    helpline: "020-26050320", authority: "Pune City Traffic Police"
  },
  "nagpur": {
    city: "Nagpur", state: "Maharashtra",
    speedLimits: { urban: 40, highway: 80, expressway: 120 },
    localRules: [
      "Samruddhi Mahamarg (Mumbai-Nagpur): 120 km/h limit, cameras every 1 km",
      "Zero Mile area: No parking 8AM–8PM",
      "Sitabuldi area: One-way traffic strictly enforced",
      "No honking near Mayo Hospital and Medical Square",
      "Nagpur Metro corridors: No encroachment on road — ₹2,000 fine",
    ],
    helpline: "0712-2565151", authority: "Nagpur City Traffic Police"
  },
  "nashik": {
    city: "Nashik", state: "Maharashtra",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Kumbh Mela period: Extensive vehicle bans near Ghats",
      "Trimbak Road: Speed cameras active, 60 km/h limit",
      "No vehicles near Panchavati area on religious days",
      "Nashik-Pune highway: Fog lights mandatory Nov–Jan",
    ],
    helpline: "0253-2575733", authority: "Nashik City Traffic Police"
  },

  // ── DELHI ──
  "delhi": {
    city: "Delhi", state: "Delhi",
    speedLimits: { urban: 50, highway: 70, expressway: 100 },
    localRules: [
      "Odd-even scheme: Private cars on alternate days during smog emergencies",
      "BS-IV diesel vehicles banned under GRAP Stage 2 and above",
      "Connaught Place: No parking on inner and outer circles 9AM–9PM",
      "Chandni Chowk: Pedestrian-only zone 9AM–9PM — no vehicles",
      "DND Flyway: 100 km/h speed limit, no stopping or reversing",
      "Ring Road: Speed cameras every 500m, limit 60 km/h",
      "School zones: 25 km/h limit, strictly enforced 8AM–9AM & 2PM–4PM",
      "No heavy vehicles in inner Delhi 6AM–11PM",
      "No-honking zones: All hospitals, Supreme Court, High Court",
      "Red Light Violation Detection (RLVD) cameras at 100+ junctions",
      "Speed Violation Detection (SVD) cameras on all major roads",
      "Drunk driving: Compulsory breath test at 50+ checkpoints on weekends",
      "Wrong-side driving: Immediate challan + vehicle impound",
      "No entry for trucks on NH-48 within Delhi limits between 6AM–10PM",
      "Yellow line buses: Must stop only at designated stops — ₹2,000 fine",
    ],
    helpline: "011-23236607 / 1095", authority: "Delhi Traffic Police"
  },
  "new delhi": {
    city: "New Delhi", state: "Delhi",
    speedLimits: { urban: 50, highway: 70, expressway: 100 },
    localRules: [
      "VVIP movement areas: Complete road closure — obey police instructions",
      "India Gate zone: No private vehicles on Republic Day week",
      "Lutyen's Delhi: Restricted parking, permit required for commercial vehicles",
      "Parliament Street: No public parking during sessions",
      "Rajpath / Kartavya Path: No vehicles during national events",
    ],
    helpline: "011-23236607", authority: "Delhi Traffic Police"
  },
  "noida": {
    city: "Noida", state: "Uttar Pradesh",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    localRules: [
      "Yamuna Expressway: 100 km/h for cars, 80 km/h trucks — cameras every 2 km",
      "Noida-Greater Noida Expressway: 100 km/h limit, fog lights mandatory in winter",
      "Sector 18 market: No vehicle entry 12PM–9PM on weekends",
      "Delhi-Noida Direct (DND) Flyway: 80 km/h limit",
      "No heavy vehicles in Noida sectors 6AM–10PM",
      "e-challan active on all major sector roads",
    ],
    helpline: "0120-2442222", authority: "Noida Traffic Police"
  },
  "gurgaon": {
    city: "Gurugram", state: "Haryana",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    localRules: [
      "Delhi-Gurugram Expressway (NH-48): 100 km/h limit, cameras every 1 km",
      "MG Road: No heavy vehicles at any time",
      "Cyber City area: No parking on arterial roads 9AM–7PM",
      "Golf Course Road: 60 km/h limit strictly enforced",
      "Sohna Road ghat section: Overtaking ban — ₹2,000 fine",
      "No diesel autos within Municipal limits",
    ],
    helpline: "0124-2322600", authority: "Gurugram Traffic Police"
  },

  // ── KARNATAKA ──
  "bangalore": {
    city: "Bengaluru", state: "Karnataka",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Outer Ring Road: 60 km/h limit, ANPR cameras at every signal",
      "MG Road & Brigade Road: No vehicle parking 10AM–10PM",
      "Silk Board Junction: No stopping — heavy challan zone",
      "NICE Road: 100 km/h limit, toll + speed cameras",
      "No honking zones: All hospitals, Vidhana Soudha, High Court",
      "Whitefield & Electronic City: No heavy vehicles 8AM–10AM, 5PM–8PM",
      "Namma Metro corridors: No parking within 50m of metro stations",
      "Koramangala & Indiranagar: Towing active for illegal parking — ₹500 fee",
      "No triple riding strictly enforced city-wide",
      "Hebbal Flyover: No stopping at any point",
      "Old Airport Road: Speed cameras, 60 km/h limit",
      "Drunk driving: Saturday and Sunday midnight checkpoints compulsory",
    ],
    helpline: "080-22943225 / 103", authority: "Bengaluru City Traffic Police"
  },
  "bengaluru": {
    city: "Bengaluru", state: "Karnataka",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Outer Ring Road: 60 km/h limit, ANPR cameras at every signal",
      "MG Road & Brigade Road: No vehicle parking 10AM–10PM",
      "Silk Board Junction: No stopping — heavy challan zone",
      "NICE Road: 100 km/h limit, toll + speed cameras",
      "No honking zones: All hospitals, Vidhana Soudha, High Court",
      "Whitefield & Electronic City: No heavy vehicles 8AM–10AM, 5PM–8PM",
      "Namma Metro corridors: No parking within 50m of metro stations",
      "Koramangala & Indiranagar: Towing active for illegal parking — ₹500 fee",
      "Hebbal Flyover: No stopping at any point",
      "Drunk driving: Saturday and Sunday midnight checkpoints compulsory",
    ],
    helpline: "080-22943225 / 103", authority: "Bengaluru City Traffic Police"
  },
  "mysore": {
    city: "Mysuru", state: "Karnataka",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Mysore Palace area: No vehicle parking during Dasara — complete ban",
      "Chamundi Hill Road: One-way traffic during peak hours",
      "EV corridor on Hunsur Road — EVs given priority signals",
      "No honking near KR Hospital and JSS Hospital",
      "Mysore-Bengaluru Expressway: 100 km/h limit, cameras every 3 km",
    ],
    helpline: "0821-2520100", authority: "Mysuru City Traffic Police"
  },
  "hubli": {
    city: "Hubballi-Dharwad", state: "Karnataka",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Hubli-Dharwad twin city: Speed cameras on connecting road",
      "Old Hubli area: One-way system strictly enforced",
      "No heavy vehicles on inner city roads 8AM–8PM",
      "Unkal Lake road: No parking — environment protection zone",
    ],
    helpline: "0836-2362100", authority: "Hubballi-Dharwad Traffic Police"
  },

  // ── WEST BENGAL ──
  "kolkata": {
    city: "Kolkata", state: "West Bengal",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Park Street: No honking zone — ₹1,000 fine, strictly enforced",
      "Trams have absolute right of way on all tram routes",
      "Howrah Bridge: No stopping — immediate challan",
      "Vidyasagar Setu (2nd Hooghly Bridge): 80 km/h limit, no stopping",
      "Central Avenue & Chowringhee: No heavy vehicles 8AM–10PM",
      "New Market area: No private vehicles 10AM–8PM",
      "Gariahat crossing: No U-turn 8AM–10PM",
      "No honking zones: SSKM Hospital, NRS Medical College, Calcutta Medical College",
      "Salt Lake Sector V IT hub: No heavy vehicles 9AM–7PM",
      "Airport Gate 1 road: Speed limit 30 km/h",
      "e-challan cameras active at 80+ junctions",
      "Auto-rickshaws restricted to fixed routes — ₹500 fine for deviation",
      "Night buses must use low-beam within city limits",
      "Durga Puja: Major roads closed for pandals — follow police diversions",
    ],
    helpline: "033-22143526 / 100", authority: "Kolkata Traffic Police"
  },
  "howrah": {
    city: "Howrah", state: "West Bengal",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Howrah Station area: No private vehicle parking 6AM–10PM",
      "GT Road (NH-2): Speed cameras every 5 km, 60 km/h city limit",
      "Howrah Bridge approach: No stopping at any point",
      "No heavy vehicles near Howrah Station 7AM–10PM",
      "Shibpur area: Strict one-way system — ₹1,000 for wrong way",
    ],
    helpline: "033-26382929", authority: "Howrah Traffic Police"
  },
  "siliguri": {
    city: "Siliguri", state: "West Bengal",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Hill Cart Road: 40 km/h limit — gateway to Darjeeling hills",
      "Sevoke Road: Speed cameras active, no overtaking near bridges",
      "No heavy vehicles in core city area 8AM–8PM",
      "Matigara area: No parking on NH-31 within city limits",
      "Tea garden trucks: Must use bypass roads only",
    ],
    helpline: "0353-2535484", authority: "Siliguri Traffic Police"
  },
  "darjeeling": {
    city: "Darjeeling", state: "West Bengal",
    speedLimits: { urban: 20, highway: 40, expressway: 40 },
    localRules: [
      "Hill roads: Maximum 20 km/h on hairpin bends",
      "Toy Train (DHR) tracks: Stop and look both ways before crossing",
      "Mall Road: No motorised vehicles 8AM–8PM",
      "Chowk Bazaar: No heavy vehicles at any time",
      "Fog season (Nov–Feb): Mandatory fog lights and horn at bends",
      "No overtaking on any hill road — ₹3,000 fine",
      "Vehicles must carry chains in winter season",
    ],
    helpline: "0354-2254322", authority: "Darjeeling District Traffic Police"
  },
  "durgapur": {
    city: "Durgapur", state: "West Bengal",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Steel township area: Industrial vehicle permits required",
      "City Centre area: No heavy vehicles 9AM–9PM",
      "NH-2 (GT Road): ANPR cameras active, 60 km/h city limit",
      "No parking near Durgapur Barrage road",
    ],
    helpline: "0343-2546100", authority: "Durgapur Traffic Police"
  },
  "asansol": {
    city: "Asansol", state: "West Bengal",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "G.T. Road: Speed cameras active throughout city stretch",
      "No heavy coal trucks in residential areas 6AM–10PM",
      "Burnpur area: Industrial vehicle route restrictions",
      "Asansol Station area: No parking 6AM–10PM",
    ],
    helpline: "0341-2200100", authority: "Asansol Traffic Police"
  },

  // ── UTTAR PRADESH ──
  "lucknow": {
    city: "Lucknow", state: "Uttar Pradesh",
    speedLimits: { urban: 50, highway: 80, expressway: 120 },
    localRules: [
      "Hazratganj area: No heavy vehicles 9AM–9PM",
      "Ring Road: ANPR cameras every 1 km, 60 km/h limit",
      "No honking near KGMU, Balrampur and civil hospitals",
      "Charbagh area (Railway Station): No parking 6AM–10PM",
      "Gomti Nagar: No overnight parking on main roads",
      "Lucknow-Agra Expressway: 120 km/h limit for cars, cameras every 2 km",
      "Aminabad market: No vehicle entry 10AM–8PM",
    ],
    helpline: "0522-2236290 / 100", authority: "Lucknow Traffic Police"
  },
  "agra": {
    city: "Agra", state: "Uttar Pradesh",
    speedLimits: { urban: 40, highway: 80, expressway: 120 },
    localRules: [
      "Taj Trapezium Zone (TTZ): No diesel/petrol vehicles within 500m of Taj Mahal",
      "Electric vehicles and horse carriages only near Taj Mahal East and West gates",
      "Fatehabad Road: 40 km/h speed limit strictly enforced",
      "No honking within 1 km of Taj Mahal — ₹2,000 fine",
      "Agra-Lucknow Expressway: 120 km/h for cars, cameras every 2 km",
      "No heavy vehicles in Taj Ganj area at any time",
      "Tourist zone: CNG vehicles preferred — incentive parking",
    ],
    helpline: "0562-2460025", authority: "Agra Traffic Police"
  },
  "varanasi": {
    city: "Varanasi", state: "Uttar Pradesh",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Ghat roads: No motorised vehicles during Ganga Aarti (6PM–8PM)",
      "Dashashwamedh Ghat: Pedestrian-only 5PM–9PM daily",
      "No heavy vehicles in old city at any time",
      "Varanasi Cantt area: Speed limit 30 km/h",
      "No honking near Kashi Vishwanath Temple corridor",
      "E-rickshaws mandatory in old city heritage zone",
    ],
    helpline: "0542-2222001", authority: "Varanasi Traffic Police"
  },
  "kanpur": {
    city: "Kanpur", state: "Uttar Pradesh",
    speedLimits: { urban: 50, highway: 80, expressway: 120 },
    localRules: [
      "Kanpur Nagar: ANPR cameras at 60+ major junctions",
      "Mall Road: No heavy vehicles 9AM–9PM",
      "GT Road: Speed cameras, 60 km/h city limit",
      "No parking near Kanpur Central station 6AM–10PM",
      "Jajmau industrial area: Restricted timings for tanker trucks",
    ],
    helpline: "0512-2530400", authority: "Kanpur Traffic Police"
  },
  "prayagraj": {
    city: "Prayagraj", state: "Uttar Pradesh",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Kumbh Mela period: Massive vehicle bans near Sangam — follow police diversions",
      "Civil Lines: No heavy vehicles 9AM–9PM",
      "Allahabad Junction area: No parking 6AM–10PM",
      "No vehicles near Triveni Sangam on major Hindu festivals",
      "Prayagraj-Lucknow Expressway: 120 km/h limit",
    ],
    helpline: "0532-2407700", authority: "Prayagraj Traffic Police"
  },

  // ── RAJASTHAN ──
  "jaipur": {
    city: "Jaipur", state: "Rajasthan",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Walled City (Pink City): No commercial parking 9AM–9PM",
      "Hawa Mahal & Jantar Mantar: No vehicle stopping on road",
      "Johari Bazaar: Pedestrian priority — vehicles must yield to shoppers",
      "No heavy vehicles in old city at any time",
      "Jaipur-Delhi Highway (NH-48): ANPR cameras every 3 km",
      "No honking near SMS Hospital and Sawai Man Singh Medical College",
      "Camel crossings: Mandatory stop — ₹2,000 fine for not yielding",
      "Sindhi Camp Bus Stand area: No parking 6AM–10PM",
      "Night curfew vehicles: Must display valid curfew pass",
    ],
    helpline: "0141-2744236", authority: "Jaipur Traffic Police"
  },
  "jodhpur": {
    city: "Jodhpur", state: "Rajasthan",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Mehrangarh Fort road: No heavy vehicles at any time",
      "Clock Tower (Ghanta Ghar) area: Pedestrian priority zone",
      "No vehicles during Marwar Festival near palace areas",
      "NH-65: Speed cameras, 80 km/h limit outside city",
      "No camel carts on main highways — use service roads",
    ],
    helpline: "0291-2636655", authority: "Jodhpur Traffic Police"
  },
  "udaipur": {
    city: "Udaipur", state: "Rajasthan",
    speedLimits: { urban: 30, highway: 80, expressway: 100 },
    localRules: [
      "Lake Pichola road: No heavy vehicles — environment protection",
      "City Palace area: No parking 9AM–6PM",
      "Heritage zone: Electric vehicles and cycles preferred",
      "No motorised boats allowed — affects road traffic near lake ghats",
      "Fateh Sagar Lake: 30 km/h limit on lakeside road",
    ],
    helpline: "0294-2528611", authority: "Udaipur Traffic Police"
  },

  // ── GUJARAT ──
  "ahmedabad": {
    city: "Ahmedabad", state: "Gujarat",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    localRules: [
      "BRTS (Bus Rapid Transit) lanes: No private vehicle entry — ₹5,000 fine",
      "SG Highway: 80 km/h limit, speed cameras every 2 km",
      "Old city / Walled City: No heavy vehicles 8AM–8PM",
      "Manek Chowk: No vehicles 9PM–12AM (street food market)",
      "Sabarmati Riverfront: 30 km/h limit on promenade road",
      "No honking near Civil Hospital and VS Hospital",
      "Ahmedabad-Mumbai Expressway: 100 km/h limit",
      "Auto-rickshaws must use CNG — no diesel autos",
    ],
    helpline: "079-25502250", authority: "Ahmedabad Traffic Police"
  },
  "surat": {
    city: "Surat", state: "Gujarat",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    localRules: [
      "Ring Road: 60 km/h limit, ANPR cameras active",
      "Textile market area: Heavy vehicles allowed only 10PM–6AM",
      "No honking near New Civil Hospital",
      "Dumas Road: 40 km/h limit near beach area",
      "No illegal parking in Diamond Bourse area — immediate tow",
    ],
    helpline: "0261-2475400", authority: "Surat Traffic Police"
  },

  // ── TELANGANA ──
  "hyderabad": {
    city: "Hyderabad", state: "Telangana",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    localRules: [
      "Outer Ring Road (ORR): 100 km/h limit, cameras every 1 km",
      "HITEC City & Gachibowli: No heavy vehicles 8AM–10AM, 5PM–8PM",
      "Charminar area: No motorised vehicles Sundays 8AM–2PM",
      "Hussain Sagar Lake road: 40 km/h limit",
      "Begumpet: Speed cameras on airport road",
      "No honking near Osmania General Hospital, Gandhi Hospital",
      "Necklace Road: 30 km/h limit — recreational area",
      "PVNR Expressway: 100 km/h limit, no stopping",
      "Old City (Charminar, Laad Bazaar): Pedestrian priority",
      "e-challan cameras at 200+ junctions city-wide",
    ],
    helpline: "040-27852425 / 100", authority: "Hyderabad Traffic Police"
  },
  "secunderabad": {
    city: "Secunderabad", state: "Telangana",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    localRules: [
      "Secunderabad Cantonment: Military vehicle priority — yield always",
      "Paradise Circle: Heavy no-parking enforcement",
      "SD Road: One-way during peak hours",
      "No heavy vehicles in cantonment area at any time",
    ],
    helpline: "040-27852425", authority: "Secunderabad Traffic Police"
  },

  // ── ANDHRA PRADESH ──
  "visakhapatnam": {
    city: "Visakhapatnam", state: "Andhra Pradesh",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    localRules: [
      "Beach Road (RK Beach): 40 km/h limit, no overnight parking",
      "Port area: Heavy vehicle permits required at all times",
      "Gajuwaka industrial zone: Route restrictions for tankers",
      "No honking near King George Hospital",
      "Rushikonda Beach road: 30 km/h limit",
      "Steel Plant road: Restricted timings for industrial vehicles",
    ],
    helpline: "0891-2564556", authority: "Visakhapatnam Traffic Police"
  },

  // ── KERALA ──
  "thiruvananthapuram": {
    city: "Thiruvananthapuram", state: "Kerala",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "MG Road: No heavy vehicles 8AM–8PM",
      "No honking near SAT Hospital, General Hospital",
      "Secretariat area: No parking 9AM–6PM on working days",
      "Kovalam Beach road: 30 km/h limit",
      "No autorickshaws beyond city limit without permit",
      "Kerala Motor Vehicles Act: Helmet mandatory even for pillion inside compound",
    ],
    helpline: "0471-2721547", authority: "Thiruvananthapuram City Traffic Police"
  },
  "kochi": {
    city: "Kochi", state: "Kerala",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Marine Drive: No heavy vehicles at any time",
      "MG Road: One-way system, no parking 9AM–9PM",
      "Cochin Port Trust area: Port vehicle permits required",
      "No honking near Medical Trust, Lakeshore Hospital",
      "Kochi Metro corridors: No parking within 30m of stations",
      "Ernakulam Junction area: No heavy vehicles 7AM–10PM",
      "Fort Kochi heritage zone: No motor vehicles on heritage walk streets",
    ],
    helpline: "0484-2394000", authority: "Kochi City Traffic Police"
  },
  "kozhikode": {
    city: "Kozhikode", state: "Kerala",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Mananchira Square area: No vehicle parking 9AM–9PM",
      "Beach Road: 30 km/h limit",
      "No heavy vehicles in old Kozhikode city 8AM–8PM",
      "Calicut University road: 40 km/h strictly enforced",
    ],
    helpline: "0495-2723900", authority: "Kozhikode City Traffic Police"
  },

  // ── MADHYA PRADESH ──
  "bhopal": {
    city: "Bhopal", state: "Madhya Pradesh",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    localRules: [
      "VIP Road: Speed cameras active, 60 km/h limit",
      "New Market area: No heavy vehicles 9AM–9PM",
      "No honking near Hamidia Hospital, JP Hospital",
      "Bhopal Lake area: 30 km/h on lakeside road",
      "BHEL Township: Internal speed limit 20 km/h",
      "No heavy vehicles in old Bhopal city",
    ],
    helpline: "0755-2574800", authority: "Bhopal Traffic Police"
  },
  "indore": {
    city: "Indore", state: "Madhya Pradesh",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    localRules: [
      "Rajwada area: Pedestrian priority — vehicle must yield",
      "MG Road & AB Road: ANPR cameras, 50 km/h limit",
      "No heavy vehicles in inner city 8AM–10PM",
      "Sarwate Bus Stand area: No private parking 6AM–10PM",
      "Indore-Mumbai National Highway: 80 km/h, cameras every 5 km",
    ],
    helpline: "0731-2700600", authority: "Indore Traffic Police"
  },

  // ── PUNJAB ──
  "chandigarh": {
    city: "Chandigarh", state: "Punjab/Haryana (UT)",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    localRules: [
      "Sector 17 (City Centre): No vehicle parking 10AM–8PM",
      "V1 to V7 roads: Strictly classified — heavy vehicles on V1 only",
      "No honking zones: PGI Hospital, GMSH-16",
      "Rock Garden road: 30 km/h limit",
      "Sukhna Lake road: No vehicles except cycles on weekends 6AM–9AM",
      "Chandigarh is India's most planned city — lane discipline enforced strictly",
      "No auto-rickshaws in Sector 17 core area",
    ],
    helpline: "0172-2749090", authority: "Chandigarh Traffic Police"
  },
  "amritsar": {
    city: "Amritsar", state: "Punjab",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Golden Temple (Harmandir Sahib): No vehicles within 500m",
      "Hall Bazaar: Pedestrian zone 10AM–8PM",
      "No honking near Golden Temple at any time — religious respect",
      "Wagah Border road: Restricted vehicles during flag ceremony",
      "No heavy vehicles in old walled city at any time",
    ],
    helpline: "0183-2545800", authority: "Amritsar Traffic Police"
  },
  "ludhiana": {
    city: "Ludhiana", state: "Punjab",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    localRules: [
      "Ferozepur Road: ANPR cameras, 60 km/h limit",
      "No heavy vehicles in inner city 8AM–8PM",
      "Cycle industry vehicles: Must use designated routes",
      "Clock Tower area: Pedestrian priority zone",
    ],
    helpline: "0161-5053100", authority: "Ludhiana Traffic Police"
  },

  // ── ASSAM ──
  "guwahati": {
    city: "Guwahati", state: "Assam",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Kamakhya Temple road: No vehicles during major festivals",
      "Sarusajai area: Speed cameras, 50 km/h limit",
      "No heavy vehicles in Pan Bazaar area 8AM–8PM",
      "Brahmaputra riverfront road: 30 km/h limit",
      "NH-27: Speed cameras, fog lights mandatory in winter",
      "Flood season: Follow emergency road closure orders",
    ],
    helpline: "0361-2540131", authority: "Guwahati Traffic Police"
  },

  // ── JHARKHAND ──
  "ranchi": {
    city: "Ranchi", state: "Jharkhand",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    localRules: [
      "Main Road area: No heavy vehicles 9AM–9PM",
      "No honking near Rajendra Institute of Medical Sciences (RIMS)",
      "Ranchi Lake area: 30 km/h limit",
      "Kanke Road: Speed cameras active",
      "No parking near Birsa Munda Airport road during peak hours",
    ],
    helpline: "0651-2208022", authority: "Ranchi Traffic Police"
  },

  // ── ODISHA ──
  "bhubaneswar": {
    city: "Bhubaneswar", state: "Odisha",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    localRules: [
      "Temple district (Lingaraj): No vehicles on festival days within 1 km",
      "Rajpath: 60 km/h limit, ANPR cameras",
      "No heavy vehicles in old town area 8AM–8PM",
      "Infocity / IT hub: No heavy vehicles 9AM–7PM",
      "No honking near AIIMS Bhubaneswar",
    ],
    helpline: "0674-2536666", authority: "Bhubaneswar Traffic Police"
  },
  "puri": {
    city: "Puri", state: "Odisha",
    speedLimits: { urban: 30, highway: 80, expressway: 100 },
    localRules: [
      "Jagannath Temple: Absolute no-vehicle zone within Grand Road during Rath Yatra",
      "Marine Drive (Puri Beach): 30 km/h limit, no overnight parking",
      "No non-Hindu vehicles near temple on festival days",
      "Heavy vehicles banned from Puri city at all times",
      "Grand Road: No vehicles during Rath Yatra — complete closure",
    ],
    helpline: "06752-222074", authority: "Puri District Traffic Police"
  },

  // ── HIMACHAL PRADESH ──
  "shimla": {
    city: "Shimla", state: "Himachal Pradesh",
    speedLimits: { urban: 20, highway: 40, expressway: 40 },
    localRules: [
      "Mall Road: No motorised vehicles 9AM–9PM year-round",
      "Ridge: Absolutely no vehicles at any time",
      "Maximum 20 km/h on all Shimla city roads",
      "No overtaking on hairpin bends — ₹3,000 fine",
      "Mandatory chains/snow tyres Nov–Mar",
      "Large buses banned from inner city — park at ISBT Tutikandi",
      "No honking within city limits — ₹1,000 fine",
    ],
    helpline: "0177-2812344", authority: "Shimla Traffic Police"
  },
  "manali": {
    city: "Manali", state: "Himachal Pradesh",
    speedLimits: { urban: 20, highway: 30, expressway: 30 },
    localRules: [
      "Rohtang Pass: NGT-mandated vehicle limit — permit required",
      "Old Manali: No large vehicles on narrow lanes",
      "Maximum 20 km/h in town area",
      "Mandatory snow chains on pass roads Oct–May",
      "No overtaking ban on Manali-Leh Highway",
      "Eco-sensitive zone: No honking near river areas",
    ],
    helpline: "01902-252334", authority: "Manali Traffic Police"
  },

  // ── GOA ──
  "panaji": {
    city: "Panaji", state: "Goa",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Miramar Beach Road: 30 km/h limit",
      "No honking in Fontainhas (Latin Quarter) heritage area",
      "Mandovi River bridge: No stopping at any point",
      "No tinted glass beyond permissible limit — strictly checked",
      "Helmet compulsory — Goa strictly enforces vs tourists too",
      "No riding without proper licence — tourist bikes checked heavily",
    ],
    helpline: "0832-2425400", authority: "Goa Traffic Police"
  },
  "margao": {
    city: "Margao", state: "Goa",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    localRules: [
      "Municipal Garden area: No heavy vehicles 9AM–9PM",
      "Colva Beach road: 30 km/h limit",
      "No illegal parking in main market — active towing",
    ],
    helpline: "0832-2700433", authority: "South Goa Traffic Police"
  }
};

// ============================================================
// STATE LEVEL DATA
// ============================================================
const stateData = {
  "Tamil Nadu": {
    state: "Tamil Nadu",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    fines: [
      { violation: "Jumping Red Light", fine: "₹5,000 (1st)", repeat: "₹10,000 + 1yr license suspension" },
      { violation: "Drunk Driving (BAC > 0.03%)", fine: "₹10,000 + 6 months jail", repeat: "₹15,000 + 2yr jail" },
      { violation: "Speeding (1–20 km/h over)", fine: "₹1,000–2,000", repeat: "₹2,000–4,000" },
      { violation: "No Helmet (Rider)", fine: "₹1,000 + 3 months DL suspension", repeat: "₹2,000" },
      { violation: "No Seatbelt", fine: "₹1,000", repeat: "₹2,000" },
      { violation: "Using Mobile While Driving", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Overloading (2-wheeler, 3rd person)", fine: "₹2,000 + vehicle impound", repeat: "₹4,000" },
      { violation: "Without Insurance", fine: "₹2,000 + 3 months jail", repeat: "₹4,000" },
      { violation: "Without RC / DL", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Dangerous Driving", fine: "₹1,000–5,000 + 6 months jail", repeat: "₹10,000 + 2yr jail" },
    ],
    localRules: ["Speed limit 40 km/h in school zones", "Zero tolerance drunk driving in festivals", "PUC certificate mandatory", "e-Challan cameras at major junctions"],
    authority: "Tamil Nadu Motor Vehicles Department", helpline: "044-28447000", portal: "https://tnreginet.gov.in"
  },
  "Maharashtra": {
    state: "Maharashtra",
    speedLimits: { urban: 50, highway: 80, expressway: 120 },
    fines: [
      { violation: "Jumping Red Light", fine: "₹5,000 (1st)", repeat: "₹10,000 + suspension" },
      { violation: "Drunk Driving", fine: "₹10,000 + 6 months jail", repeat: "₹15,000 + 2yr jail" },
      { violation: "Speeding", fine: "₹1,000–2,000", repeat: "₹2,000–4,000" },
      { violation: "No Helmet", fine: "₹1,000 + 3 months DL suspension", repeat: "₹2,000" },
      { violation: "No Seatbelt", fine: "₹1,000", repeat: "₹2,000" },
      { violation: "Using Mobile While Driving", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Triple Riding (2-wheeler)", fine: "₹2,000", repeat: "₹4,000" },
      { violation: "Without Insurance", fine: "₹2,000 + 3 months jail", repeat: "₹4,000" },
      { violation: "Without Documents", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Dangerous Driving", fine: "₹1,000–5,000 + 6 months jail", repeat: "₹10,000 + 2yr jail" },
    ],
    localRules: ["Mumbai-Pune Expressway: 120 km/h", "No-honking zones near hospitals", "Odd-even during pollution emergencies"],
    authority: "Maharashtra Transport Department", helpline: "1800-233-8888", portal: "https://transport.maharashtra.gov.in"
  },
  "Delhi": {
    state: "Delhi",
    speedLimits: { urban: 50, highway: 70, expressway: 100 },
    fines: [
      { violation: "Jumping Red Light", fine: "₹5,000 (1st)", repeat: "₹10,000 + license suspension" },
      { violation: "Drunk Driving", fine: "₹10,000 + 6 months jail", repeat: "₹15,000 + 2yr jail" },
      { violation: "Speeding", fine: "₹1,000–2,000", repeat: "₹2,000–4,000" },
      { violation: "No Helmet", fine: "₹1,000 + 3 months DL suspension", repeat: "₹2,000" },
      { violation: "No Seatbelt", fine: "₹1,000", repeat: "₹2,000" },
      { violation: "Mobile Phone Use", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Overloading (Passenger)", fine: "₹1,000 per extra passenger", repeat: "₹2,000 per extra" },
      { violation: "Without Insurance", fine: "₹2,000 + 3 months jail", repeat: "₹4,000" },
      { violation: "Wrong Side Driving", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Dangerous Driving", fine: "₹1,000–5,000", repeat: "₹10,000 + 2yr jail" },
    ],
    localRules: ["Odd-even scheme during smog", "BS-IV diesel ban under GRAP", "No heavy vehicles 6AM–11PM", "ANPR cameras at 100+ junctions"],
    authority: "Delhi Traffic Police / Transport Department", helpline: "1095 / 011-23236607", portal: "https://transport.delhi.gov.in"
  },
  "Karnataka": {
    state: "Karnataka",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    fines: [
      { violation: "Jumping Red Light", fine: "₹5,000", repeat: "₹10,000 + 1yr suspension" },
      { violation: "Drunk Driving", fine: "₹10,000 + 6 months jail", repeat: "₹15,000 + 2yr jail" },
      { violation: "Speeding", fine: "₹1,000–2,000", repeat: "₹2,000–4,000" },
      { violation: "No Helmet", fine: "₹1,000 + 3 months suspension", repeat: "₹2,000" },
      { violation: "No Seatbelt", fine: "₹1,000", repeat: "₹2,000" },
      { violation: "Mobile Use While Driving", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Triple Riding", fine: "₹2,000", repeat: "₹4,000" },
      { violation: "Without Insurance", fine: "₹2,000 + 3 months jail", repeat: "₹4,000" },
      { violation: "Without RC/DL", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Dangerous Driving", fine: "₹5,000 + 6 months jail", repeat: "₹10,000 + 2yr jail" },
    ],
    localRules: ["Hoysala digital challan system", "Heavy vehicles banned from Bangalore 6AM–11PM", "EV priority lanes in Mysuru"],
    authority: "Karnataka State Police / RTO", helpline: "080-22943225", portal: "https://rto.karnataka.gov.in"
  },
  "West Bengal": {
    state: "West Bengal",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    fines: [
      { violation: "Jumping Red Light", fine: "₹5,000", repeat: "₹10,000 + suspension" },
      { violation: "Drunk Driving", fine: "₹10,000 + 6 months jail", repeat: "₹15,000 + 2yr jail" },
      { violation: "Speeding", fine: "₹1,000–2,000", repeat: "₹2,000–4,000" },
      { violation: "No Helmet", fine: "₹1,000 + 3 months DL suspension", repeat: "₹2,000" },
      { violation: "No Seatbelt", fine: "₹1,000", repeat: "₹2,000" },
      { violation: "Mobile Use", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Overloading (Autos)", fine: "₹2,000 + vehicle impound", repeat: "₹4,000" },
      { violation: "Without Insurance", fine: "₹2,000 + 3 months jail", repeat: "₹4,000" },
      { violation: "Without Documents", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Dangerous Driving", fine: "₹5,000 + 6 months jail", repeat: "₹10,000 + 2yr jail" },
    ],
    localRules: ["Trams have right of way", "e-challan at 80+ junctions", "Honking ban near hospitals — ₹1,000 fine"],
    authority: "West Bengal Transport Department", helpline: "033-22143526", portal: "https://transport.wb.gov.in"
  },
  "Uttar Pradesh": {
    state: "Uttar Pradesh",
    speedLimits: { urban: 50, highway: 80, expressway: 120 },
    fines: [
      { violation: "Jumping Red Light", fine: "₹5,000", repeat: "₹10,000 + suspension" },
      { violation: "Drunk Driving", fine: "₹10,000 + 6 months jail", repeat: "₹15,000 + 2yr jail" },
      { violation: "Speeding", fine: "₹1,000–2,000", repeat: "₹2,000–4,000" },
      { violation: "No Helmet", fine: "₹1,000 + 3 months suspension", repeat: "₹2,000" },
      { violation: "No Seatbelt", fine: "₹1,000", repeat: "₹2,000" },
      { violation: "Mobile Use", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Wrong Lane", fine: "₹500–1,000", repeat: "₹1,000–2,000" },
      { violation: "Without Insurance", fine: "₹2,000 + 3 months jail", repeat: "₹4,000" },
      { violation: "Without RC/DL", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Overloading", fine: "₹20,000 + ₹2,000 per tonne", repeat: "Double fine" },
    ],
    localRules: ["Yamuna Expressway: 120 km/h, cameras every 2 km", "Taj Trapezium Zone: No petrol/diesel vehicles near Taj Mahal", "e-challan via ANPR across cities"],
    authority: "UP Transport Department", helpline: "0522-2236290", portal: "https://uptransport.upsdc.gov.in"
  },
  "Rajasthan": {
    state: "Rajasthan",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    fines: [
      { violation: "Jumping Red Light", fine: "₹5,000", repeat: "₹10,000 + suspension" },
      { violation: "Drunk Driving", fine: "₹10,000 + 6 months jail", repeat: "₹15,000 + 2yr jail" },
      { violation: "Speeding", fine: "₹1,000–2,000", repeat: "₹2,000–4,000" },
      { violation: "No Helmet", fine: "₹1,000 + 3 months suspension", repeat: "₹2,000" },
      { violation: "No Seatbelt", fine: "₹1,000", repeat: "₹2,000" },
      { violation: "Mobile Use", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Overloading", fine: "₹20,000 + ₹2,000 per extra tonne", repeat: "Double penalty" },
      { violation: "Without Insurance", fine: "₹2,000", repeat: "₹4,000" },
      { violation: "Without RC/DL", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Dangerous Driving", fine: "₹5,000", repeat: "₹10,000 + 2yr jail" },
    ],
    localRules: ["Camel cart crossing: mandatory give-way", "Sand storm: speed reduced to 40 km/h", "Desert highway extra enforcement in tourist season"],
    authority: "Rajasthan Transport Department", helpline: "0141-2744236", portal: "https://transport.rajasthan.gov.in"
  },
  "Gujarat": {
    state: "Gujarat",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    fines: [
      { violation: "Jumping Red Light", fine: "₹5,000", repeat: "₹10,000 + suspension" },
      { violation: "Drunk Driving", fine: "₹10,000 + 6 months jail (Prohibition State)", repeat: "₹15,000 + 2yr jail" },
      { violation: "Speeding", fine: "₹1,000–2,000", repeat: "₹2,000–4,000" },
      { violation: "No Helmet", fine: "₹1,000 + 3 months suspension", repeat: "₹2,000" },
      { violation: "No Seatbelt", fine: "₹1,000", repeat: "₹2,000" },
      { violation: "Mobile Use", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "BRTS Lane Violation", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Without Insurance", fine: "₹2,000", repeat: "₹4,000" },
      { violation: "Without RC/DL", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Dangerous Driving", fine: "₹5,000", repeat: "₹10,000 + 2yr jail" },
    ],
    localRules: ["Gujarat is a dry state — alcohol possession in vehicle is a criminal offence", "BRTS lanes strictly enforced in Ahmedabad", "CNG mandatory for autos"],
    authority: "Gujarat Transport Department", helpline: "079-23250798", portal: "https://rtogujarat.gov.in"
  },
  "Telangana": {
    state: "Telangana",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    fines: [
      { violation: "Jumping Red Light", fine: "₹5,000", repeat: "₹10,000 + suspension" },
      { violation: "Drunk Driving", fine: "₹10,000 + 6 months jail", repeat: "₹15,000 + 2yr jail" },
      { violation: "Speeding", fine: "₹1,000–2,000", repeat: "₹2,000–4,000" },
      { violation: "No Helmet", fine: "₹1,000 + suspension", repeat: "₹2,000" },
      { violation: "No Seatbelt", fine: "₹1,000", repeat: "₹2,000" },
      { violation: "Mobile Use", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Without Insurance", fine: "₹2,000", repeat: "₹4,000" },
      { violation: "Without RC/DL", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Triple Riding", fine: "₹2,000", repeat: "₹4,000" },
      { violation: "Dangerous Driving", fine: "₹5,000", repeat: "₹10,000 + 2yr jail" },
    ],
    localRules: ["ORR (Outer Ring Road): 100 km/h limit", "e-challan cameras at 200+ Hyderabad junctions", "No heavy vehicles in IT corridor during peak hours"],
    authority: "Telangana Transport Department", helpline: "040-27852425", portal: "https://transport.telangana.gov.in"
  },
  "Kerala": {
    state: "Kerala",
    speedLimits: { urban: 40, highway: 80, expressway: 100 },
    fines: [
      { violation: "Jumping Red Light", fine: "₹5,000", repeat: "₹10,000 + suspension" },
      { violation: "Drunk Driving", fine: "₹10,000 + 6 months jail", repeat: "₹15,000 + 2yr jail" },
      { violation: "Speeding", fine: "₹1,000–2,000", repeat: "₹2,000–4,000" },
      { violation: "No Helmet (both rider & pillion)", fine: "₹1,000 + suspension", repeat: "₹2,000" },
      { violation: "No Seatbelt", fine: "₹1,000", repeat: "₹2,000" },
      { violation: "Mobile Use", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Without Insurance", fine: "₹2,000", repeat: "₹4,000" },
      { violation: "Without RC/DL", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "School Bus Violations", fine: "₹10,000", repeat: "₹20,000 + DL cancellation" },
      { violation: "Dangerous Driving", fine: "₹5,000", repeat: "₹10,000 + 2yr jail" },
    ],
    localRules: ["Kerala has stricter school bus safety rules than national average", "Helmet mandatory for pillion even inside private compound (Kerala Motor Vehicles Act)", "Speed calming measures on all state highways near schools"],
    authority: "Kerala Motor Vehicles Department", helpline: "0471-2721547", portal: "https://mvd.kerala.gov.in"
  },
  "Punjab": {
    state: "Punjab",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    fines: [
      { violation: "Jumping Red Light", fine: "₹5,000", repeat: "₹10,000 + suspension" },
      { violation: "Drunk Driving", fine: "₹10,000 + 6 months jail", repeat: "₹15,000 + 2yr jail" },
      { violation: "Speeding", fine: "₹1,000–2,000", repeat: "₹2,000–4,000" },
      { violation: "No Helmet", fine: "₹1,000 + suspension", repeat: "₹2,000" },
      { violation: "No Seatbelt", fine: "₹1,000", repeat: "₹2,000" },
      { violation: "Mobile Use", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Without Insurance", fine: "₹2,000", repeat: "₹4,000" },
      { violation: "Without RC/DL", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Tractor Overloading", fine: "₹20,000", repeat: "Double fine" },
      { violation: "Dangerous Driving", fine: "₹5,000", repeat: "₹10,000 + 2yr jail" },
    ],
    localRules: ["Agricultural vehicles: Must use proper lighting at night", "No tractor-trolleys on national highways after 8PM", "Golden Temple zone: No-honking strictly enforced"],
    authority: "Punjab Transport Department", helpline: "0172-2700343", portal: "https://punjabtransport.org"
  },
  "Haryana": {
    state: "Haryana",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    fines: [
      { violation: "Jumping Red Light", fine: "₹5,000", repeat: "₹10,000 + suspension" },
      { violation: "Drunk Driving", fine: "₹10,000 + 6 months jail", repeat: "₹15,000 + 2yr jail" },
      { violation: "Speeding", fine: "₹1,000–2,000", repeat: "₹2,000–4,000" },
      { violation: "No Helmet", fine: "₹1,000 + suspension", repeat: "₹2,000" },
      { violation: "No Seatbelt", fine: "₹1,000", repeat: "₹2,000" },
      { violation: "Mobile Use", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Without Insurance", fine: "₹2,000", repeat: "₹4,000" },
      { violation: "Without RC/DL", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Tractor Overloading", fine: "₹20,000", repeat: "Double fine" },
      { violation: "Dangerous Driving", fine: "₹5,000", repeat: "₹10,000 + 2yr jail" },
    ],
    localRules: ["Delhi-Gurugram Expressway: 100 km/h, cameras every 1 km", "No highway encroachment — ₹50,000 fine", "Karma scheme: Good driving rewarded with points"],
    authority: "Haryana Transport Department", helpline: "0172-2560762", portal: "https://haryanatransport.gov.in"
  },
  "Madhya Pradesh": {
    state: "Madhya Pradesh",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    fines: [
      { violation: "Jumping Red Light", fine: "₹5,000", repeat: "₹10,000 + suspension" },
      { violation: "Drunk Driving", fine: "₹10,000 + 6 months jail", repeat: "₹15,000 + 2yr jail" },
      { violation: "Speeding", fine: "₹1,000–2,000", repeat: "₹2,000–4,000" },
      { violation: "No Helmet", fine: "₹1,000 + suspension", repeat: "₹2,000" },
      { violation: "No Seatbelt", fine: "₹1,000", repeat: "₹2,000" },
      { violation: "Mobile Use", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Without Insurance", fine: "₹2,000", repeat: "₹4,000" },
      { violation: "Without RC/DL", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Overloading", fine: "₹20,000 + ₹2,000 per tonne", repeat: "Double fine" },
      { violation: "Dangerous Driving", fine: "₹5,000", repeat: "₹10,000 + 2yr jail" },
    ],
    localRules: ["Wildlife corridors: Reduced speed limits (40 km/h) near Kanha, Bandhavgarh, Pench", "No honking near wildlife sanctuaries", "Night driving restrictions in tiger reserve buffer zones"],
    authority: "MP Transport Department", helpline: "0755-2553595", portal: "https://transport.mp.gov.in"
  },
  "DEFAULT": {
    state: "India (National)",
    speedLimits: { urban: 50, highway: 80, expressway: 100 },
    fines: [
      { violation: "Jumping Red Light", fine: "₹5,000 (1st offence)", repeat: "₹10,000 + 1yr license suspension" },
      { violation: "Drunk Driving (BAC > 0.03%)", fine: "₹10,000 + 6 months jail", repeat: "₹15,000 + 2 years jail" },
      { violation: "Speeding (1–20 km/h over)", fine: "₹1,000–2,000", repeat: "₹2,000–4,000" },
      { violation: "No Helmet (Rider)", fine: "₹1,000 + 3 months DL suspension", repeat: "₹2,000" },
      { violation: "No Seatbelt", fine: "₹1,000", repeat: "₹2,000" },
      { violation: "Using Mobile While Driving", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Overloading", fine: "₹20,000 + ₹2,000/extra tonne", repeat: "Double penalty" },
      { violation: "Without Insurance", fine: "₹2,000 + 3 months jail", repeat: "₹4,000" },
      { violation: "Without RC / DL", fine: "₹5,000", repeat: "₹10,000" },
      { violation: "Dangerous Driving", fine: "₹1,000–5,000 + 6 months jail", repeat: "₹10,000 + 2yr jail" },
    ],
    localRules: ["National speed limits apply where state limits not defined", "Motor Vehicles Act 2019 is baseline across all states", "Always carry DL, RC, Insurance, PUC certificate"],
    authority: "Ministry of Road Transport & Highways (MoRTH)", helpline: "1800-180-1500", portal: "https://morth.nic.in"
  }
};

// ============================================================
// LOOKUP HELPERS
// ============================================================
function findCity(name) {
  const key = name.toLowerCase().trim();
  // Direct match
  if (cityRules[key]) return cityRules[key];
  // Partial match
  const found = Object.keys(cityRules).find(k =>
    key.includes(k) || k.includes(key)
  );
  return found ? cityRules[found] : null;
}

function findState(name) {
  if (!name) return stateData["DEFAULT"];
  // Direct match
  if (stateData[name]) return stateData[name];
  // Partial match
  const key = Object.keys(stateData).find(k =>
    k.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(k.toLowerCase())
  );
  return key ? stateData[key] : stateData["DEFAULT"];
}

// ============================================================
// API ROUTES
// ============================================================

// Get laws for a location — tries city first, falls back to state
app.get('/api/laws', (req, res) => {
  const { city, state } = req.query;
  if (!city && !state) return res.status(400).json({ error: 'city or state parameter required' });

  const cityMatch = city ? findCity(city) : null;
  const stateMatch = findState(state);

  if (cityMatch) {
    // Merge city-specific rules with state fine data
    const stateFines = stateMatch;
    res.json({
      city: cityMatch.city,
      state: cityMatch.state,
      type: 'city',
      speedLimits: cityMatch.speedLimits,
      fines: stateFines.fines,
      localRules: cityMatch.localRules,
      fineNotes: cityMatch.fineNotes || null,
      authority: cityMatch.authority,
      helpline: cityMatch.helpline,
      portal: stateFines.portal
    });
  } else {
    res.json({ ...stateMatch, type: 'state', city: null });
  }
});

// Get laws by city name only
app.get('/api/city', (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'name required' });
  const city = findCity(name);
  if (!city) return res.status(404).json({ error: 'City not found', fallback: true });
  res.json(city);
});

// List all states
app.get('/api/states', (req, res) => {
  res.json(Object.keys(stateData).filter(s => s !== 'DEFAULT'));
});

// List all cities
app.get('/api/cities', (req, res) => {
  res.json(Object.keys(cityRules).map(k => ({
    key: k,
    city: cityRules[k].city,
    state: cityRules[k].state
  })));
});

// Serve index.html for all other routes
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ DriveLegal running at http://localhost:${PORT}`);
  console.log(`   Cities covered: ${Object.keys(cityRules).length}`);
  console.log(`   States covered: ${Object.keys(stateData).length - 1}`);
});