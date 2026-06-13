import supabase from "../config/db.js";
import * as queryHelper from "../utils/queryHelper.js";

const LLM_PROVIDER = String(process.env.LLM_PROVIDER || "ollama").toLowerCase().trim();

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434/api/chat";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:4b";

const OPENROUTER_URL = process.env.OPENROUTER_URL || "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "qwen/qwen3-4b:free";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL || "";
const OPENROUTER_APP_TITLE = process.env.OPENROUTER_APP_TITLE || "PABW Hotel Recommendation";
const OPENROUTER_MAX_TOKENS = Number(process.env.OPENROUTER_MAX_TOKENS || 1200);

const normalizeText = (value) => {
  return String(value || "").toLowerCase().trim();
};

/**
 * Parses a numeric value from various human-friendly formats:
 * - 1500000          -> 1500000
 * - "1.500.000"      -> 1500000
 * - "1,500,000"      -> 1500000
 * - "1,5 juta"       -> 1500000
 * - "1.5jt"          -> 1500000
 * - "1,5 ribu"       -> 1500
 * - "500rb"          -> 500000
 * - "Rp 1.5 juta"    -> 1500000
 */
const parseNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;

  if (typeof value === "number") {
    return Number.isNaN(value) ? null : value;
  }

  let text = String(value).toLowerCase().trim().replace(/rp/g, "").trim();
  text = text.replace(/\s+/g, " ").trim();

  // "500k" style -> thousand
  const kMatch = text.match(/^(\d+)\s*k$/);
  if (kMatch) {
    return Number(kMatch[1]) * 1000;
  }

  // "1.5 juta" / "1.5 juta" / "1,5 juta" / "1.5 juta-an" / "sejutaan"
  const jutaDecimalMatch = text.match(/^(\d+)[.,](\d+)\s*(juta|jt)(-an|an)?$/);
  if (jutaDecimalMatch) {
    const intPart = jutaDecimalMatch[1];
    const decPart = jutaDecimalMatch[2];
    return Number(`${intPart}.${decPart}`) * 1000000;
  }

  // "2 juta" / "2jt" / "2 juta-an" / "2jt-an"
  const jutaMatch = text.match(/^(\d+)\s*(juta|jt)(-an|an)?$/);
  if (jutaMatch) {
    return Number(jutaMatch[1]) * 1000000;
  }

  // bare "sejuta" / "sejutaan"
  if (/^sejuta(-an|an)?$/.test(text)) {
    return 1000000;
  }

  // "1,5 ribu" / "1.5rb"
  const ribuDecimalMatch = text.match(/^(\d+)[.,](\d+)\s*(ribu|rb)$/);
  if (ribuDecimalMatch) {
    const intPart = ribuDecimalMatch[1];
    const decPart = ribuDecimalMatch[2];
    return Number(`${intPart}.${decPart}`) * 1000;
  }

  // "500 ribu" / "500rb"
  const ribuMatch = text.match(/^(\d+)\s*(ribu|rb)$/);
  if (ribuMatch) {
    return Number(ribuMatch[1]) * 1000;
  }

  const cleaned = text.replace(/\s+/g, "");

  // "1.500.000" style (dot as thousand separator)
  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    return Number(cleaned.replace(/\./g, ""));
  }

  // "1,500,000" style (comma as thousand separator)
  if (/^\d{1,3}(,\d{3})+$/.test(cleaned)) {
    return Number(cleaned.replace(/,/g, ""));
  }

  // "1.500.000,50" or "1,500,000.50" - has both separators, last one is decimal
  if (/^\d+([.,]\d{3})*[.,]\d+$/.test(cleaned) && (cleaned.includes(".") || cleaned.includes(","))) {
    const lastDot = cleaned.lastIndexOf(".");
    const lastComma = cleaned.lastIndexOf(",");
    const decimalSeparatorIndex = Math.max(lastDot, lastComma);

    if (decimalSeparatorIndex > -1) {
      const integerPart = cleaned.slice(0, decimalSeparatorIndex).replace(/[.,]/g, "");
      const decimalPart = cleaned.slice(decimalSeparatorIndex + 1);
      const parsed = Number(`${integerPart}.${decimalPart}`);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }

  // Plain integer/decimal, strip any stray separators conservatively
  const finalCleaned = cleaned.replace(/[^\d.,]/g, "");

  // If still has both . and , just remove all separators (assume thousand grouping)
  if (finalCleaned.includes(".") && finalCleaned.includes(",")) {
    const parsed = Number(finalCleaned.replace(/[.,]/g, ""));
    return Number.isNaN(parsed) ? null : parsed;
  }

  // Single separator with exactly 3 digits after -> treat as thousand separator
  const singleSepMatch = finalCleaned.match(/^(\d+)[.,](\d{3})$/);
  if (singleSepMatch) {
    return Number(singleSepMatch[1] + singleSepMatch[2]);
  }

  // Otherwise treat separator as decimal point
  const parsed = Number(finalCleaned.replace(",", "."));

  return Number.isNaN(parsed) ? null : parsed;
};

