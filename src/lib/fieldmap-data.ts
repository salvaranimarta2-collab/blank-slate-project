// FieldMap seed data: refugee-led organizations and their projects.
// Static, in-memory dataset — trust-based, no verification, no backend.
// Past EfR (Energy for Refugees) projects sourced from energyforrefugees.com/past-projects.

export type OrgType =
  | "community-based"
  | "refugee-led"
  | "diaspora-led"
  | "local NGO";

export type OrgStrength =
  | "community trust"
  | "local knowledge"
  | "ground delivery capacity"
  | "established beneficiary relationships"
  | "language/cultural access"
  | "volunteer network";

export type Category =
  | "energy"
  | "water/WASH"
  | "education"
  | "healthcare"
  | "livelihoods"
  | "shelter"
  | "legal aid"
  | "protection"
  | "food security";

export type Expertise =
  | "engineering"
  | "medical"
  | "legal"
  | "agricultural"
  | "IT"
  | "project management";

export type BeneficiaryRange =
  | "under 100"
  | "100–500"
  | "500–2,000"
  | "2,000+";

export type ProjectStatus =
  | "seeking support"
  | "partially supported"
  | "fully supported";

export type ProjectType = "time-bound" | "ongoing";

export type EntityKind = "RLO" | "NGO";

export interface Organization {
  id: string;
  name: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  phone: string;
  description?: string;
  yearFounded?: number;
  orgType: OrgType;
  brings: OrgStrength[];
  entityKind?: EntityKind; // defaults to "RLO"
}


export interface Project {
  id: string;
  orgId: string;
  title: string;
  category: Category;
  type: ProjectType;
  targetDate?: string; // ISO yyyy-mm-dd if time-bound
  locationLabel: string; // human-readable
  lat: number;
  lng: number;
  description: string;
  beneficiaries: BeneficiaryRange;
  needs: {
    funding?: { amount: number; currency: "USD" | "EUR"; raised?: number };
    equipment?: string;
    expertise?: Expertise[];
    training?: string;
    partnership?: boolean;
  };
  status: ProjectStatus;
  photos?: string[];
  partnerOrgIds?: string[]; // co-implementing orgs (NGO↔RLO partnerships)
}


