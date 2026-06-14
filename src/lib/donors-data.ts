import type { Category } from "./fieldmap-data";

export type DonorType = "Foundation" | "Individual" | "Corporate" | "Government";

export type Donor = {
  id: string;
  name: string;
  type: DonorType;
  location: string;
  about: string;
  interests: Category[];
  regions: string[];
  ticketSize: string; // e.g. "$10k – $100k"
  contact: string;
  recentlyFunded: number;
};

// NOTE: All donors below are fictional and used for demo purposes only.
// IDs are preserved so existing donations + demo seeding (d-ikea) still resolve.
export const donors: Donor[] = [
  {
    id: "d-ikea",
    name: "Northwind Foundation",
    type: "Foundation",
    location: "Stockholm, Sweden",
    about:
      "Fictional Nordic foundation backing renewable energy access and livelihoods for displaced communities. Multi-year, trust-based partnerships preferred.",
    interests: ["energy", "livelihoods", "shelter"],
    regions: ["East Africa", "Middle East", "South Asia"],
    ticketSize: "$250k – $5M",
    contact: "partnerships@northwind.example",
    recentlyFunded: 14,
  },
  {
    id: "d-open-society",
    name: "Bridgewater Civic Trust",
    type: "Foundation",
    location: "New York, USA",
    about:
      "Demo foundation funding justice, education, public health and independent media for refugee and host communities.",
    interests: ["education", "legal aid", "protection"],
    regions: ["Global"],
    ticketSize: "$50k – $1M",
    contact: "grants@bridgewatertrust.example",
    recentlyFunded: 9,
  },
  {
    id: "d-bmz",
    name: "Federal Agency for Inclusive Development (FAID)",
    type: "Government",
    location: "Berlin, Germany",
    about:
      "Fictional bilateral donor prioritising climate-resilient infrastructure and refugee self-reliance programmes.",
    interests: ["energy", "water/WASH", "livelihoods"],
    regions: ["East Africa", "MENA", "Western Balkans"],
    ticketSize: "€100k – €10M",
    contact: "info@faid.example",
    recentlyFunded: 22,
  },
  {
    id: "d-google-org",
    name: "Lumen.tech Impact",
    type: "Corporate",
    location: "Mountain View, USA",
    about:
      "Demo corporate philanthropy arm of a fictional tech firm. Supports tech-enabled solutions in education, crisis response, and economic opportunity for displaced people.",
    interests: ["education", "livelihoods", "protection"],
    regions: ["Global"],
    ticketSize: "$100k – $2M + in-kind",
    contact: "impact@lumen.example",
    recentlyFunded: 11,
  },
  {
    id: "d-echo",
    name: "European Solidarity Fund (ESF)",
    type: "Government",
    location: "Brussels, Belgium",
    about:
      "Fictional multilateral humanitarian instrument funding life-saving assistance and resilience programmes in crisis-affected regions.",
    interests: ["food security", "shelter", "healthcare", "water/WASH"],
    regions: ["MENA", "Sahel", "East Africa", "Ukraine"],
    ticketSize: "€250k – €15M",
    contact: "info@esf.example",
    recentlyFunded: 31,
  },
  {
    id: "d-conrad-hilton",
    name: "Marlowe Heritage Foundation",
    type: "Foundation",
    location: "Los Angeles, USA",
    about:
      "Demo legacy foundation backing grassroots organisations delivering safe water, education and protection to vulnerable populations.",
    interests: ["water/WASH", "education", "protection"],
    regions: ["East Africa", "West Africa", "Latin America"],
    ticketSize: "$100k – $3M",
    contact: "info@marloweheritage.example",
    recentlyFunded: 7,
  },
  {
    id: "d-shell",
    name: "Helios Energy Foundation",
    type: "Corporate",
    location: "London, UK",
    about:
      "Fictional independent charity that scales early-stage clean energy and mobility enterprises serving low-income and displaced communities.",
    interests: ["energy", "livelihoods"],
    regions: ["Sub-Saharan Africa", "South Asia"],
    ticketSize: "$200k – $2M",
    contact: "info@heliosenergyfdn.example",
    recentlyFunded: 5,
  },
  {
    id: "d-mackenzie",
    name: "Aurora Open Giving",
    type: "Individual",
    location: "Seattle, USA",
    about:
      "Demo individual donor providing unrestricted, trust-based grants to high-impact organisations led by people closest to the problem — including refugee-led organisations.",
    interests: ["livelihoods", "education", "healthcare", "protection"],
    regions: ["Global"],
    ticketSize: "$1M – $20M (unrestricted)",
    contact: "auroraopen@example.com",
    recentlyFunded: 6,
  },
  {
    id: "d-usaid",
    name: "Pacific Crest Humanitarian Office",
    type: "Government",
    location: "Washington D.C., USA",
    about:
      "Fictional federal humanitarian office providing life-saving assistance, protection, and livelihood recovery resources globally.",
    interests: ["food security", "water/WASH", "protection", "shelter", "healthcare"],
    regions: ["Global", "Sub-Saharan Africa", "Middle East", "Latin America"],
    ticketSize: "$500k – $15M",
    contact: "inquiries@pacificcrest.example",
    recentlyFunded: 45,
  },
  {
    id: "d-mastercard",
    name: "Continental Futures Foundation",
    type: "Foundation",
    location: "Toronto, Canada",
    about:
      "Demo foundation enabling young people — particularly young women, displaced populations, and refugees in Africa — to secure dignified and fulfilling work.",
    interests: ["livelihoods", "education"],
    regions: ["Sub-Saharan Africa", "East Africa", "West Africa"],
    ticketSize: "$500k – $10M",
    contact: "info@continentalfutures.example",
    recentlyFunded: 18,
  },
  {
    id: "d-unhcr-innovation",
    name: "Global Displacement Innovation Fund",
    type: "Government",
    location: "Geneva, Switzerland",
    about:
      "Fictional multilateral fund for creative, localised, and tech-driven solutions designed and implemented directly by refugee-led organisations.",
    interests: ["energy", "protection", "livelihoods", "education"],
    regions: ["Global"],
    ticketSize: "$10k – $150k",
    contact: "innovation@gdif.example",
    recentlyFunded: 24,
  },
  {
    id: "d-ford-foundation",
    name: "Civic Horizons Foundation",
    type: "Foundation",
    location: "New York, USA",
    about:
      "Demo philanthropy focused on reducing inequality, protecting civic space, and supporting legal aid and advocacy organisations representing marginalised groups.",
    interests: ["legal aid", "protection", "livelihoods"],
    regions: ["Global", "Latin America", "Middle East", "Sub-Saharan Africa"],
    ticketSize: "$100k – $2M",
    contact: "grants@civichorizons.example",
    recentlyFunded: 13,
  },
  {
    id: "d-cisco-foundation",
    name: "Meridian Networks Giving",
    type: "Corporate",
    location: "San Jose, USA",
    about:
      "Fictional corporate giving programme. Invests in technology solutions that help underserved and displaced communities access critical resources and shelter.",
    interests: ["shelter", "education", "water/WASH", "energy"],
    regions: ["Global"],
    ticketSize: "$75k – $500k",
    contact: "giving@meridiannetworks.example",
    recentlyFunded: 8,
  },
  {
    id: "d-alwaleed",
    name: "Al-Andalus Charitable Trust",
    type: "Foundation",
    location: "Riyadh, Saudi Arabia",
    about:
      "Demo foundation supporting disaster relief, community development, and empowering women and youth in the Middle East and globally.",
    interests: ["shelter", "food security", "healthcare", "livelihoods"],
    regions: ["MENA", "East Africa", "South Asia"],
    ticketSize: "$150k – $3M",
    contact: "info@alandalustrust.example",
    recentlyFunded: 11,
  },
  {
    id: "d-hpatel",
    name: "Banyan Philanthropic Fund",
    type: "Individual",
    location: "London, UK",
    about:
      "Fictional private philanthropic fund focused on localised water access, community energy resilience, and nutrition initiatives for displaced communities.",
    interests: ["water/WASH", "energy", "food security"],
    regions: ["East Africa", "South Asia"],
    ticketSize: "$25k – $200k",
    contact: "grants@banyanfund.example",
    recentlyFunded: 4,
  },
  {
    id: "d-dr-schwab",
    name: "Alpenrose Donor Circle",
    type: "Individual",
    location: "Zurich, Switzerland",
    about:
      "Demo private donor syndicate financing legal empowerment, local integration initiatives, and high-impact micro-livelihoods run by refugee communities.",
    interests: ["legal aid", "livelihoods", "protection"],
    regions: ["Western Balkans", "Middle East"],
    ticketSize: "$30k – $150k",
    contact: "circle@alpenrose.example",
    recentlyFunded: 5,
  },
  {
    id: "d-cedar-mena",
    name: "Cedar Crescent Foundation",
    type: "Foundation",
    location: "Amman, Jordan",
    about:
      "Fictional regional foundation supporting host-community integration, vocational training, and youth mental health across the Levant.",
    interests: ["education", "healthcare", "livelihoods", "protection"],
    regions: ["MENA", "Levant"],
    ticketSize: "$40k – $750k",
    contact: "grants@cedarcrescent.example",
    recentlyFunded: 12,
  },
  {
    id: "d-sakura",
    name: "Sakura International Aid",
    type: "Government",
    location: "Tokyo, Japan",
    about:
      "Demo bilateral agency funding disaster resilience, WASH infrastructure, and education-in-emergencies across Asia-Pacific and East Africa.",
    interests: ["water/WASH", "education", "shelter"],
    regions: ["South Asia", "South-East Asia", "East Africa"],
    ticketSize: "¥10M – ¥500M",
    contact: "contact@sakura-aid.example",
    recentlyFunded: 17,
  },
  {
    id: "d-baobab",
    name: "Baobab Diaspora Collective",
    type: "Individual",
    location: "Accra, Ghana",
    about:
      "Fictional pooled fund of African diaspora professionals making small, fast grants to refugee-led organisations across the continent.",
    interests: ["livelihoods", "education", "protection"],
    regions: ["Sub-Saharan Africa", "West Africa", "East Africa"],
    ticketSize: "$5k – $50k",
    contact: "hello@baobabcollective.example",
    recentlyFunded: 29,
  },
  {
    id: "d-bluewave-corp",
    name: "BlueWave Logistics Cares",
    type: "Corporate",
    location: "Rotterdam, Netherlands",
    about:
      "Demo corporate giving programme of a fictional shipping group. Funds cold-chain, shelter logistics, and last-mile distribution in crisis response.",
    interests: ["shelter", "food security", "healthcare"],
    regions: ["Global", "MENA", "Ukraine"],
    ticketSize: "$50k – $400k + in-kind logistics",
    contact: "cares@bluewavelogistics.example",
    recentlyFunded: 6,
  },
  {
    id: "d-novaterra",
    name: "NovaTerra Climate Fund",
    type: "Foundation",
    location: "Copenhagen, Denmark",
    about:
      "Fictional climate-displacement foundation funding adaptation, clean cooking, and renewable energy access for communities on the climate frontline.",
    interests: ["energy", "water/WASH", "shelter"],
    regions: ["Sahel", "Pacific", "South Asia"],
    ticketSize: "€75k – €1.5M",
    contact: "grants@novaterrafund.example",
    recentlyFunded: 10,
  },
  {
    id: "d-kestrel-vc",
    name: "Kestrel Impact Ventures",
    type: "Corporate",
    location: "Singapore",
    about:
      "Demo impact-first investor providing catalytic capital, recoverable grants, and revenue-based financing to refugee-led social enterprises.",
    interests: ["livelihoods", "energy", "education"],
    regions: ["South-East Asia", "East Africa", "South Asia"],
    ticketSize: "$100k – $1.5M (blended)",
    contact: "ventures@kestrelimpact.example",
    recentlyFunded: 8,
  },
  {
    id: "d-anon-individual",
    name: "Anonymous Donor (via Lighthouse Advisors)",
    type: "Individual",
    location: "Geneva, Switzerland",
    about:
      "Fictional anonymous high-net-worth donor giving through an advisory intermediary. Quiet, flexible, multi-year support for protection and legal aid.",
    interests: ["protection", "legal aid", "healthcare"],
    regions: ["Global"],
    ticketSize: "$100k – $750k",
    contact: "intake@lighthouseadvisors.example",
    recentlyFunded: 3,
  },
];