const LOCATION_GROUPS = {
  jawa: [
    "jakarta",
    "bandung",
    "surabaya",
    "yogyakarta",
    "jogja",
    "semarang",
    "malang",
    "bogor",
    "depok",
    "bekasi",
    "tangerang",
    "banten",
    "cirebon",
    "solo",
    "surakarta"
  ],

  kalimantan: [
    "kalimantan",
    "balikpapan",
    "samarinda",
    "banjarmasin",
    "palangkaraya",
    "pontianak",
    "tarakan",
    "berau"
  ],

  sumatera: [
    "sumatera",
    "sumatra",
    "medan",
    "padang",
    "palembang",
    "pekanbaru",
    "lampung",
    "bengkulu",
    "jambi",
    "aceh",
    "batam",
    "riau"
  ],

  sulawesi: [
    "sulawesi",
    "makassar",
    "manado",
    "palu",
    "kendari",
    "gorontalo",
    "parepare"
  ],

  bali: [
    "bali",
    "denpasar",
    "kuta",
    "ubud",
    "seminyak",
    "canggu",
    "nusa dua",
    "sanur"
  ],

  nusa_tenggara: [
    "nusa tenggara",
    "lombok",
    "mataram",
    "kupang",
    "flores",
    "labuan bajo",
    "sumbawa",
    "ntb",
    "ntt"
  ],

  maluku_papua: [
    "maluku",
    "papua",
    "ambon",
    "ternate",
    "jayapura",
    "sorong",
    "manokwari",
    "merauke"
  ]
};

const LOCATION_ALIASES = {
  "jkt": "jawa",
  "jakrta": "jawa",
  "bdg": "jawa",
  "sby": "jawa",
  "sub": "jawa",
  "jogja": "jawa",
  "jogjakarta": "jawa",
  "bpp": "kalimantan",

  "pulau jawa": "jawa",
  "jawa barat": "jawa",
  "jawa tengah": "jawa",
  "jawa timur": "jawa",
  "dki jakarta": "jawa",
  "jawa": "jawa",
  "java": "jawa",

  "pulau kalimantan": "kalimantan",
  "kalimantan timur": "kalimantan",
  "kalimantan selatan": "kalimantan",
  "kalimantan tengah": "kalimantan",
  "kalimantan barat": "kalimantan",
  "kalimantan utara": "kalimantan",
  "kalimantan": "kalimantan",
  "borneo": "kalimantan",

  "pulau sumatera": "sumatera",
  "sumatera utara": "sumatera",
  "sumatera barat": "sumatera",
  "sumatera selatan": "sumatera",
  "sumatra utara": "sumatera",
  "sumatra barat": "sumatera",
  "sumatra selatan": "sumatera",
  "sumatera": "sumatera",
  "sumatra": "sumatera",

  "pulau sulawesi": "sulawesi",
  "sulawesi selatan": "sulawesi",
  "sulawesi utara": "sulawesi",
  "sulawesi tengah": "sulawesi",
  "sulawesi tenggara": "sulawesi",
  "sulawesi barat": "sulawesi",
  "sulawesi": "sulawesi",

  "pulau bali": "bali",
  "bali": "bali",

  "nusa tenggara barat": "nusa_tenggara",
  "nusa tenggara timur": "nusa_tenggara",
  "nusa tenggara": "nusa_tenggara",
  "ntb": "nusa_tenggara",
  "ntt": "nusa_tenggara",
  "lombok": "nusa_tenggara",

  "indonesia timur": "maluku_papua",
  "maluku": "maluku_papua",
  "papua": "maluku_papua"
};

const FACILITY_KEYWORDS = [
  "wifi",
  "parkir",
  "restoran",
  "kolam renang",
  "ac",
  "laundry",
  "gym",
  "spa",
  "sarapan",
  "taman",
  "resepsionis",
  "kamar mandi",
  "tv",
  "mini bar"
];

const getLocationKeywords = (location) => {
  const normalizedLocation = normalizeText(location);

  if (!normalizedLocation) {
    return [];
  }

  const matchedAlias = Object.keys(LOCATION_ALIASES).find((alias) => {
    return normalizedLocation.includes(alias);
  });

  if (matchedAlias) {
    const groupKey = LOCATION_ALIASES[matchedAlias];
    return LOCATION_GROUPS[groupKey] || [normalizedLocation];
  }

  const allCityKeywords = Object.values(LOCATION_GROUPS).flat();

  const matchedCityKeywords = allCityKeywords.filter((keyword) => {
    return normalizedLocation.includes(keyword);
  });

  if (matchedCityKeywords.length > 0) {
    return [...new Set([...matchedCityKeywords, normalizedLocation])];
  }

  return [normalizedLocation];
};

const addLocationFilter = (whereClauses, params, location) => {
  const keywords = getLocationKeywords(location);

  if (keywords.length === 0) {
    return;
  }

  const keywordClauses = keywords.map(() => {
    return "(LOWER(lh.location) LIKE ? OR LOWER(lh.hotel_name) LIKE ?)";
  });

  whereClauses.push(`(${keywordClauses.join(" OR ")})`);

  keywords.forEach((keyword) => {
    params.push(`%${normalizeText(keyword)}%`);
    params.push(`%${normalizeText(keyword)}%`);
  });
};

/**
 * Extracts a budget value from free text. Supports many phrasings:
 * - "budget maksimal 1,5 juta"
 * - "harga termurah"
 * - "maksimal 500 ribu"
 * - "di bawah 2jt"
 * - "1.5 juta rupiah"
 * - bare "Rp 1.500.000"
 */
