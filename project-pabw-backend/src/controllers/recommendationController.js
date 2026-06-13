import supabase from "../config/db.js";

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

const parseNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;

  if (typeof value === "number") {
    return Number.isNaN(value) ? null : value;
  }

  const cleaned = String(value)
    .toLowerCase()
    .replace(/rp/g, "")
    .replace(/\./g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .trim();

  const jutaMatch = cleaned.match(/^(\d+)(juta|jt)$/);

  if (jutaMatch) {
    return Number(jutaMatch[1]) * 1000000;
  }

  const ribuMatch = cleaned.match(/^(\d+)(ribu|rb)$/);

  if (ribuMatch) {
    return Number(ribuMatch[1]) * 1000;
  }

  const parsed = Number(cleaned);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
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

const extractBudgetFromPrompt = (prompt) => {
  const text = normalizeText(prompt);

  const jutaMatch = text.match(/(?:maksimal|max|budget|harga|di bawah|kurang dari)\s*(?:rp\s*)?(\d+)\s*(juta|jt)/);

  if (jutaMatch) {
    return Number(jutaMatch[1]) * 1000000;
  }

  const ribuMatch = text.match(/(?:maksimal|max|budget|harga|di bawah|kurang dari)\s*(?:rp\s*)?(\d+)\s*(ribu|rb)/);

  if (ribuMatch) {
    return Number(ribuMatch[1]) * 1000;
  }

  const numberMatch = text.match(/(?:maksimal|max|budget|harga|di bawah|kurang dari)\s*(?:rp\s*)?([\d.]+)/);

  if (numberMatch) {
    return parseNumber(numberMatch[1]);
  }

  return null;
};

const extractGuestCountFromPrompt = (prompt) => {
  const text = normalizeText(prompt);

  const guestMatch = text.match(/(\d+)\s*(orang|tamu|pax|dewasa)/);

  if (guestMatch) {
    return Number(guestMatch[1]);
  }

  if (text.includes("keluarga")) {
    return 4;
  }

  if (text.includes("pasangan") || text.includes("berdua")) {
    return 2;
  }

  return null;
};

const extractLocationFromPrompt = (prompt) => {
  const text = normalizeText(prompt);

  const aliasMatch = Object.keys(LOCATION_ALIASES).find((alias) => {
    return text.includes(alias);
  });

  if (aliasMatch) {
    return aliasMatch;
  }

  const allKeywords = Object.values(LOCATION_GROUPS).flat();

  const cityMatch = allKeywords.find((keyword) => {
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
  if (text.includes("bisnis") || text.includes("kerja")) return "bisnis";
  if (text.includes("liburan") || text.includes("wisata")) return "liburan";
  if (text.includes("honeymoon") || text.includes("bulan madu")) return "honeymoon";
  if (text.includes("transit")) return "transit";

  return null;
};

const extractPreferencesLocally = (prompt) => {
  return {
    location: extractLocationFromPrompt(prompt),
    budget_max: extractBudgetFromPrompt(prompt),
    guest_count: extractGuestCountFromPrompt(prompt),
    preferred_facilities: extractFacilitiesFromPrompt(prompt),
    purpose: extractPurposeFromPrompt(prompt)
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

const extractPreferencesFromPrompt = async (prompt) => {
  const systemPrompt = `
Kamu adalah parser preferensi hotel.
Tugasmu hanya mengekstrak preferensi customer dari teks bebas.
Jawaban wajib JSON valid.
Jangan gunakan markdown.
Jika data tidak disebutkan, isi null atau array kosong.
`;

  const userPrompt = `
Ekstrak preferensi hotel dari teks berikut:

"${prompt}"

Format output wajib:
{
  "location": string atau null,
  "budget_max": number atau null,
  "guest_count": number atau null,
  "preferred_facilities": array of string,
  "purpose": string atau null
}
`;

  try {
    const content = await askLlmContent({
      systemPrompt,
      userPrompt,
      temperature: 0.1,
      timeoutMs: 30000
    });

    return extractJsonFromText(content);
  } catch {
    return extractPreferencesLocally(prompt);
  }
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
      limit = 30
    } = requestData;

    const budgetMax = parseNumber(budget_max);
    const purposeText = normalizeText(purpose);
    const inferredGuestCount = parseNumber(guest_count) || (purposeText === "keluarga" ? 4 : null);
    const limitValue = Math.min(parseNumber(limit) || 30, 50);

    if (!location && !budgetMax && !inferredGuestCount && preferred_facilities.length === 0 && !purpose) {
      return res.status(400).json({
        message: "Minimal isi salah satu preferensi: location, budget_max, guest_count, preferred_facilities, atau purpose."
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

    const [rows] = await pool.query(
      `
      SELECT
        lh.id_list_hotel,
        lh.hotel_name,
        lh.location,
        lh.contact_person,
        lh.contact_email,
        lh.contact_phone,

        COUNT(DISTINCT lk.id_list_kamar) AS available_room_count,
        MIN(lk.price) AS min_price,
        MAX(lk.price) AS max_price,
        MAX(dk.capacity) AS max_capacity,

        GROUP_CONCAT(DISTINCT dk.type_room ORDER BY dk.type_room SEPARATOR ', ') AS available_room_types,
        GROUP_CONCAT(DISTINCT dk.facility SEPARATOR ', ') AS all_facilities,

        COALESCE(rt.avg_rating, 0) AS avg_rating,
        COALESCE(rt.total_rating, 0) AS total_rating

      FROM list_hotel lh

      JOIN list_kamar lk
        ON lk.id_list_hotel = lh.id_list_hotel

      JOIN detail_kamar dk
        ON lk.id_detail_kamar = dk.id_detail_kamar

      LEFT JOIN (
        SELECT
          id_list_hotel,
          AVG(rating) AS avg_rating,
          COUNT(*) AS total_rating
        FROM hotel_rating
        GROUP BY id_list_hotel
      ) rt
        ON rt.id_list_hotel = lh.id_list_hotel

      WHERE ${whereClauses.join(" AND ")}

      GROUP BY
        lh.id_list_hotel,
        lh.hotel_name,
        lh.location,
        lh.contact_person,
        lh.contact_email,
        lh.contact_phone,
        rt.avg_rating,
        rt.total_rating

      ORDER BY min_price ASC

      LIMIT ?
      `,
      [...params, limitValue]
    );

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
        preferred_facilities
      });

      return {
        ...hotelData,
        local_score: localResult.score,
        matched_facilities: localResult.matched_facilities
      };
    });

    const rankedCandidates = candidates.sort((a, b) => {
      if (b.local_score !== a.local_score) {
        return b.local_score - a.local_score;
      }

      if (Number(b.avg_rating) !== Number(a.avg_rating)) {
        return Number(b.avg_rating) - Number(a.avg_rating);
      }

      return Number(a.min_price) - Number(b.min_price);
    });

    const candidatesForLlm = rankedCandidates.slice(0, 10);

    const systemPrompt = `
Kamu adalah modul rekomendasi hotel untuk aplikasi booking hotel.
Kamu hanya boleh memilih hotel dari kandidat yang diberikan backend.
Jangan membuat nama hotel, harga, fasilitas, rating, lokasi, atau jumlah kamar yang tidak ada di kandidat.
Jawaban wajib JSON valid.
Jangan gunakan markdown.
Rekomendasikan hotel, bukan nomor kamar.
`;

    const userPrompt = JSON.stringify({
      task: "Pilih maksimal 3 hotel terbaik untuk customer berdasarkan preferensi.",
      customer_preferences: {
        location: location || null,
        budget_max: budgetMax,
        guest_count: inferredGuestCount,
        preferred_facilities,
        purpose: purpose || null
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
        purpose: purpose || null
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