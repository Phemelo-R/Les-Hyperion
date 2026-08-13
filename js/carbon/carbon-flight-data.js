/* ============================================================
   Les Hyperion — Flight Reference Data
   ------------------------------------------------------------
   ICAO Carbon Emissions Calculator (ICEC) Methodology v9
   Appendix A (route groups), B (equivalent aircraft),
   C (fuel consumption curves).
   Code 295 (E195-E2) is v13.1-only.
   ============================================================ */

var STAGES=[125,250,500,750,1000,1500,2000,2500,3000,3500,4000,4500,5000,5500,6000,6500,7000,7500,8000,8500];

var FUEL={};
function curve(code,arr){var o=[];for(var i=0;i<arr.length;i++){o.push([STAGES[i],arr[i]]);}FUEL[code]=o;}

/* regional jets */
curve('ER3',[729,1505,2046,2722,3368,4601]);
curve('ERD',[744,1536,2088,2778,3437,4696,5901]);
curve('ER4',[799,1633,2196,2903,3576,4855,6073]);
curve('E70',[1075,2160,2868,3777,4651,6341]);
curve('E75',[1113,2240,2989,3953,4890,6725]);
curve('E90',[1338,2688,3567,4695,5778,7871,9913]);
curve('E95',[1362,2747,3677,4881,6057,8383,10718]);
curve('295',[1501,1823,2782,3741,4700,6617,8535,10453]);
curve('CR1',[794,1594,2116,2786,3430,4674]);
curve('CR2',[781,1569,2084,2743,3378,4605]);
curve('CR7',[1043,2092,2772,3642,4475,6076]);
curve('CR9',[1119,2251,2994,3949,4872,6664]);
curve('FRJ',[673,1346,1772,2313]);
curve('ARJ',[1289,2754,3874,5258,6600,9199,11725]);
curve('141',[1289,2754,3874,5258,6600,9199]);
curve('142',[1289,2754,3874,5258,6600,9199,11725]);

/* turboprops */
curve('DH1',[406,811,1219,1648]);
curve('DH3',[535,1069,1607,2172]);
curve('DH4',[689,1383,2093,2847,3570]);
curve('DHT',[208,416,625,845]);
curve('AT4',[360,723,1093,1486,1863,2588]);
curve('AT7',[434,891,1409,1996,2603,3891,5293]);
curve('EM2',[315,625,926,1233,1514,2015]);
curve('J31',[213,426,640,865,1078,1480]);
curve('J41',[314,627,943,1274,1587,2179]);
curve('D28',[203,407,612,826]);
curve('D38',[413,825,1240,1676]);

/* narrowbodies */
curve('732',[1778,3708,4962,6727,8421,11672,14802,17850,20838,23777,26676]);
curve('733',[1616,3323,4462,6061,7597,10551,13400,16176,18900,21582,24229]);
curve('734',[1685,3482,4707,6419,8069,11250,14328,17335,20289,23203,26084]);
curve('735',[1539,3153,4207,5694,7119,9850,12477,15033,17535,19995,22421]);
curve('738',[1715,3494,4621,6221,7749,10666,13460,16170,18818,21415,23972]);
curve('319',[1596,3259,4323,5830,7271,10026,12668,15233,17741,20203]);
curve('320',[1672,3430,4585,6212,7772,10766,13648,16452]);
curve('M82',[1985,4001,5467,7503,9473,13291,17002,20641,24227,27772]);
curve('M83',[1985,4001,5467,7503,9473,13291,17002,20641,24227,27772]);
curve('D93',[1773,3640,4871,6604,8267,11458,14531,17524]);