const extractBudgetFromPrompt = (prompt) => {
  const text = normalizeText(prompt);

  // Number followed by juta/jt/ribu/rb, optionally preceded by keyword,
  // allow decimal with either . or ,
  const moneyWithUnitRegex = /(?:maksimal|max|budget|harga|di bawah|kurang dari|sekitar|sampai|hingga)?\s*(?:rp\.?\s*)?(\d+(?:[.,]\d+)?)\s*(juta|jt|ribu|rb|k)(?:-?an)?\b/;
  const unitMatch = text.match(moneyWithUnitRegex);
  if (unitMatch) {
    const numPart = unitMatch[1].replace(",", ".");
    const unit = unitMatch[2];
    const base = Number(numPart);
    if (!Number.isNaN(base)) {
      if (unit === "juta" || unit === "jt") return base * 1000000;
      if (unit === "ribu" || unit === "rb" || unit === "k") return base * 1000;
    }
  }

  // "sejuta" / "sejutaan"
  if (/sejuta(-?an)?\b/.test(text)) {
    return 1000000;
  }

  // Range "500rb-1jt" / "500rb sampai 1 juta" -> take the larger value
  const rangeRegex = /(\d+(?:[.,]\d+)?)\s*(juta|jt|ribu|rb|k)\s*(?:-|sampai|hingga|s\.?d\.?)\s*(\d+(?:[.,]\d+)?)\s*(juta|jt|ribu|rb|k)/;
  const rangeMatch = text.match(rangeRegex);
  if (rangeMatch) {
    const toAmount = (numStr, unit) => {
      const n = Number(numStr.replace(",", "."));
      if (unit === "juta" || unit === "jt") return n * 1000000;
      if (unit === "ribu" || unit === "rb" || unit === "k") return n * 1000;
      return n;
    };
    const first = toAmount(rangeMatch[1], rangeMatch[2]);
    const second = toAmount(rangeMatch[3], rangeMatch[4]);
    return Math.max(first, second);
  }

  // Plain number with explicit budget keyword, e.g. "budget 1500000" or "maksimal Rp 1.500.000"
  const numberWithKeywordRegex = /(?:maksimal|max|budget|harga|di bawah|kurang dari|sekitar|sampai|hingga)\s*(?:rp\.?\s*)?([\d.,]+)/;
  const numberMatch = text.match(numberWithKeywordRegex);
  if (numberMatch) {
    const parsed = parseNumber(numberMatch[1]);
    if (parsed !== null) return parsed;
  }

  // Bare "Rp X" anywhere in the text
  const bareRpRegex = /rp\.?\s*([\d.,]+)\s*(juta|jt|ribu|rb)?/;
  const bareMatch = text.match(bareRpRegex);
  if (bareMatch) {
    const numPart = bareMatch[1];
    const unit = bareMatch[2];
    if (unit) {
      const base = Number(numPart.replace(",", "."));
      if (!Number.isNaN(base)) {
        if (unit === "juta" || unit === "jt") return base * 1000000;
        if (unit === "ribu" || unit === "rb") return base * 1000;
      }
    } else {
      const parsed = parseNumber(numPart);
      if (parsed !== null) return parsed;
    }
  }

  return null;
};

/**
 * Extracts guest count from phrasing like:
 * - "untuk 4 orang"
 * - "4 tamu"
 * - "2 pax"
 * - "untuk keluarga" -> 4
 * - "berdua" / "untuk 2 orang dewasa"
 */
const extractGuestCountFromPrompt = (prompt) => {
  const text = normalizeText(prompt);

  const guestMatch = text.match(/(\d+)\s*(orang|tamu|pax|dewasa|org)\b/);

  if (guestMatch) {
    return Number(guestMatch[1]);
  }

  // "ber4" / "ber-4" / "ber 4"
  const berMatch = text.match(/ber-?\s?(\d+)\b/);
  if (berMatch) {
    return Number(berMatch[1]);
  }

  // "untuk 4" without unit word, but near "orang"/"tamu" elsewhere is already covered above.
  // Handle "kapasitas 4"
  const capacityMatch = text.match(/kapasitas\s*(\d+)/);
  if (capacityMatch) {
    return Number(capacityMatch[1]);
  }

  if (text.includes("keluarga")) {
    return 4;
  }

  if (text.includes("pasangan") || text.includes("berdua") || text.includes("honeymoon") || text.includes("bulan madu")) {
    return 2;
  }

  if (text.includes("sendiri") || text.includes("solo")) {
    return 1;
  }

  return null;
};

const extractLocationFromPrompt = (prompt) => {
  const text = normalizeText(prompt);

  const aliasMatch = Object.keys(LOCATION_ALIASES)
    .sort((a, b) => b.length - a.length)
    .find((alias) => {
      return text.includes(alias);
    });

  if (aliasMatch) {
    return aliasMatch;
  }

  const allKeywords = Object.values(LOCATION_GROUPS).flat();

  const cityMatch = allKeywords
    .sort((a, b) => b.length - a.length)
    .find((keyword) => {
      return text.includes(keyword);
    });

  return cityMatch || null;
};