export const organizations: Organization[] = [
  {
    id: "org-efr",
    name: "Energy for Refugees",
    country: "Netherlands",
    region: "Delft, South Holland",
    lat: 52.0022,
    lng: 4.3736,
    phone: "+31152780000",
    description:
      "TU Delft student-led NGO designing, financing, and installing solar PV systems for refugee-serving facilities worldwide. Born out of the Energy Club at TU Delft in 2017.",
    yearFounded: 2017,
    orgType: "local NGO",
    brings: ["ground delivery capacity", "volunteer network"],
    entityKind: "NGO",
  },
  {
    id: "org-ki4bli",
    name: "Ki4Bli",
    country: "Kenya",
    region: "Kakuma, Turkana County",
    lat: 3.7167,
    lng: 34.8667,
    phone: "+254712345010",
    description:
      "Refugee-led organisation based in Kakuma Refugee Camp running a vocational centre that trains youth from Kalobeyei and Kakuma in coding, video editing and digital marketing for online work.",
    yearFounded: 2020,
    orgType: "refugee-led",
    brings: [
      "community trust",
      "established beneficiary relationships",
      "ground delivery capacity",
    ],
    entityKind: "RLO",
  },
  {
    id: "org-bohsin",
    name: "Bohşin-Imam Hatip Middle School",
    country: "Türkiye",
    region: "Hatay Province",
    lat: 36.2025,
    lng: 36.1606,
    phone: "+903262170020",
    description:
      "Public middle school in Hatay that absorbed displaced students after the February 2023 earthquakes destroyed surrounding schools. Capacity grew from 800 to 1,500 children almost overnight.",
    yearFounded: 2005,
    orgType: "local NGO",
    brings: [
      "established beneficiary relationships",
      "community trust",
    ],
    entityKind: "NGO",
  },
  {
    id: "org-tuyoor",
    name: "Tuyoor Al Amal School",
    country: "Lebanon",
    region: "Tripoli, North Governorate",
    lat: 34.4332,
    lng: 35.8442,
    phone: "+9616800030",
    description:
      "Community school in Tripoli founded by Mustafa to provide a safe learning environment for Lebanese children and Syrian refugee children together. Combines basic schooling with after-school support.",
    yearFounded: 2016,
    orgType: "community-based",
    brings: [
      "community trust",
      "language/cultural access",
      "established beneficiary relationships",
    ],
    entityKind: "RLO",
  },
  {
    id: "org-habibi",
    name: "Habibi.Works",
    country: "Greece",
    region: "Katsikas, Epirus",
    lat: 39.6325,
    lng: 20.8852,
    phone: "+302651500040",
    description:
      "Intercultural maker space at the Katsikas refugee camp offering workshops in woodworking, metalwork, sewing, gardening, music and a gym so refugees can practise skills and provide services to one another.",
    yearFounded: 2017,
    orgType: "local NGO",
    brings: [
      "ground delivery capacity",
      "volunteer network",
      "established beneficiary relationships",
    ],
    entityKind: "NGO",
  },
  {
    id: "org-fm4",
    name: "FM4 Paso Libre",
    country: "Mexico",
    region: "Guadalajara, Jalisco",
    lat: 20.6597,
    lng: -103.3496,
    phone: "+523336140050",
    description:
      "Guadalajara-based civil organisation accompanying migrants and refugees in transit through western Mexico with food, shelter, medical and reintegration support.",
    yearFounded: 2007,
    orgType: "local NGO",
    brings: [
      "ground delivery capacity",
      "established beneficiary relationships",
      "language/cultural access",
    ],
    entityKind: "NGO",
  },
  {
    id: "org-eurorelief",
    name: "EuroRelief",
    country: "Greece",
    region: "Lesvos, North Aegean",
    lat: 39.1067,
    lng: 26.5556,
    phone: "+302251000060",
    description:
      "Greek NGO running the main residential section of the Moria refugee camp on Lesvos, coordinating shelter allocation, safety, distribution, and on-site services.",
    yearFounded: 2015,
    orgType: "local NGO",
    brings: ["ground delivery capacity", "volunteer network"],
    entityKind: "NGO",
  },
  {
    id: "org-adi",
    name: "African Development Initiative",
    country: "Nigeria",
    region: "Delta State / Calabar",
    lat: 4.9589,
    lng: 8.3269,
    phone: "+234802000070",
    description:
      "Nigerian NGO supporting internally displaced communities across the south of the country with assessments, advocacy and basic-needs response in camps without on-the-ground UN partners.",
    yearFounded: 2014,
    orgType: "local NGO",
    brings: [
      "local knowledge",
      "ground delivery capacity",
      "established beneficiary relationships",
    ],
    entityKind: "NGO",
  },
  {
    id: "org-karatepe",
    name: "Kara Tepe Community School",
    country: "Greece",
    region: "Lesvos, North Aegean",
    lat: 39.1167,
    lng: 26.5333,
    phone: "+302251000080",
    description:
      "Volunteer-run classroom inside the Kara Tepe site on Lesvos, providing structured lessons to children waiting on asylum decisions.",
    yearFounded: 2016,
    orgType: "community-based",
    brings: [
      "community trust",
      "volunteer network",
      "established beneficiary relationships",
    ],
    entityKind: "RLO",
  },
  {
    id: "org-refugees-welcome-it",
    name: "Refugees Welcome Italia",
    country: "Italy",
    region: "Milan, Lombardy",
    lat: 45.4642,
    lng: 9.19,
    phone: "+390200900110",
    description:
      "Refugee- and migrant-led association matching newly recognised refugees with Italian families willing to host them. Active in 15+ Italian cities, with peer mentors guiding hosts and guests through cohabitation.",
    yearFounded: 2015,
    orgType: "refugee-led",
    brings: ["community trust", "language/cultural access", "volunteer network"],
    entityKind: "RLO",
  },
  {
    id: "org-singa-fr",
    name: "SINGA France",
    country: "France",
    region: "Paris, Île-de-France",
    lat: 48.8566,
    lng: 2.3522,
    phone: "+33142000120",
    description:
      "Refugee-led community building entrepreneurship programmes (the SINGA Incubator) and peer connections between newcomers and locals. Operating in Paris, Lyon, Lille and Bordeaux.",
    yearFounded: 2012,
    orgType: "refugee-led",
    brings: ["community trust", "language/cultural access", "established beneficiary relationships"],
    entityKind: "RLO",
  },
  {
    id: "org-migrateful-uk",
    name: "Migrateful",
    country: "United Kingdom",
    region: "London",
    lat: 51.5074,
    lng: -0.1278,
    phone: "+442070000130",
    description:
      "Refugee- and migrant-led social enterprise running cookery classes taught by chefs from refugee backgrounds, funding language training, work permits and integration support.",
    yearFounded: 2017,
    orgType: "refugee-led",
    brings: ["language/cultural access", "community trust", "volunteer network"],
    entityKind: "RLO",
  },
  {
    id: "org-women-for-refugee-women",
    name: "Women for Refugee Women",
    country: "United Kingdom",
    region: "London",
    lat: 51.5145,
    lng: -0.099,
    phone: "+442072500140",
    description:
      "Refugee-women-led charity supporting women who have sought safety in the UK. Runs English classes, drama, advocacy training and the London Refugee Women's Forum.",
    yearFounded: 2007,
    orgType: "refugee-led",
    brings: ["community trust", "language/cultural access", "established beneficiary relationships"],
    entityKind: "RLO",
  },
  {
    id: "org-give-something-back",
    name: "Give Something Back To Berlin",
    country: "Germany",
    region: "Berlin",
    lat: 52.52,
    lng: 13.405,
    phone: "+493090000150",
    description:
      "Berlin-based community platform co-led by newcomers and locals. Runs Open Art Shelter, Kitchen on the Run, and skills workshops connecting refugees with the city's creative and tech scene.",
    yearFounded: 2013,
    orgType: "refugee-led",
    brings: ["volunteer network", "community trust", "language/cultural access"],
    entityKind: "RLO",
  },
  {
    id: "org-utopia-56-syr",
    name: "Syrian Volunteers Netherlands",
    country: "Netherlands",
    region: "Amsterdam, North Holland",
    lat: 52.3676,
    lng: 4.9041,
    phone: "+31206000160",
    description:
      "Syrian diaspora-led volunteer network across the Netherlands offering peer integration, language buddies, mental-health peer support and cultural mediation for newly arrived Syrians and other Arabic-speaking refugees.",
    yearFounded: 2016,
    orgType: "diaspora-led",
    brings: ["language/cultural access", "community trust", "volunteer network"],
    entityKind: "RLO",
  },
  {
    id: "org-refugee-trauma-initiative",
    name: "Refugee Trauma Initiative",
    country: "Greece",
    region: "Athens, Attica",
    lat: 37.9838,
    lng: 23.7275,
    phone: "+302100000170",
    description:
      "Refugee-led mental health and psychosocial organisation training community facilitators from displaced backgrounds to deliver trauma-informed early-childhood and family programmes in Athens and Thessaloniki.",
    yearFounded: 2016,
    orgType: "refugee-led",
    brings: ["language/cultural access", "community trust", "established beneficiary relationships"],
    entityKind: "RLO",
  },
  {
    id: "org-estonian-refugee-council",
    name: "Mosaik Support Centre",
    country: "Greece",
    region: "Mytilene, Lesvos",
    lat: 39.1078,
    lng: 26.5547,
    phone: "+302251000180",
    description:
      "Community centre on Lesvos co-founded and co-run with refugee residents. Offers language classes, legal info, women's space and a community kitchen open to islanders and asylum seekers alike.",
    yearFounded: 2017,
    orgType: "refugee-led",
    brings: ["community trust", "language/cultural access", "volunteer network"],
    entityKind: "RLO",
  },
];