export type Donation = {
  id: string;
  donorId: string;
  projectId: string;
  amount: number;
  currency: "EUR" | "USD" | "GBP";
  date: string; // ISO
  note?: string;
};

// Illustrative recent donations from donors to specific NGO/RLO projects.
export const donations: Donation[] = [
  { id: "don-ikea-kakuma", donorId: "d-ikea", projectId: "p-efr-2025-kakuma", amount: 45000, currency: "EUR", date: "2025-07-12", note: "Co-funded solar array and battery storage" },
  { id: "don-bmz-hatay", donorId: "d-bmz", projectId: "p-efr-2024-hatay", amount: 80000, currency: "EUR", date: "2024-11-04", note: "Earthquake recovery energy infrastructure" },
  { id: "don-echo-tripoli", donorId: "d-echo", projectId: "p-efr-2023-tripoli", amount: 120000, currency: "EUR", date: "2023-09-21" },
  { id: "don-hilton-katsikas", donorId: "d-conrad-hilton", projectId: "p-efr-2022-katsikas", amount: 30000, currency: "USD", date: "2022-08-15", note: "Maker space energy upgrade" },
  { id: "don-google-singa", donorId: "d-google-org", projectId: "p-singa-incubator", amount: 95000, currency: "USD", date: "2025-03-02", note: "Refugee-led startup incubator cohort" },
  { id: "don-mastercard-migrateful", donorId: "d-mastercard", projectId: "p-migrateful-chefs", amount: 60000, currency: "GBP", date: "2025-01-18" },
  { id: "don-mackenzie-rwit", donorId: "d-mackenzie", projectId: "p-rwit-hosting", amount: 250000, currency: "USD", date: "2024-12-10", note: "Unrestricted multi-year support" },
  { id: "don-ford-wfrw", donorId: "d-ford-foundation", projectId: "p-wfrw-london", amount: 85000, currency: "USD", date: "2025-02-22" },
  { id: "don-unhcr-rti", donorId: "d-unhcr-innovation", projectId: "p-rti-athens", amount: 75000, currency: "EUR", date: "2025-05-08", note: "Trauma-informed care training" },
  { id: "don-shell-calabar", donorId: "d-shell", projectId: "p-efr-2020-calabar", amount: 40000, currency: "USD", date: "2020-10-30" },
  { id: "don-alwaleed-mosaik", donorId: "d-alwaleed", projectId: "p-mosaik-lesvos", amount: 110000, currency: "USD", date: "2025-04-14", note: "Community centre operations" },
  { id: "don-patel-gsbtb", donorId: "d-hpatel", projectId: "p-gsbtb-berlin", amount: 20000, currency: "GBP", date: "2024-09-09", note: "Community kitchen nutrition programme" },
  { id: "don-schwab-svn", donorId: "d-dr-schwab", projectId: "p-svn-amsterdam", amount: 35000, currency: "EUR", date: "2025-06-01" },
  { id: "don-cisco-moria-2020", donorId: "d-cisco-foundation", projectId: "p-efr-2020-moria", amount: 50000, currency: "USD", date: "2020-07-19" },
  { id: "don-usaid-guadalajara", donorId: "d-usaid", projectId: "p-efr-2021-guadalajara", amount: 200000, currency: "USD", date: "2021-11-12" },
];

export function donorById(id: string) {
  return donors.find((d) => d.id === id);
}