const extractFacilitiesFromPrompt = (prompt) => {
  const text = normalizeText(prompt);

  return FACILITY_KEYWORDS.filter((facility) => {
    return text.includes(facility);
  });
};

const extractPurposeFromPrompt = (prompt) => {
  const text = normalizeText(prompt);

  if (text.includes("keluarga")) return "keluarga";
  if (text.includes("bisnis") || text.includes("kerja") || text.includes("dinas")) return "bisnis";
  if (text.includes("liburan") || text.includes("wisata") || text.includes("vacation")) return "liburan";
  if (text.includes("honeymoon") || text.includes("bulan madu")) return "honeymoon";
  if (text.includes("transit") || text.includes("singgah")) return "transit";

  return null;
};

/**
 * Detects if the user is asking for the cheapest / most affordable option,
 * even if no explicit numeric budget is given (e.g. "harga termurah",
 * "yang paling murah", "budget tipis").
 */
const isCheapestRequest = (prompt) => {
  const text = normalizeText(prompt);
  return (
    text.includes("termurah") ||
    text.includes("paling murah") ||
    text.includes("murah") ||
    text.includes("hemat") ||
    text.includes("ekonomis") ||
    text.includes("budget tipis") ||
    text.includes("low budget")
  );
};

/**
 * Detects if the user wants the best-rated / top-quality option,
 * even without explicit rating numbers (e.g. "rating terbaik", "paling bagus").
 */
const isBestRatedRequest = (prompt) => {
  const text = normalizeText(prompt);
  return (
    text.includes("rating terbaik") ||
    text.includes("rating tertinggi") ||
    text.includes("paling bagus") ||
    text.includes("terbaik") ||
    text.includes("paling recommended") ||
    text.includes("favorit")
  );
};

const extractPreferencesLocally = (prompt) => {
  return {
    location: extractLocationFromPrompt(prompt),
    budget_max: extractBudgetFromPrompt(prompt),
    guest_count: extractGuestCountFromPrompt(prompt),
    preferred_facilities: extractFacilitiesFromPrompt(prompt),
    purpose: extractPurposeFromPrompt(prompt),
    prefer_cheapest: isCheapestRequest(prompt),
    prefer_best_rated: isBestRatedRequest(prompt)
  };
};

const extractJsonFromText = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Response LLM bukan JSON valid.");
    }

    const jsonText = text.slice(start, end + 1);
    return JSON.parse(jsonText);
  }
};

const parseResponseBody = async (response, providerName) => {
  const responseText = await response.text();

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error(`${providerName} mengembalikan response bukan JSON. Status: ${response.status}`);
  }
};

const normalizeLlmContent = (content) => {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item?.text === "string") return item.text;
        if (typeof item?.content === "string") return item.content;
        return "";
      })
      .join("\n")
      .trim();
  }

  return "";
};

const getActiveLlmModel = () => {
  if (LLM_PROVIDER === "openrouter") {
    return OPENROUTER_MODEL;
  }

  return OLLAMA_MODEL;
};

const askLlmContent = async ({
  systemPrompt,
  userPrompt,
  temperature = 0.2,
  timeoutMs = 60000
}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (LLM_PROVIDER === "openrouter") {
      if (!OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY belum diisi di file .env backend.");
      }

      const headers = {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      };

      if (OPENROUTER_SITE_URL) {
        headers["HTTP-Referer"] = OPENROUTER_SITE_URL;
      }

      if (OPENROUTER_APP_TITLE) {
        headers["X-OpenRouter-Title"] = OPENROUTER_APP_TITLE;
      }

      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          temperature,
          max_tokens: OPENROUTER_MAX_TOKENS
        }),
        signal: controller.signal
      });

      const data = await parseResponseBody(response, "OpenRouter");

      if (!response.ok) {
        throw new Error(data?.error?.message || `OpenRouter error dengan status ${response.status}`);
      }

      const content = normalizeLlmContent(data?.choices?.[0]?.message?.content);

      if (!content) {
        throw new Error("Response OpenRouter kosong.");
      }

      return content;
    }

    if (LLM_PROVIDER === "ollama") {
      const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          stream: false,
          format: "json",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          options: {
            temperature
          }
        }),
        signal: controller.signal
      });

      const data = await parseResponseBody(response, "Ollama");

      if (!response.ok) {
        throw new Error(data?.error || `Ollama error dengan status ${response.status}`);
      }

      const content = normalizeLlmContent(data?.message?.content);

      if (!content) {
        throw new Error("Response Ollama kosong.");
      }

      return content;
    }

    throw new Error("LLM_PROVIDER hanya boleh diisi ollama atau openrouter.");
  } finally {
    clearTimeout(timeout);
  }
};