/* widebodies */
curve('AB3',[3427,7221,10159,14032,17812,25200,32442,39589,46667,53694,60682,67636]);
curve('AB4',[3427,7221,10159,14032,17812,25200,32442,39589,46667,53694,60682,67636]);
curve('332',[3395,6964,9550,12994,16321,22747,28973,35065,41057,46970,52422,57231,61889,66406,70793,75058,79207]);
curve('333',[3497,7277,9980,13579,17055,23769,30276,36642,42903,49082,54788,59831,64719,69463]);
curve('342',[3972,7985,10445,13882,17198,23642,29984,36312,42673,49097,55603,62203,68908,75453,80921,84023,86770,89174]);
curve('343',[4205,8452,11054,14688,18192,24999,31691,38363,45066,51831,58678,65621,72666,79169,85687,89019,91982]);
curve('345',[4456,9441,13137,18027,22779,32019,41031,49891,58640,67304,75900,84439,92931,101383,109799,117578,124601,131512,138319,145026]);
curve('346',[4778,10030,14053,19362,24537,34630,44505,54236,63863,73412,82899,92334,101727,111211,119071,126796,134395,141877]);
curve('359',[1904,3606,7011,10416,13821,20631,27441,34251,41061,47870,54680,61490,68300,75110,81920,88730,95540,102350,109159]);
curve('742',[5508,11311,16590,23478,30323,43957,57575,71204,84859,98545,112264,126017,139806,153629,167486,181377,195300,209254]);
curve('743',[5273,10827,15880,22473,29024,42074,55108,68154,81224,94323,107455,120620,133818,147049,160312,173608,186934,200291]);
curve('744',[4719,9690,14212,20113,25977,37657,49323,60999,72696,84420,96173,107956,119768,131607,140292,148734,156946,164938]);
curve('74L',[4502,9243,13557,19185,24778,35919,47046,58183,69341,80524,91734,102973,114240,125535,136859,148209,159586,170989]);
curve('762',[2685,5457,7625,10488,13276,18707,24013,29237,34402,39522,44605,49659,54687,59395,62791,66006]);
curve('763',[2900,5799,7971,10965,13879,19557,25104,30566,35966,41318,46632,51915,57172,62106,65700,69112]);
curve('D10',[4773,9701,13555,18646,23601,33256,42690,51978,61160,70261,79298,88282,97222,106124,114994,123835,132651,141445]);
curve('D11',[4534,9216,12877,17713,22421,31593,40555,49379,58102,66748,75333,83868,92361,100818,109244,117643,126019,134372]);

/* ============================================================
   Aircraft register.  icao = ICAO equivalent-aircraft code
   (Appendix B).  seats = all-economy Y-seat count.
   src 'wi'  = seat count from the Wild Impact fleet sheet
   src 'typ' = typical all-economy config, added here — verify
   fix       = correction applied to the original fleet sheet
   ============================================================ */