export const projects: Project[] = [
  {
    id: "p-efr-2025-kakuma",
    orgId: "org-ki4bli",
    title: "58.5 kWp solar system for Kakuma vocational centre",
    category: "energy",
    type: "time-bound",
    targetDate: "2025-09-30",
    locationLabel: "Kakuma Refugee Camp, Turkana County, Kenya",
    lat: 3.7167,
    lng: 34.8667,
    description:
      "Installation of a 58.5 kWp solar PV system with battery storage and inverters powering Ki4Bli's vocational centre inside Kakuma Refugee Camp. The centre trains youth from Kalobeyei and Kakuma in coding, editing and digital marketing so they can access online jobs from a powered workspace. The system removes roughly KSH 1,500 per day in electricity-token costs from operations.",
    beneficiaries: "500–2,000",
    needs: {
      funding: { amount: 75000, currency: "EUR", raised: 75000 },
      equipment: "58.5 kWp PV modules, batteries, inverters",
      expertise: ["engineering", "project management"],
      partnership: true,
    },
    status: "fully supported",
    partnerOrgIds: ["org-efr"],
  },
  {
    id: "p-efr-2024-hatay",
    orgId: "org-bohsin",
    title: "9.9 kWp solar + 10 kWh battery for earthquake-affected school",
    category: "energy",
    type: "time-bound",
    targetDate: "2024-11-30",
    locationLabel: "Bohşin-Imam Hatip Middle School, Hatay, Türkiye",
    lat: 36.2025,
    lng: 36.1606,
    description:
      "After the February 2023 earthquakes, Bohşin-Imam Hatip Middle School absorbed displaced students and saw enrolment grow from 800 to 1,500 children. Grid power is unreliable with frequent daytime outages. EfR's 2024 team installed 18 PV modules totalling 9.9 kWp, 10 kW of inverters and 10 kWh of battery storage, fully covering the building's energy demand and removing outage-driven disruption from lessons.",
    beneficiaries: "500–2,000",
    needs: {
      funding: { amount: 32000, currency: "EUR", raised: 32000 },
      equipment: "18 PV modules, 10 kW inverter, 10 kWh battery",
      expertise: ["engineering"],
      partnership: true,
    },
    status: "fully supported",
    partnerOrgIds: ["org-efr"],
  },
  {
    id: "p-efr-2023-tripoli",
    orgId: "org-tuyoor",
    title: "9.8 kWp solar with 8.7 kWh storage for Tuyoor Al Amal school",
    category: "energy",
    type: "time-bound",
    targetDate: "2023-09-30",
    locationLabel: "Tuyoor Al Amal School, Tripoli, Lebanon",
    lat: 34.4332,
    lng: 35.8442,
    description:
      "Before the project, the school had only 1–2 hours of grid electricity per day and depended on an expensive, polluting diesel generator. In September 2023, the EfR team installed a 9.8 kWp solar PV system with 8.7 kWh of battery storage and 20 kW of inverter capacity, allowing children and staff at the Lebanese-Syrian community school to be powered by renewable energy 24/7.",
    beneficiaries: "100–500",
    needs: {
      funding: { amount: 28000, currency: "EUR", raised: 28000 },
      equipment: "9.8 kWp PV array, 8.7 kWh battery, 20 kW inverters",
      expertise: ["engineering"],
      partnership: true,
    },
    status: "fully supported",
    partnerOrgIds: ["org-efr"],
  },
  {
    id: "p-efr-2022-katsikas",
    orgId: "org-habibi",
    title: "4.1 kWp solar PV for Habibi.Works maker space",
    category: "energy",
    type: "time-bound",
    targetDate: "2022-09-08",
    locationLabel: "Habibi.Works, Katsikas refugee camp, Greece",
    lat: 39.6325,
    lng: 20.8852,
    description:
      "Habibi.Works is a maker space at Katsikas refugee camp with woodworking, metal, sewing, garden, music and gym facilities. Between August and September 2022, EfR installed a 4.1 kWp solar PV system with battery storage, a charge controller and an inverter. The system cuts roughly €1,500 from Habibi.Works' annual energy costs, freeing donor funds for programming.",
    beneficiaries: "500–2,000",
    needs: {
      funding: { amount: 12000, currency: "EUR", raised: 12000 },
      equipment: "4.1 kWp PV array, charge controller, battery, inverter",
      expertise: ["engineering"],
      partnership: true,
    },
    status: "fully supported",
    partnerOrgIds: ["org-efr"],
  },
  {
    id: "p-efr-2021-guadalajara",
    orgId: "org-fm4",
    title: "2.5 kWp solar system for FM4 Paso Libre shelter",
    category: "energy",
    type: "time-bound",
    targetDate: "2021-12-31",
    locationLabel: "FM4 Paso Libre, Guadalajara, Mexico",
    lat: 20.6597,
    lng: -103.3496,
    description:
      "During the COVID-19 pandemic, FM4 Paso Libre needed to redirect every available peso to food, medical supplies and direct support for migrants in transit. EfR financed and oversaw a 2.5 kWp solar PV system delivered and installed in collaboration with local installer Grupo Beet, removing the shelter's electricity bills and shifting operations to 100% renewable energy.",
    beneficiaries: "500–2,000",
    needs: {
      funding: { amount: 8000, currency: "USD", raised: 8000 },
      equipment: "2.5 kWp PV array, inverter",
      expertise: ["engineering"],
      partnership: true,
    },
    status: "fully supported",
    partnerOrgIds: ["org-efr"],
  },
  {
    id: "p-efr-2020-moria",
    orgId: "org-eurorelief",
    title: "Solar street lighting for safety routes (cancelled)",
    category: "protection",
    type: "time-bound",
    targetDate: "2020-12-31",
    locationLabel: "Moria Refugee Camp, Lesvos, Greece",
    lat: 39.1067,
    lng: 26.5556,
    description:
      "Designed in partnership with EuroRelief, this project would have replaced broken or grid-tied lamps with modular self-sustaining solar PV lights along validated walking routes inside Moria, aimed at reducing sexual and gender-based violence at night. The project was cancelled after COVID-19 lockdowns turned Moria into a closed camp and the September 2020 fire destroyed the camp layout the design relied on.",
    beneficiaries: "2,000+",
    needs: {
      funding: { amount: 20000, currency: "EUR", raised: 6000 },
      equipment: "Modular solar PV street lamps",
      expertise: ["engineering"],
      partnership: true,
    },
    status: "partially supported",
    partnerOrgIds: ["org-efr"],
  },
  {
    id: "p-efr-2020-calabar",
    orgId: "org-adi",
    title: "Solar PV lamps and water pump assessment, Calabar IDP camp",
    category: "energy",
    type: "time-bound",
    targetDate: "2020-12-31",
    locationLabel: "IDP Camp, Calabar, Delta State, Nigeria",
    lat: 4.9589,
    lng: 8.3269,
    description:
      "EfR worked with African Development Initiative to design modular solar PV lamps prioritising the women-and-children quarter of the camp, alongside a feasibility assessment for a solar water pump. Lead contamination ruled out pumping the local groundwater. Six months into delivery, COVID-19 reclassified Nigeria as a red-zone country, internal sponsors blocked travel, and the project was halted before installation.",
    beneficiaries: "500–2,000",
    needs: {
      funding: { amount: 15000, currency: "USD", raised: 4500 },
      equipment: "Modular solar PV lamps, surveying tools",
      expertise: ["engineering", "project management"],
      partnership: true,
    },
    status: "partially supported",
    partnerOrgIds: ["org-efr"],
  },
  {
    id: "p-efr-2019-moria",
    orgId: "org-eurorelief",
    title: "25 kWp solar PV system for Moria refugee camp",
    category: "energy",
    type: "time-bound",
    targetDate: "2019-09-30",
    locationLabel: "Moria Refugee Camp, Lesvos, Greece",
    lat: 39.1067,
    lng: 26.5556,
    description:
      "Designed, funded, procured and installed in partnership with EuroRelief, this 25 kWp system used 90 PV modules and 2 inverters to reduce the frequency and duration of black-outs in Europe's largest refugee camp, especially in winter when heating demand spikes. The system displaces roughly 9,000 litres of diesel per year — around €12,600 in fuel savings redirected to camp services and 24,000 kg of CO₂ avoided annually.",
    beneficiaries: "2,000+",
    needs: {
      funding: { amount: 45000, currency: "EUR", raised: 45000 },
      equipment: "90 PV modules, 2 inverters, cabling and protection",
      expertise: ["engineering", "project management"],
      partnership: true,
    },
    status: "fully supported",
    partnerOrgIds: ["org-efr"],
  },
  {
    id: "p-efr-2018-karatepe",
    orgId: "org-karatepe",
    title: "5 kWp solar PV system for Kara Tepe classroom",
    category: "energy",
    type: "time-bound",
    targetDate: "2018-09-30",
    locationLabel: "Kara Tepe camp, Lesvos, Greece",
    lat: 39.1167,
    lng: 26.5333,
    description:
      "The very first EfR project. A team of master's students from different faculties and nationalities designed and installed a 5 kWp solar PV system in a classroom at the Kara Tepe camp in summer 2018, powering structured lessons for children awaiting asylum decisions.",
    beneficiaries: "100–500",
    needs: {
      funding: { amount: 9000, currency: "EUR", raised: 9000 },
      equipment: "5 kWp PV array, inverter, cabling",
      expertise: ["engineering"],
      partnership: true,
    },
    status: "fully supported",
    partnerOrgIds: ["org-efr"],
  },
  {
    id: "p-rwit-hosting",
    orgId: "org-refugees-welcome-it",
    title: "Family hosting programme — 60 new matches",
    category: "shelter",
    type: "ongoing",
    locationLabel: "Milan and 15+ Italian cities",
    lat: 45.4642,
    lng: 9.19,
    description:
      "Scaling the family-hosting model that pairs newly recognised refugees with Italian host families for 6–12 months, with trained mediators supporting both sides through the cohabitation.",
    beneficiaries: "100–500",
    needs: {
      funding: { amount: 60000, currency: "EUR", raised: 18000 },
      expertise: ["project management"],
      partnership: true,
    },
    status: "partially supported",
  },
  {
    id: "p-singa-incubator",
    orgId: "org-singa-fr",
    title: "SINGA Incubator cohort for refugee entrepreneurs",
    category: "livelihoods",
    type: "time-bound",
    targetDate: "2026-06-30",
    locationLabel: "Paris, France",
    lat: 48.8566,
    lng: 2.3522,
    description:
      "Six-month incubator supporting 20 refugee and newcomer founders with mentoring, legal and admin support, working space and seed grants to launch businesses in France.",
    beneficiaries: "under 100",
    needs: {
      funding: { amount: 120000, currency: "EUR", raised: 45000 },
      expertise: ["project management", "legal"],
      partnership: true,
    },
    status: "partially supported",
  },
  {
    id: "p-migrateful-chefs",
    orgId: "org-migrateful-uk",
    title: "Chef training and integration programme",
    category: "livelihoods",
    type: "ongoing",
    locationLabel: "London, United Kingdom",
    lat: 51.5074,
    lng: -0.1278,
    description:
      "Training cohort of refugee and migrant chefs to lead public cookery classes, covering English language, work permits, food safety certification and ongoing income from class fees.",
    beneficiaries: "under 100",
    needs: {
      funding: { amount: 80000, currency: "EUR", raised: 30000 },
      training: "English, food hygiene, teaching skills",
      partnership: true,
    },
    status: "partially supported",
  },
  {
    id: "p-wfrw-london",
    orgId: "org-women-for-refugee-women",
    title: "Refugee women's leadership and advocacy hub",
    category: "protection",
    type: "ongoing",
    locationLabel: "London, United Kingdom",
    lat: 51.5145,
    lng: -0.099,
    description:
      "Weekly programme of English classes, drama, yoga and advocacy training for women seeking asylum in the UK, plus the London Refugee Women's Forum advocating against detention.",
    beneficiaries: "100–500",
    needs: {
      funding: { amount: 90000, currency: "EUR", raised: 40000 },
      expertise: ["legal", "project management"],
      partnership: true,
    },
    status: "partially supported",
  },
  {
    id: "p-gsbtb-berlin",
    orgId: "org-give-something-back",
    title: "Open Art Shelter and skills workshops",
    category: "education",
    type: "ongoing",
    locationLabel: "Berlin, Germany",
    lat: 52.52,
    lng: 13.405,
    description:
      "Creative, language and digital-skills workshops co-designed with newcomers in Berlin, connecting refugees to the city's tech and arts scenes and to paid opportunities.",
    beneficiaries: "500–2,000",
    needs: {
      funding: { amount: 50000, currency: "EUR", raised: 15000 },
      expertise: ["IT", "project management"],
      partnership: true,
    },
    status: "seeking support",
  },
  {
    id: "p-svn-amsterdam",
    orgId: "org-utopia-56-syr",
    title: "Peer mental-health support for Arabic-speaking refugees",
    category: "healthcare",
    type: "ongoing",
    locationLabel: "Amsterdam, Netherlands",
    lat: 52.3676,
    lng: 4.9041,
    description:
      "Trained Syrian peer-support volunteers running group sessions and 1:1 check-ins for Arabic-speaking refugees navigating Dutch mental-health services and asylum waiting periods.",
    beneficiaries: "100–500",
    needs: {
      funding: { amount: 35000, currency: "EUR", raised: 8000 },
      expertise: ["medical", "project management"],
      partnership: true,
    },
    status: "seeking support",
  },
  {
    id: "p-rti-athens",
    orgId: "org-refugee-trauma-initiative",
    title: "Early-childhood trauma-informed programme",
    category: "protection",
    type: "ongoing",
    locationLabel: "Athens, Greece",
    lat: 37.9838,
    lng: 23.7275,
    description:
      "Training facilitators from refugee backgrounds to deliver trauma-informed play, parenting and family sessions in Athens reception sites and community centres.",
    beneficiaries: "500–2,000",
    needs: {
      funding: { amount: 110000, currency: "EUR", raised: 55000 },
      expertise: ["medical", "project management"],
      partnership: true,
    },
    status: "partially supported",
  },
  {
    id: "p-mosaik-lesvos",
    orgId: "org-estonian-refugee-council",
    title: "Mosaik community centre — language and legal info",
    category: "education",
    type: "ongoing",
    locationLabel: "Mytilene, Lesvos, Greece",
    lat: 39.1078,
    lng: 26.5547,
    description:
      "Year-round programme of Greek, English and German classes, women's space, legal info sessions and community kitchen open to asylum seekers and Mytilene residents.",
    beneficiaries: "500–2,000",
    needs: {
      funding: { amount: 70000, currency: "EUR", raised: 20000 },
      expertise: ["legal", "project management"],
      partnership: true,
    },
    status: "seeking support",
  },
];



export const categories: Category[] = [
  "energy",
  "water/WASH",
  "education",
  "healthcare",
  "livelihoods",
  "shelter",
  "legal aid",
  "protection",
  "food security",
];

export const needsOptions = [
  "funding",
  "expertise",
  "equipment",
] as const;
export type NeedFilter = (typeof needsOptions)[number];

export const countries = Array.from(
  new Set(organizations.map((o) => o.country)),
).sort();

export function orgById(id: string) {
  return organizations.find((o) => o.id === id);
}
export function projectsByOrg(orgId: string) {
  return projects.filter((p) => p.orgId === orgId);
}

export function orgKind(o: Organization | undefined | null): EntityKind {
  return o?.entityKind ?? "RLO";
}