const calculateHotelScore = (hotel, preferences) => {
  const budgetMax = parseNumber(preferences.budget_max);
  const guestCount = parseNumber(preferences.guest_count);
  const preferredFacilities = Array.isArray(preferences.preferred_facilities)
    ? preferences.preferred_facilities
    : [];

  let score = 0;

  if (budgetMax && hotel.min_price <= budgetMax) {
    const priceRatio = hotel.min_price / budgetMax;
    score += Math.max(0, 35 - priceRatio * 20);
  }

  if (guestCount && hotel.max_capacity >= guestCount) {
    score += 25;
  }

  if (hotel.avg_rating > 0) {
    score += Number(hotel.avg_rating) * 6;
  }

  const facilityText = normalizeText(hotel.all_facilities);

  const matchedFacilities = preferredFacilities.filter((facility) => {
    return facilityText.includes(normalizeText(facility));
  });

  score += matchedFacilities.length * 15;

  if (hotel.available_room_count > 0) {
    score += Math.min(Number(hotel.available_room_count), 10);
  }

  // Boost for explicit "cheapest" intent
  if (preferences.prefer_cheapest) {
    score += Math.max(0, 30 - hotel.min_price / 50000);
  }

  // Boost for explicit "best rated" intent
  if (preferences.prefer_best_rated && hotel.avg_rating > 0) {
    score += Number(hotel.avg_rating) * 5;
  }

  return {
    score: Math.round(score),
    matched_facilities: matchedFacilities
  };
};

const formatHotelRecommendation = (candidate, rank, reasonOverride = null, scoreOverride = null) => {
  const score = Number.isFinite(Number(scoreOverride))
    ? Number(scoreOverride)
    : Number(candidate.local_score) || 0;

  return {
    rank,
    id_list_hotel: candidate.id_list_hotel,
    hotel_name: candidate.hotel_name,
    location: candidate.location,
    contact_person: candidate.contact_person,
    contact_email: candidate.contact_email,
    contact_phone: candidate.contact_phone,

    min_price: candidate.min_price,
    max_price: candidate.max_price,
    price_from: candidate.min_price,

    available_room_count: candidate.available_room_count,
    available_room_types: candidate.available_room_types,
    max_capacity: candidate.max_capacity,
    all_facilities: candidate.all_facilities,

    avg_rating: candidate.avg_rating,
    total_rating: candidate.total_rating,
    score,

    reason: reasonOverride || `Hotel ini direkomendasikan karena memiliki ${candidate.available_room_count} kamar tersedia, harga mulai dari Rp ${Number(candidate.min_price).toLocaleString("id-ID")}, kapasitas maksimal ${candidate.max_capacity} tamu, dan fasilitas yang cocok adalah ${candidate.matched_facilities.length > 0 ? candidate.matched_facilities.join(", ") : "belum ada yang cocok secara spesifik"}.`
  };
};

const buildDatabaseRecommendation = (rankedCandidates, note = null) => {
  const topCandidates = rankedCandidates.slice(0, 3);

  return {
    recommended_hotels: topCandidates.map((candidate, index) => {
      return formatHotelRecommendation(candidate, index + 1);
    }),
    summary: `Rekomendasi dibuat dari ${rankedCandidates.length} hotel yang memiliki kamar tersedia di database.`,
    note
  };
};

const normalizeLlmRecommendation = (llmRecommendation, rankedCandidates) => {
  const candidateByHotelId = new Map();

  rankedCandidates.forEach((candidate) => {
    candidateByHotelId.set(String(candidate.id_list_hotel), candidate);
  });

  const llmItems = Array.isArray(llmRecommendation?.recommended_hotels)
    ? llmRecommendation.recommended_hotels
    : [];

  const usedHotelIds = new Set();
  const normalizedItems = [];

  llmItems.forEach((item) => {
    const hotelId = String(item.id_list_hotel || "");

    if (!hotelId || usedHotelIds.has(hotelId)) {
      return;
    }

    const candidate = candidateByHotelId.get(hotelId);

    if (!candidate) {
      return;
    }

    usedHotelIds.add(hotelId);

    normalizedItems.push(
      formatHotelRecommendation(
        candidate,
        normalizedItems.length + 1,
        item.reason || null,
        item.score
      )
    );
  });

  if (normalizedItems.length === 0) {
    return buildDatabaseRecommendation(
      rankedCandidates,
      "Output LLM tidak cocok dengan kandidat hotel dari database, sehingga rekomendasi dibuat langsung dari ranking database."
    );
  }

  return {
    recommended_hotels: normalizedItems.slice(0, 3),
    summary: llmRecommendation?.summary || `Rekomendasi dibuat dari ${rankedCandidates.length} hotel yang memiliki kamar tersedia di database.`,
    note: llmRecommendation?.note || null
  };
};

/**
 * Combines LLM-extracted preferences with locally-extracted preferences.
 * For each field, prefer the LLM value if it's present/non-null/non-empty;
 * otherwise fall back to the local extraction. This way, even if the LLM
 * misses or misparses something (e.g. "1,5 juta" -> 1), the local regex
 * extraction can still fill in the gap.
 *
 * For budget_max specifically, if the LLM value looks suspiciously small
 * (e.g. < 1000, which is implausible for a hotel price in IDR) but the
 * local extraction found a larger, more plausible value, prefer the local one.
 */