var AIRCRAFT={
 "Embraer ERJ-135":{icao:"ER3",seats:37,src:"wi",fix:"was 100 (Fokker 100)"},
 "Embraer ERJ-140":{icao:"ERD",seats:44,src:"wi",fix:"was 141 (BAe 146-100)"},
 "Embraer ERJ-145":{icao:"ER4",seats:50,src:"wi",fix:"was 143 (BAe 146-300)"},
 "Embraer ERJ-170":{icao:"E70",seats:72,src:"wi"},
 "Embraer ERJ-175":{icao:"E75",seats:78,src:"wi"},
 "Embraer ERJ-190":{icao:"E90",seats:100,src:"wi"},
 "Embraer ERJ-195":{icao:"E95",seats:116,src:"wi"},
 "Embraer E195-E2":{icao:"295",seats:132,src:"wi",fix:"was E95 (ERJ-195); 295 is v13.1-only"},
 "Embraer EMB-120 Brasilia":{icao:"EM2",seats:30,src:"typ"},
 "Boeing 737-200":{icao:"732",seats:130,src:"typ"},
 "Boeing 737-300":{icao:"733",seats:140,src:"wi"},
 "Boeing 737-400":{icao:"734",seats:168,src:"wi"},
 "Boeing 737-500":{icao:"735",seats:122,src:"wi"},
 "Boeing 737-800":{icao:"738",seats:189,src:"wi"},
 "Boeing 747-200":{icao:"742",seats:452,src:"typ"},
 "Boeing 747-300":{icao:"743",seats:470,src:"typ"},
 "Boeing 747-400":{icao:"744",seats:524,src:"typ"},
 "Boeing 747SP":{icao:"74L",seats:331,src:"typ"},
 "Boeing 767-200":{icao:"762",seats:216,src:"typ"},
 "Boeing 767-300":{icao:"763",seats:269,src:"typ"},
 "Bombardier CRJ-100":{icao:"CR1",seats:50,src:"wi"},
 "Bombardier CRJ-200":{icao:"CR2",seats:50,src:"wi"},
 "Bombardier CRJ-700":{icao:"CR7",seats:70,src:"wi"},
 "Bombardier CRJ-900":{icao:"CR9",seats:90,src:"wi"},
 "Airbus A319-100":{icao:"319",seats:156,src:"typ"},
 "Airbus A320-200":{icao:"320",seats:180,src:"wi"},
 "Airbus A300B2":{icao:"AB3",seats:281,src:"typ"},
 "Airbus A300B4":{icao:"AB4",seats:281,src:"typ"},
 "Airbus A330-200":{icao:"332",seats:300,src:"typ"},
 "Airbus A330-300":{icao:"333",seats:335,src:"typ"},
 "Airbus A340-200":{icao:"342",seats:300,src:"typ"},
 "Airbus A340-300":{icao:"343",seats:335,src:"typ"},
 "Airbus A340-500":{icao:"345",seats:313,src:"typ"},
 "Airbus A340-600":{icao:"346",seats:380,src:"typ"},
 "Airbus A350-900":{icao:"359",seats:339,src:"typ"},
 "De Havilland Canada DHC-8-100":{icao:"DH1",seats:37,src:"typ"},
 "De Havilland Canada DHC-8-300":{icao:"DH3",seats:50,src:"typ"},
 "De Havilland DHC-8-400":{icao:"DH4",seats:78,src:"wi"},
 "De Havilland Canada DHC-6-300 Twin Otter":{icao:"DHT",seats:19,src:"typ"},
 "British Aerospace 146-100":{icao:"141",seats:82,src:"typ"},
 "British Aerospace 146-200":{icao:"142",seats:100,src:"typ"},
 "British Aerospace Avro RJ85":{icao:"ARJ",seats:100,src:"typ"},
 "British Aerospace Jetstream 31":{icao:"J31",seats:19,src:"typ"},
 "British Aerospace Jetstream 41":{icao:"J41",seats:29,src:"typ"},
 "ATR 42":{icao:"AT4",seats:48,src:"typ"},
 "ATR 72":{icao:"AT7",seats:72,src:"typ"},
 "Dornier 328JET-300":{icao:"FRJ",seats:32,src:"typ"},
 "Dornier 328-100":{icao:"D38",seats:32,src:"typ"},
 "Dornier Do-228-200":{icao:"D28",seats:19,src:"typ"},
 "McDonnell Douglas MD-82":{icao:"M82",seats:172,src:"typ"},
 "McDonnell Douglas MD-83":{icao:"M83",seats:172,src:"typ"},
 "McDonnell Douglas DC-9-30":{icao:"D93",seats:115,src:"typ"},
 "McDonnell Douglas DC-10-10":{icao:"D10",seats:270,src:"typ"},
 "McDonnell Douglas DC-10-30":{icao:"D11",seats:270,src:"typ"},
 "Pilatus PC-24":{icao:null,seats:10,src:"typ",note:"No ICAO equivalent-aircraft row — business jet, outside the ICEC fleet. Cannot be costed with this method."}
};

/* operator fleets — counts are active airframes from the fleet sheet
   (planespotters.net, South Africa).  0 = type retired/inactive. */