const mergePreferences = (llmPrefs, localPrefs, prompt) => {
  const merged = { ...localPrefs, ...llmPrefs };

  // location
  if (!merged.location || normalizeText(merged.location) === "") {
    merged.location = localPrefs.location;
  }

  // budget_max sanity check
  const llmBudget = parseNumber(llmPrefs?.budget_max);
  const localBudget = parseNumber(localPrefs?.budget_max);

  if (llmBudget === null || llmBudget === undefined) {
    merged.budget_max = localBudget;
  } else if (llmBudget < 1000 && localBudget && localBudget >= 1000) {
    // LLM likely misparsed "1,5 juta" as 1 -> prefer local extraction
    merged.budget_max = localBudget;
  } else {
    merged.budget_max = llmBudget;
  }

  // guest_count
  const llmGuests = parseNumber(llmPrefs?.guest_count);
  const localGuests = parseNumber(localPrefs?.guest_count);
  merged.guest_count = llmGuests || localGuests || null;

  // preferred_facilities: union of both
  const llmFacilities = Array.isArray(llmPrefs?.preferred_facilities) ? llmPrefs.preferred_facilities : [];
  const localFacilities = Array.isArray(localPrefs?.preferred_facilities) ? localPrefs.preferred_facilities : [];
  merged.preferred_facilities = [...new Set([...llmFacilities, ...localFacilities])];

  // purpose
  if (!merged.purpose) {
    merged.purpose = localPrefs.purpose;
  }

  // cheapest / best-rated intent (always derive locally, LLM may not return these)
  merged.prefer_cheapest = isCheapestRequest(prompt);
  merged.prefer_best_rated = isBestRatedRequest(prompt);

  return merged;
};

const extractPreferencesFromPrompt = async (prompt) => {
  const localPrefs = extractPreferencesLocally(prompt);

  const systemPrompt = `
Kamu adalah parser preferensi hotel yang sangat teliti dan fleksibel.
Tugasmu hanya mengekstrak preferensi customer dari teks bebas berbahasa Indonesia.
Jawaban wajib JSON valid, tanpa markdown, tanpa penjelasan tambahan.
Jika data tidak disebutkan, isi null atau array kosong.

CATATAN UMUM:
- Manusia menulis dengan gaya bebas: typo, singkatan, huruf kapital acak,
  bahasa gaul/informal, campur bahasa Indonesia-Inggris, tanpa tanda baca,
  atau bertele-tele. Tetap ekstrak maksud sebenarnya, jangan terpaku pada
  ejaan/format literal.
- Abaikan kata sapaan, basa-basi, atau emoji yang tidak relevan
  (contoh: "halo", "min", "tolong dong", "ya", "kak", "gan", "please", emoji apapun).
- Satu prompt bisa berisi beberapa preferensi sekaligus dalam urutan apapun;
  ekstrak semuanya.
- Jika ada informasi yang kontradiktif atau berubah pikiran dalam satu prompt
  (misal "ke Bali deh, eh atau Lombok aja"), ambil preferensi YANG TERAKHIR
  disebutkan/diputuskan.

ATURAN UNTUK location:
- Terima nama kota/daerah meski disingkat atau typo ringan, contoh:
  "jkt"/"jakrta" -> jakarta, "bdg" -> bandung, "sby"/"sub" -> surabaya,
  "yog"/"jogja"/"jogjakarta" -> yogyakarta, "bpp"/"balikpapan" -> balikpapan.
- Terima juga nama pulau, provinsi, atau kawasan wisata sebagai lokasi
  (misal "deket pantai", "daerah pegunungan" tidak dianggap lokasi spesifik,
  tapi "pantai kuta" / "ubud" / "raja ampat" dianggap lokasi spesifik).
- Jika user menyebut "di sekitar sini" atau "terdekat" tanpa nama tempat,
  set location ke null (karena lokasi user tidak diketahui dari teks).

ATURAN UNTUK budget_max:
- Konversi semua nilai uang ke satuan Rupiah penuh (integer), BUKAN dalam satuan juta/ribu.
- Contoh: "1,5 juta" -> 1500000 (BUKAN 1 atau 1.5)
- Contoh: "500 ribu" / "500rb" / "500k" -> 500000
- Contoh: "2jt" / "2 jeti" / "2 juta-an" -> 2000000
- Contoh: "budget 1.500.000" -> 1500000
- Terima juga gaya santai: "duit cuma ada 300rb", "kantong 1jt aja",
  "ga lebih dari sejuta" -> 1000000, "sejutaan" -> 1000000.
- Jika ada RENTANG harga (misal "antara 500rb sampai 1 juta" atau
  "500rb-1jt"), gunakan angka TERBESAR dari rentang tersebut sebagai budget_max.
- Jika user bilang "termurah"/"murah"/"hemat"/"ngepas"/"budget minim"
  tanpa angka spesifik, set budget_max ke null.
- Jika user menyebut harga PER MALAM vs TOTAL untuk beberapa malam
  (misal "budget 3 juta untuk 3 malam"), bagi totalnya menjadi per malam
  (3000000 / 3 = 1000000) karena harga kamar di database adalah per malam.

ATURAN UNTUK guest_count:
- Ambil jumlah orang/tamu secara eksplisit jika disebutkan, misal
  "untuk 4 orang", "4 org", "ber4", "ber-4", "rombongan 6 orang" -> sesuai angka.
- "sendirian"/"sendiri"/"solo traveling"/"cuma aku" -> 1.
- "pasangan"/"berdua"/"honeymoon"/"bulan madu"/"aku & pacar" -> 2.
- "keluarga" tanpa angka -> 4. Tapi jika user menyebut jumlah anggota keluarga
  secara spesifik (misal "keluarga kecil isi 3 orang"), gunakan angka tersebut.
- "rombongan"/"grup"/"teman-teman" tanpa angka -> null (tidak bisa ditebak pasti).

ATURAN UNTUK preferred_facilities:
- Normalisasi sinonim ke bentuk standar, contoh:
  "ada kolam renangnya gak" -> "kolam renang",
  "wifi kencang"/"internet"/"ada wifi" -> "wifi",
  "ada tempat parkir" -> "parkir",
  "sarapan included"/"include breakfast"/"ada makan pagi" -> "sarapan",
  "ber-AC"/"dingin"/"ada pendingin ruangan" -> "ac".
- Jika user menyebut fasilitas yang TIDAK diinginkan (misal "gapapa ga ada kolam
  renang"), JANGAN masukkan fasilitas tersebut ke preferred_facilities.

ATURAN UNTUK purpose:
- "mau healing"/"refreshing"/"liburan"/"jalan-jalan" -> "liburan".
- "ada meeting"/"rapat"/"dinas kantor"/"kerjaan" -> "bisnis".
- "honeymoon"/"bulan madu"/"anniversary" -> "honeymoon".
- "cuma numpang tidur"/"transit sebelum lanjut perjalanan"/"mau ke bandara
  besok pagi" -> "transit".
- "sama keluarga"/"bawa anak"/"liburan keluarga" -> "keluarga".

JIKA PROMPT TIDAK JELAS / TIDAK BERHUBUNGAN DENGAN HOTEL:
- Jika teks sama sekali tidak mengandung preferensi terkait hotel
  (lokasi/budget/jumlah tamu/fasilitas/tujuan), kembalikan semua field
  sebagai null/array kosong. Jangan mengarang preferensi yang tidak ada.
`;

  const userPrompt = `
Ekstrak preferensi hotel dari teks berikut:

"${prompt}"

Format output wajib (JSON):
{
  "location": string atau null,
  "budget_max": number (dalam Rupiah penuh) atau null,
  "guest_count": number atau null,
  "preferred_facilities": array of string,
  "purpose": string atau null
}
`;

  let llmPrefs = {};

  try {
    const content = await askLlmContent({
      systemPrompt,
      userPrompt,
      temperature: 0.1,
      timeoutMs: 30000
    });

    llmPrefs = extractJsonFromText(content);
  } catch {
    llmPrefs = {};
  }

  return mergePreferences(llmPrefs, localPrefs, prompt);
};