var FLEET={
 "Airlink":[["Boeing 737-300",0],["British Aerospace 146-200",0],["British Aerospace Avro RJ85",0],["British Aerospace Jetstream 41",0],["Embraer E195-E2",4],["Embraer ERJ-135",16],["Embraer ERJ-140",11],["Embraer ERJ-145",0],["Embraer ERJ-170",2],["Embraer ERJ-175",4],["Embraer ERJ-190",28],["Embraer ERJ-195",6]],
 "Aeronexus Corporation":[["Boeing 767-200",0],["Boeing 767-300",1]],
 "Africa Charter Airline":[["Boeing 737-200",0],["Boeing 737-300",3],["Boeing 737-400",3],["Boeing 737-500",1],["McDonnell Douglas MD-83",0]],
 "Avex Air Transport":[["Dornier 328JET-300",2]],
 "Bid Air Cargo":[["Boeing 737-200",0],["Boeing 737-300",4],["Boeing 737-400",2]],
 "Cemair":[["Bombardier CRJ-100",4],["Bombardier CRJ-200",6],["Bombardier CRJ-700",1],["Bombardier CRJ-900",8],["De Havilland Canada DHC-8-100",1],["De Havilland Canada DHC-8-300",2],["De Havilland DHC-8-400",4]],
 "Cobra Aviation":[["Boeing 737-300",2]],
 "Comair Flight Services":[["Pilatus PC-24",1]],
 "Execujet Aviation":[["Embraer ERJ-135",1],["Pilatus PC-24",3]],
 "Federal Airline":[["ATR 42",0],["British Aerospace Jetstream 31",0],["Embraer ERJ-145",2]],
 "FlySafair":[["Boeing 737-300",0],["Boeing 737-400",4],["Boeing 737-800",37]],
 "Global Aviation Operations":[["Airbus A320-200",5],["Airbus A340-500",0],["Airbus A340-600",0],["Boeing 737-300",1],["Boeing 737-400",1],["British Aerospace Jetstream 31",0],["McDonnell Douglas DC-9-30",0],["McDonnell Douglas DC-10-10",0],["McDonnell Douglas DC-10-30",0],["McDonnell Douglas MD-82",0]],
 "Lift":[["Airbus A320-200",4],["Boeing 737-300",1],["Boeing 737-400",1]],
 "National Airways Corporation":[["De Havilland Canada DHC-6-300 Twin Otter",0],["Embraer EMB-120 Brasilia",2],["Embraer ERJ-145",0]],
 "Paramount Aerospace Systems":[["Boeing 737-500",1]],
 "Safair":[["Boeing 737-200",0],["Boeing 737-300",1],["Boeing 737-400",1],["British Aerospace 146-100",0],["British Aerospace 146-200",0],["McDonnell Douglas MD-82",0],["McDonnell Douglas MD-83",0]],
 "Sahara African Aviation":[["Embraer EMB-120 Brasilia",10],["Embraer ERJ-145",2]],
 "Solenta Aviation":[["ATR 42",0],["ATR 72",5],["De Havilland Canada DHC-6-300 Twin Otter",0],["Embraer ERJ-135",1],["Embraer ERJ-145",2]],
 "South African Airways":[["Airbus A300B2",0],["Airbus A300B4",0],["Airbus A319-100",0],["Airbus A320-200",15],["Airbus A330-200",0],["Airbus A330-300",2],["Airbus A340-200",0],["Airbus A340-300",2],["Airbus A340-600",0],["Airbus A350-900",0],["Boeing 737-200",0],["Boeing 737-300",0],["Boeing 737-800",0],["Boeing 747-200",0],["Boeing 747-300",0],["Boeing 747-400",0],["Boeing 747SP",0],["Boeing 767-200",0]],
 "Star Air":[["Boeing 737-200",0],["Boeing 737-300",6],["Boeing 737-400",0]],
 "Summerset Charters":[["Dornier Do-228-200",0],["Embraer EMB-120 Brasilia",1]],
 "Swift Flite":[["Dornier 328-100",1],["Embraer EMB-120 Brasilia",1]],
 "TAB Charters":[["Embraer EMB-120 Brasilia",1]]
};

/* ============================================================
   Airports.  reg = ICAO route-group region used to pick the
   passenger load factor and passenger-to-cargo factor.
   ZA = South Africa (domestic when both ends are ZA).
   ============================================================ */
var AIRPORTS={
 /* --- South Africa --- */
 JNB:{n:"OR Tambo, Johannesburg",lat:-26.1392,lon:28.2460,reg:"ZA"},
 HLA:{n:"Lanseria, Johannesburg",lat:-25.9385,lon:27.9261,reg:"ZA"},
 CPT:{n:"Cape Town International",lat:-33.9648,lon:18.6017,reg:"ZA"},
 DUR:{n:"King Shaka, Durban",lat:-29.6144,lon:31.1197,reg:"ZA"},
 PLZ:{n:"Chief Dawid Stuurman, Gqeberha",lat:-33.9849,lon:25.6173,reg:"ZA"},
 ELS:{n:"East London",lat:-33.0356,lon:27.8258,reg:"ZA"},
 BFN:{n:"Bram Fischer, Bloemfontein",lat:-29.0927,lon:26.3024,reg:"ZA"},
 GRJ:{n:"George",lat:-34.0056,lon:22.3789,reg:"ZA"},
 MQP:{n:"Kruger Mpumalanga, Mbombela",lat:-25.3832,lon:31.1056,reg:"ZA"},
 HDS:{n:"Hoedspruit (Greater Kruger)",lat:-24.3686,lon:31.0487,reg:"ZA"},
 SZK:{n:"Skukuza (Kruger NP)",lat:-24.9609,lon:31.5887,reg:"ZA"},
 PHW:{n:"Hendrik Van Eck, Phalaborwa",lat:-23.9372,lon:31.1554,reg:"ZA"},
 AAM:{n:"Mala Mala",lat:-24.8181,lon:31.5453,reg:"ZA"},
 RCB:{n:"Richards Bay (iSimangaliso)",lat:-28.7410,lon:32.0921,reg:"ZA"},
 PZB:{n:"Pietermaritzburg",lat:-29.6490,lon:30.3987,reg:"ZA"},
 MGH:{n:"Margate",lat:-30.8574,lon:30.3430,reg:"ZA"},
 ULD:{n:"Ulundi",lat:-28.3206,lon:31.4165,reg:"ZA"},
 PTG:{n:"Polokwane International",lat:-23.8453,lon:29.4586,reg:"ZA"},
 NTY:{n:"Pilanesberg",lat:-25.3338,lon:27.1734,reg:"ZA"},
 MBD:{n:"Mahikeng",lat:-25.7987,lon:25.5480,reg:"ZA"},
 KIM:{n:"Kimberley",lat:-28.8028,lon:24.7652,reg:"ZA"},
 UTN:{n:"Upington",lat:-28.3991,lon:21.2602,reg:"ZA"},
 SIS:{n:"Sishen",lat:-27.6486,lon:22.9993,reg:"ZA"},
 OUH:{n:"Oudtshoorn",lat:-33.6069,lon:22.1889,reg:"ZA"},
 /* --- Sub-Saharan Africa (intra) --- */
 GBE:{n:"Gaborone, Botswana",lat:-24.5553,lon:25.9182,reg:"SSA"},
 MUB:{n:"Maun, Botswana",lat:-19.9726,lon:23.4311,reg:"SSA"},
 BBK:{n:"Kasane, Botswana",lat:-17.8329,lon:25.1624,reg:"SSA"},
 WDH:{n:"Hosea Kutako, Windhoek",lat:-22.4799,lon:17.4709,reg:"SSA"},
 WVB:{n:"Walvis Bay, Namibia",lat:-22.9799,lon:14.6453,reg:"SSA"},
 MSU:{n:"Moshoeshoe I, Maseru",lat:-29.4623,lon:27.5525,reg:"SSA"},
 SHO:{n:"King Mswati III, Eswatini",lat:-26.3585,lon:31.7169,reg:"SSA"},
 HRE:{n:"Harare, Zimbabwe",lat:-17.9319,lon:31.0928,reg:"SSA"},
 BUQ:{n:"Bulawayo, Zimbabwe",lat:-20.0174,lon:28.6179,reg:"SSA"},
 VFA:{n:"Victoria Falls, Zimbabwe",lat:-18.0959,lon:25.8390,reg:"SSA"},
 LVI:{n:"Livingstone, Zambia",lat:-17.8218,lon:25.8227,reg:"SSA"},
 LUN:{n:"Lusaka, Zambia",lat:-15.3308,lon:28.4526,reg:"SSA"},
 NLA:{n:"Ndola, Zambia",lat:-12.9981,lon:28.6650,reg:"SSA"},
 BLZ:{n:"Blantyre, Malawi",lat:-15.6791,lon:34.9740,reg:"SSA"},
 LLW:{n:"Lilongwe, Malawi",lat:-13.7894,lon:33.7810,reg:"SSA"},
 MPM:{n:"Maputo, Mozambique",lat:-25.9208,lon:32.5726,reg:"SSA"},
 BEW:{n:"Beira, Mozambique",lat:-19.7964,lon:34.9076,reg:"SSA"},
 VNX:{n:"Vilankulo, Mozambique",lat:-22.0184,lon:35.3133,reg:"SSA"},
 TET:{n:"Tete, Mozambique",lat:-16.1048,lon:33.6402,reg:"SSA"},
 POL:{n:"Pemba, Mozambique",lat:-12.9917,lon:40.5240,reg:"SSA"},
 NBO:{n:"Jomo Kenyatta, Nairobi",lat:-1.3192,lon:36.9278,reg:"SSA"},
 MBA:{n:"Mombasa, Kenya",lat:-4.0348,lon:39.5942,reg:"SSA"},
 DAR:{n:"Dar es Salaam, Tanzania",lat:-6.8781,lon:39.2026,reg:"SSA"},
 JRO:{n:"Kilimanjaro, Tanzania",lat:-3.4294,lon:37.0745,reg:"SSA"},
 ZNZ:{n:"Zanzibar, Tanzania",lat:-6.2220,lon:39.2249,reg:"SSA"},
 EBB:{n:"Entebbe, Uganda",lat:0.0424,lon:32.4435,reg:"SSA"},
 KGL:{n:"Kigali, Rwanda",lat:-1.9686,lon:30.1395,reg:"SSA"},
 ADD:{n:"Addis Ababa, Ethiopia",lat:8.9779,lon:38.7993,reg:"SSA"},
 LAD:{n:"Luanda, Angola",lat:-8.8584,lon:13.2312,reg:"SSA"},
 FIH:{n:"Kinshasa, DR Congo",lat:-4.3858,lon:15.4446,reg:"SSA"},
 FBM:{n:"Lubumbashi, DR Congo",lat:-11.5913,lon:27.5309,reg:"SSA"},
 LOS:{n:"Lagos, Nigeria",lat:6.5774,lon:3.3212,reg:"SSA"},
 ABV:{n:"Abuja, Nigeria",lat:9.0068,lon:7.2632,reg:"SSA"},
 ACC:{n:"Accra, Ghana",lat:5.6052,lon:-0.1668,reg:"SSA"},
 DKR:{n:"Dakar, Senegal",lat:14.6710,lon:-17.0732,reg:"SSA"},
 TNR:{n:"Antananarivo, Madagascar",lat:-18.7969,lon:47.4788,reg:"SSA"},
 NOS:{n:"Nosy Be, Madagascar",lat:-13.3121,lon:48.3148,reg:"SSA"},
 MRU:{n:"Mauritius",lat:-20.4302,lon:57.6836,reg:"SSA"},
 RUN:{n:"Réunion",lat:-20.8871,lon:55.5103,reg:"SSA"},
 SEZ:{n:"Seychelles",lat:-4.6743,lon:55.5218,reg:"SSA"},
 HAH:{n:"Moroni, Comoros",lat:-11.5337,lon:43.2719,reg:"SSA"},
 HLE:{n:"St Helena",lat:-15.9576,lon:-5.6459,reg:"SSA"},
 /* --- Europe --- */
 LHR:{n:"London Heathrow",lat:51.4700,lon:-0.4543,reg:"EUR"},
 FRA:{n:"Frankfurt",lat:50.0379,lon:8.5622,reg:"EUR"},
 MUC:{n:"Munich",lat:48.3537,lon:11.7750,reg:"EUR"},
 CDG:{n:"Paris Charles de Gaulle",lat:49.0097,lon:2.5479,reg:"EUR"},
 AMS:{n:"Amsterdam Schiphol",lat:52.3105,lon:4.7683,reg:"EUR"},
 ZRH:{n:"Zurich",lat:47.4647,lon:8.5492,reg:"EUR"},
 BRU:{n:"Brussels",lat:50.9014,lon:4.4844,reg:"EUR"},
 LIS:{n:"Lisbon",lat:38.7756,lon:-9.1354,reg:"EUR"},
 MAD:{n:"Madrid",lat:40.4719,lon:-3.5626,reg:"EUR"},
 IST:{n:"Istanbul",lat:41.2753,lon:28.7519,reg:"EUR"},
 /* --- North Africa --- */
 CAI:{n:"Cairo, Egypt",lat:30.1219,lon:31.4056,reg:"NAF"},
 /* --- Middle East --- */
 DXB:{n:"Dubai",lat:25.2532,lon:55.3657,reg:"MEA"},
 DOH:{n:"Doha, Qatar",lat:25.2731,lon:51.6080,reg:"MEA"},
 AUH:{n:"Abu Dhabi",lat:24.4330,lon:54.6511,reg:"MEA"},
 TLV:{n:"Tel Aviv",lat:32.0114,lon:34.8867,reg:"MEA"},
 /* --- North America --- */
 JFK:{n:"New York JFK",lat:40.6413,lon:-73.7781,reg:"NAM"},
 EWR:{n:"Newark",lat:40.6895,lon:-74.1745,reg:"NAM"},
 ATL:{n:"Atlanta",lat:33.6407,lon:-84.4277,reg:"NAM"},
 IAD:{n:"Washington Dulles",lat:38.9531,lon:-77.4565,reg:"NAM"},
 /* --- South America --- */
 GRU:{n:"São Paulo Guarulhos",lat:-23.4356,lon:-46.4731,reg:"SAM"},
 /* --- South West Asia --- */
 BOM:{n:"Mumbai",lat:19.0896,lon:72.8656,reg:"SWA"},
 DEL:{n:"Delhi",lat:28.5562,lon:77.1000,reg:"SWA"},
 /* --- North Asia --- */
 HKG:{n:"Hong Kong",lat:22.3080,lon:113.9185,reg:"NAS"},
 CAN:{n:"Guangzhou",lat:23.3924,lon:113.2988,reg:"NAS"},
 /* --- Pacific South East Asia --- */
 SIN:{n:"Singapore Changi",lat:1.3644,lon:103.9915,reg:"PSEA"},
 PER:{n:"Perth, Australia",lat:-31.9403,lon:115.9670,reg:"PSEA"},
 SYD:{n:"Sydney, Australia",lat:-33.9399,lon:151.1753,reg:"PSEA"}
};