export const recommendHotelForCustomer = async (req, res) => {
  try {
    let requestData = req.body;

    if (req.body.prompt && typeof req.body.prompt === "string") {
      const extractedPreferences = await extractPreferencesFromPrompt(req.body.prompt);

      requestData = {
        ...extractedPreferences,
        limit: req.body.limit || 30
      };
    }

    const {
      location,
      budget_max,
      guest_count,
      preferred_facilities = [],
      purpose,
      prefer_cheapest = false,
      prefer_best_rated = false,
      limit = 30
    } = requestData;

    const budgetMax = parseNumber(budget_max);
    const purposeText = normalizeText(purpose);
    const inferredGuestCount = parseNumber(guest_count) || (purposeText === "keluarga" ? 4 : null);
    const limitValue = Math.min(parseNumber(limit) || 30, 50);

    const hasAnyPreference =
      location ||
      budgetMax ||
      inferredGuestCount ||
      preferred_facilities.length > 0 ||
      purpose ||
      prefer_cheapest ||
      prefer_best_rated;

    if (!hasAnyPreference) {
      return res.status(400).json({
        message: "Tolong beritahu kami preferensi Anda seperti lokasi, budget, jumlah tamu, fasilitas yang diinginkan, atau tujuan perjalanan. Kami butuh setidaknya satu informasi untuk merekomendasikan hotel yang sesuai! 😊"
      });
    }

    const whereClauses = ["lk.status = 'available'"];
    const params = [];

    if (location) {
      addLocationFilter(whereClauses, params, location);
    }

    if (budgetMax) {
      whereClauses.push("lk.price <= ?");
      params.push(budgetMax);
    }

    if (inferredGuestCount) {
      whereClauses.push("dk.capacity >= ?");
      params.push(inferredGuestCount);
    }

    // If "prefer_cheapest" is set and no explicit budget given, don't filter by
    // budget at all — instead, fetch a wider set so we can rank by price.
    const effectiveBudgetMax = budgetMax || null;

    let rows = await queryHelper.callRpc("get_available_hotels_with_filters", {
      location_filter: location || null,
      budget_max: effectiveBudgetMax,
      guest_count: inferredGuestCount || null,
      limit_count: limitValue
    });

    // Fallback: if no rows and a budget was given, retry without budget filter
    // (helps when user says "termurah" with an unrealistically low number, or
    // when filters combined are too strict).
    if (rows.length === 0 && (budgetMax || inferredGuestCount)) {
      rows = await queryHelper.callRpc("get_available_hotels_with_filters", {
        location_filter: location || null,
        budget_max: null,
        guest_count: null,
        limit_count: limitValue
      });
    }

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Tidak ada hotel yang memiliki kamar tersedia sesuai preferensi dari database.",
        preferences: {
          location: location || null,
          budget_max: budgetMax,
          guest_count: inferredGuestCount,
          preferred_facilities,
          purpose: purpose || null
        },
        data: {
          recommended_hotels: [],
          summary: "Tidak ada hotel yang cocok dari database."
        }
      });
    }

    const candidates = rows.map((row) => {
      const hotelData = {
        id_list_hotel: row.id_list_hotel,
        hotel_name: row.hotel_name,
        location: row.location,
        contact_person: row.contact_person,
        contact_email: row.contact_email,
        contact_phone: row.contact_phone,

        available_room_count: Number(row.available_room_count),
        min_price: Number(row.min_price),
        max_price: Number(row.max_price),
        max_capacity: Number(row.max_capacity),
        available_room_types: row.available_room_types || "",
        all_facilities: row.all_facilities || "",

        avg_rating: Number(row.avg_rating),
        total_rating: Number(row.total_rating)
      };

      const localResult = calculateHotelScore(hotelData, {
        ...requestData,
        budget_max: budgetMax,
        guest_count: inferredGuestCount,
        preferred_facilities,
        prefer_cheapest,
        prefer_best_rated
      });

      return {
        ...hotelData,
        local_score: localResult.score,
        matched_facilities: localResult.matched_facilities
      };
    });

    let rankedCandidates;

    if (prefer_cheapest && !budgetMax) {
      // Sort primarily by price ascending when user explicitly wants cheapest
      // and gave no numeric budget.
      rankedCandidates = candidates.sort((a, b) => {
        if (Number(a.min_price) !== Number(b.min_price)) {
          return Number(a.min_price) - Number(b.min_price);
        }
        return b.local_score - a.local_score;
      });
    } else if (prefer_best_rated) {
      rankedCandidates = candidates.sort((a, b) => {
        if (Number(b.avg_rating) !== Number(a.avg_rating)) {
          return Number(b.avg_rating) - Number(a.avg_rating);
        }
        return b.local_score - a.local_score;
      });
    } else {
      rankedCandidates = candidates.sort((a, b) => {
        if (b.local_score !== a.local_score) {
          return b.local_score - a.local_score;
        }

        if (Number(b.avg_rating) !== Number(a.avg_rating)) {
          return Number(b.avg_rating) - Number(a.avg_rating);
        }

        return Number(a.min_price) - Number(b.min_price);
      });
    }

    const candidatesForLlm = rankedCandidates.slice(0, 10);

    const systemPrompt = `
Kamu adalah modul rekomendasi hotel untuk aplikasi booking hotel.
Kamu hanya boleh memilih hotel dari kandidat yang diberikan backend.
Jangan membuat nama hotel, harga, fasilitas, rating, lokasi, atau jumlah kamar yang tidak ada di kandidat.
Jawaban wajib JSON valid.
Jangan gunakan markdown.
Rekomendasikan hotel, bukan nomor kamar.
Perhatikan preferensi customer (lokasi, budget, jumlah tamu, fasilitas, tujuan perjalanan,
preferensi harga termurah, atau preferensi rating terbaik) saat memilih dan menjelaskan alasan.
`;

    const userPrompt = JSON.stringify({
      task: "Pilih maksimal 3 hotel terbaik untuk customer berdasarkan preferensi.",
      customer_preferences: {
        location: location || null,
        budget_max: budgetMax,
        guest_count: inferredGuestCount,
        preferred_facilities,
        purpose: purpose || null,
        prefer_cheapest,
        prefer_best_rated
      },
      candidate_hotels_from_database: candidatesForLlm,
      required_output_format: {
        recommended_hotels: [
          {
            rank: 1,
            id_list_hotel: "number",
            hotel_name: "string",
            location: "string",
            min_price: "number",
            available_room_count: "number",
            available_room_types: "string",
            max_capacity: "number",
            score: "number from 0 to 100",
            reason: "string"
          }
        ],
        summary: "string"
      }
    });

    let recommendation;

    try {
      const content = await askLlmContent({
        systemPrompt,
        userPrompt,
        temperature: 0.2,
        timeoutMs: 60000
      });

      const parsedRecommendation = extractJsonFromText(content);
      recommendation = normalizeLlmRecommendation(parsedRecommendation, rankedCandidates);
    } catch (llmError) {
      recommendation = buildDatabaseRecommendation(
        rankedCandidates,
        `LLM tidak berhasil memberi response JSON valid, rekomendasi hotel tetap dibuat dari ranking database. Detail: ${llmError.message}`
      );
    }

    return res.json({
      message: "Rekomendasi hotel berhasil dibuat dari database project.",
      source: LLM_PROVIDER === "openrouter"
        ? "database_mysql_project_dengan_openrouter"
        : "database_mysql_project_dengan_ollama",
      llm_provider: LLM_PROVIDER,
      model: getActiveLlmModel(),
      preferences: {
        location: location || null,
        budget_max: budgetMax,
        guest_count: inferredGuestCount,
        preferred_facilities,
        purpose: purpose || null,
        prefer_cheapest,
        prefer_best_rated
      },
      total_candidates_from_database: rows.length,
      candidates_used_by_llm: candidatesForLlm.length,
      data: recommendation
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal membuat rekomendasi hotel.",
      error: error.message
    });
  }
};