/* ICAO v9 Appendix A route groups reachable from South Africa.
   [group number, label, passenger load factor, passenger-to-cargo factor] */
var GROUPS={
 ZA_DOM:[75,"Sub Saharan Africa Domestic",0.7112,0.8441],
 SSA:[74,"Intra Sub Saharan Africa",0.6540,0.8441],
 EUR:[32,"Europe – Sub Saharan Africa",0.7831,0.8216],
 NAM:[56,"North America – Sub Saharan Africa",0.7693,0.9074],
 MEA:[41,"Middle East – Sub Saharan Africa",0.7320,0.8309],
 SAM:[70,"South America – Sub Saharan Africa",0.6458,0.8441],
 NAF:[49,"North Africa – Sub Saharan Africa",0.6540,0.8441],
 PSEA:[67,"Pacific South East Asia – Sub Saharan Africa",0.7308,0.8390],
 NAS:[62,"North Asia – Sub Saharan Africa",0.7308,0.8390],
 SWA:[73,"South West Asia – Sub Saharan Africa",0.7308,0.8390]
};

/* ============================================================
   Constants
   ============================================================ */

/* ============================================================
   Constants
   ============================================================ */
const CO2_PER_KG_FUEL = 3.16;   // kg CO2 per kg jet fuel (ICEC v9 §3)
const KM_PER_NM       = 1.852;  // international standard

/* ICAO v9 §4.2 — detour correction is banded by GCD, not fixed */
function detourFor(km) {
  if (km < 550)    return { km: 50,  band: '< 550 km' };
  if (km <= 5500)  return { km: 100, band: '550 – 5 500 km' };
  return             { km: 125, band: '> 5 500 km' };
}

/* ------------------------------------------------------------
   In-service filter
   A type counts as in service if at least one operator in FLEET
   lists a non-zero airframe count for it.
   ------------------------------------------------------------ */
function inServiceModels() {
  const active = new Set();
  Object.keys(FLEET).forEach(op => {
    FLEET[op].forEach(([model, count]) => {
      if (count > 0) active.add(model);
    });
  });
  return active;
}

function operatorActiveModels(op) {
  if (!FLEET[op]) return [];
  return FLEET[op].filter(([, count]) => count > 0).map(([model]) => model);
}
