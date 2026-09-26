import dotenv from 'dotenv';
dotenv.config();

// In-memory cache to prevent repetitive API calls
const geminiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

function getCached<T>(key: string): T | null {
  const cached = geminiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }
  return null;
}

function setCached<T>(key: string, data: T): void {
  geminiCache.set(key, { data, timestamp: Date.now() });
}

function getGeminiKey(): string | null {
  const key = (process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '').trim();
  if (!key || key === 'your_gemini_api_key_here' || key.length < 10) {
    return null;
  }
  return key;
}

/**
 * Core helper to call Google Gemini API with JSON response format
 */
async function callGemini(prompt: string, systemInstruction?: string, modelOverride?: string): Promise<string> {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    throw new Error('Google Gemini API is not configured (GOOGLE_GEMINI_API_KEY missing).');
  }

  const models = [
    modelOverride || process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-2.0-flash'
  ];

  let lastError: any = null;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody: any = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      }
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[Gemini API] Error on model ${model} (status ${response.status}):`, errorText.slice(0, 200));
        lastError = new Error(`Gemini API error ${response.status}: ${errorText.slice(0, 150)}`);
        continue; // Try fallback model
      }

      const json = await response.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini API] Network exception with model ${model}:`, err.message);
    }
  }

  throw lastError || new Error('All Gemini models failed to respond.');
}

function extractJson<T>(raw: string, fallback: T): T {
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        // ignore
      }
    }
    return fallback;
  }
}

// =========================================================================
// 1. PRODUCT ANALYSIS (Key features, Pros, Cons, Suitable for)
// =========================================================================
export interface GeminiProductAnalysis {
  summary: string;
  keyFeatures: string[];
  pros: string[];
  cons: string[];
  importantConsiderations: string[];
  suitableFor: string[];
  notIdealFor: string[];
  provider: string;
}

export async function analyzeProductWithGemini(product: any): Promise<GeminiProductAnalysis> {
  const cacheKey = `gemini_product_analysis_${product.id || product.name}`;
  const cached = getCached<GeminiProductAnalysis>(cacheKey);
  if (cached) return cached;

  const prompt = `Analyze this real product strictly based on provided factual information.
DO NOT invent specifications, fake pricing, or unsubstantiated claims.

Product Data:
- Title: ${product.name}
- Brand: ${product.brand || 'Unknown'}
- Category: ${product.category || 'Electronics'}
- Store: ${product.store || 'Amazon India'}
- Current Price: ₹${product.currentPrice}
- Original / Reference Price: ₹${product.originalPrice || product.previousPrice || 'N/A'}
- Rating: ${product.rating || 'N/A'} (${product.reviewCount || 0} reviews)
- Availability: ${product.availability || 'In Stock'}
- Known Specifications: ${JSON.stringify(product.specs || {})}

Return valid JSON with format:
{
  "summary": "2 concise sentences summarizing value and identity",
  "keyFeatures": ["feature 1 from specs", "feature 2 from specs", "feature 3"],
  "pros": ["factual strength 1", "factual strength 2", "factual strength 3"],
  "cons": ["factual limitation 1", "factual limitation 2"],
  "importantConsiderations": ["pricing/compatibility/battery point"],
  "suitableFor": ["who should buy this"],
  "notIdealFor": ["who should look elsewhere"]
}`;

  const fallback: GeminiProductAnalysis = {
    summary: `${product.name} offered at ₹${product.currentPrice?.toLocaleString()} on ${product.store || 'Amazon'}.`,
    keyFeatures: Object.entries(product.specs || {}).map(([k, v]) => `${k}: ${v}`).slice(0, 4),
    pros: [
      product.discountPercent ? `Currently discounted by ${product.discountPercent}%` : 'Competitively priced',
      product.rating ? `Strong user satisfaction rating of ${product.rating}/5` : 'Verified retailer listing'
    ],
    cons: ['Pricing may fluctuate based on retailer flash sales', 'Subject to stock availability'],
    importantConsiderations: [`Target alert recommended around ₹${Math.round(product.currentPrice * 0.9).toLocaleString()}`],
    suitableFor: ['Shoppers seeking verified retailer deals with price tracking'],
    notIdealFor: ['Shoppers needing immediate clearance without price monitoring'],
    provider: 'Algorithmic Fallback (Gemini key pending)'
  };

  try {
    const raw = await callGemini(prompt, 'You are an objective shopping intelligence analyst. Output strictly valid JSON.');
    const parsed = extractJson<GeminiProductAnalysis>(raw, fallback);
    parsed.provider = 'Google Gemini (gemini-1.5-flash)';
    setCached(cacheKey, parsed);
    return parsed;
  } catch (err: any) {
    console.warn('[Gemini Service] Fallback used for analyzeProduct:', err.message);
    return fallback;
  }
}

// =========================================================================
// 2. SHOULD I BUY NOW? (Decision Support)
// =========================================================================
export interface GeminiShouldIBuy {
  decision: 'BUY_NOW' | 'WAIT' | 'NEUTRAL' | 'INSUFFICIENT_DATA';
  reason: string;
  key_factors: string[];
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  factual_support: {
    currentPrice: number;
    referencePrice: number;
    lowestRecorded?: number;
    highestRecorded?: number;
    discountPercent?: number;
  };
  provider: string;
}

export async function shouldIBuyWithGemini(product: any, history: any[] = []): Promise<GeminiShouldIBuy> {
  const current = product.currentPrice;
  const previous = product.previousPrice || current;
  const original = product.originalPrice || previous;
  const prices = history.map((h: any) => h.price).filter(Boolean);
  const lowest = prices.length > 0 ? Math.min(...prices, current) : current;
  const highest = prices.length > 0 ? Math.max(...prices, original) : original;
  const average = prices.length > 0 ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length) : current;

  const fallback: GeminiShouldIBuy = {
    decision: current <= (product.targetPrice || average * 0.95) ? 'BUY_NOW' : current < average ? 'BUY_NOW' : 'NEUTRAL',
    reason: current < average
      ? `Current price of ₹${current.toLocaleString()} is below historical average ₹${average.toLocaleString()}.`
      : `Current price is near baseline ₹${average.toLocaleString()}.`,
    key_factors: [
      `Current price: ₹${current.toLocaleString()}`,
      `Recorded range: ₹${lowest.toLocaleString()} - ₹${highest.toLocaleString()}`,
      `Target: ₹${product.targetPrice?.toLocaleString() || 'Not set'}`
    ],
    confidence: history.length >= 3 ? 'HIGH' : 'MEDIUM',
    factual_support: {
      currentPrice: current,
      referencePrice: average,
      lowestRecorded: lowest,
      highestRecorded: highest,
      discountPercent: product.discountPercent
    },
    provider: 'Deterministic Fallback'
  };

  const prompt = `You are a shopping decision analyst. Provide a "Should I Buy Now?" verdict based strictly on factual numbers.
DO NOT invent numbers.

Product Numbers:
- Name: ${product.name}
- Current Price: ₹${current}
- Previous Price: ₹${previous}
- Launch/Original: ₹${original}
- Lowest Recorded: ₹${lowest}
- Highest Recorded: ₹${highest}
- Average Tracked: ₹${average}
- Target Price: ₹${product.targetPrice || 'None'}
- Price Points Count: ${history.length}

Return valid JSON:
{
  "decision": "BUY_NOW" | "WAIT" | "NEUTRAL" | "INSUFFICIENT_DATA",
  "reason": "1-2 sentence data-grounded rationale",
  "key_factors": ["Factual bullet 1", "Factual bullet 2", "Factual bullet 3"],
  "confidence": "LOW" | "MEDIUM" | "HIGH"
}`;

  try {
    const raw = await callGemini(prompt, 'You are an objective shopping decision engine. Output strictly valid JSON.');
    const parsed = extractJson<any>(raw, fallback);
    return {
      decision: ['BUY_NOW', 'WAIT', 'NEUTRAL', 'INSUFFICIENT_DATA'].includes(parsed.decision) ? parsed.decision : fallback.decision,
      reason: parsed.reason || fallback.reason,
      key_factors: Array.isArray(parsed.key_factors) && parsed.key_factors.length > 0 ? parsed.key_factors : fallback.key_factors,
      confidence: ['LOW', 'MEDIUM', 'HIGH'].includes(parsed.confidence) ? parsed.confidence : fallback.confidence,
      factual_support: fallback.factual_support,
      provider: 'Google Gemini (gemini-1.5-flash)'
    };
  } catch (err: any) {
    console.warn('[Gemini Service] Fallback used for shouldIBuy:', err.message);
    return fallback;
  }
}

// =========================================================================
// 3. PRICE HISTORY EXPLANATION (Trend analysis)
// =========================================================================
export interface GeminiPriceHistoryAnalysis {
  trendExplanation: string;
  volatility: 'Low' | 'Moderate' | 'High';
  priceRangeNote: string;
  buyingWindowAdvice: string;
  provider: string;
}

export async function analyzePriceHistoryWithGemini(product: any, history: any[] = []): Promise<GeminiPriceHistoryAnalysis> {
  const prices = history.map((h: any) => h.price).filter(Boolean);
  const lowest = prices.length > 0 ? Math.min(...prices, product.currentPrice) : product.currentPrice;
  const highest = prices.length > 0 ? Math.max(...prices, product.originalPrice || product.currentPrice) : product.currentPrice;
  const avg = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : product.currentPrice;

  const fallback: GeminiPriceHistoryAnalysis = {
    trendExplanation: prices.length > 1
      ? `Price has fluctuated between ₹${lowest.toLocaleString()} and ₹${highest.toLocaleString()} with an average of ₹${avg.toLocaleString()}.`
      : 'Initial baseline tracked. Price tracking active to capture upcoming flash sales.',
    volatility: (highest - lowest) > (avg * 0.15) ? 'High' : 'Moderate',
    priceRangeNote: `Recorded all-time low: ₹${lowest.toLocaleString()} vs peak: ₹${highest.toLocaleString()}.`,
    buyingWindowAdvice: product.currentPrice <= lowest * 1.03
      ? 'Currently at or near lowest recorded price point — favorable buying window.'
      : `Set a target alert around ₹${Math.round(avg * 0.92).toLocaleString()} to catch the next dip.`,
    provider: 'Deterministic Fallback'
  };

  if (history.length < 2) return fallback;

  const prompt = `Analyze this real price history log for ${product.name}.
Data:
- Current Price: ₹${product.currentPrice}
- Tracked History: ${JSON.stringify(history.slice(-8))}
- Calculated Low: ₹${lowest}, High: ₹${highest}, Avg: ₹${avg}

Return JSON:
{
  "trendExplanation": "2 sentence explanation of recent movements",
  "volatility": "Low" | "Moderate" | "High",
  "priceRangeNote": "1 sentence summarizing the range behavior",
  "buyingWindowAdvice": "1 actionable sentence on whether to buy now or wait"
}`;

  try {
    const raw = await callGemini(prompt, 'Analyze price trends without inventing data. Output valid JSON.');
    const parsed = extractJson<GeminiPriceHistoryAnalysis>(raw, fallback);
    parsed.provider = 'Google Gemini (gemini-1.5-flash)';
    return parsed;
  } catch {
    return fallback;
  }
}

// =========================================================================
// 4. PRODUCT COMPARISON (Compare 2 products)
// =========================================================================
export interface GeminiProductComparison {
  majorDifferences: string[];
  tradeOffs: string[];
  suitableUserForA: string;
  suitableUserForB: string;
  conciseSummary: string;
  provider: string;
}

export async function compareProductsWithGemini(productA: any, productB: any): Promise<GeminiProductComparison> {
  const fallback: GeminiProductComparison = {
    majorDifferences: [
      `Price: ${productA.name} is ₹${productA.currentPrice?.toLocaleString()} vs ${productB.name} at ₹${productB.currentPrice?.toLocaleString()}`,
      `Store: ${productA.store || 'Amazon'} vs ${productB.store || 'Retailer'}`
    ],
    tradeOffs: [
      `Price delta: ₹${Math.abs((productA.currentPrice || 0) - (productB.currentPrice || 0)).toLocaleString()}`
    ],
    suitableUserForA: `Users looking for ${productA.brand || productA.name}`,
    suitableUserForB: `Users prioritizing ${productB.brand || productB.name}`,
    conciseSummary: `Direct comparison between ${productA.name} and ${productB.name}.`,
    provider: 'Deterministic Fallback'
  };

  const prompt = `Compare these two real products based on provided specs. Missing specs should be treated as "Not available" and never invented.

Product A:
- Title: ${productA.name}
- Price: ₹${productA.currentPrice}
- Brand: ${productA.brand || 'N/A'}
- Specs: ${JSON.stringify(productA.specs || {})}

Product B:
- Title: ${productB.name}
- Price: ₹${productB.currentPrice}
- Brand: ${productB.brand || 'N/A'}
- Specs: ${JSON.stringify(productB.specs || {})}

Return valid JSON:
{
  "majorDifferences": ["diff 1", "diff 2", "diff 3"],
  "tradeOffs": ["trade-off 1 (e.g. price vs feature)"],
  "suitableUserForA": "Who should choose Product A",
  "suitableUserForB": "Who should choose Product B",
  "conciseSummary": "2 sentence bottom line verdict"
}`;

  try {
    const raw = await callGemini(prompt, 'Objective comparison engine. Output strictly valid JSON.');
    const parsed = extractJson<GeminiProductComparison>(raw, fallback);
    parsed.provider = 'Google Gemini (gemini-1.5-flash)';
    return parsed;
  } catch {
    return fallback;
  }
}

// =========================================================================
// 5. NATURAL LANGUAGE SHOPPING SEARCH (Query Parsing)
// =========================================================================
export interface ParsedShoppingQuery {
  category: string;
  maxPrice?: number;
  minPrice?: number;
  brand?: string;
  minRam?: number;
  minStorage?: number;
  useCase?: string;
  currency: string;
  preference?: string;
  provider: string;
}

export async function parseShoppingQueryWithGemini(query: string): Promise<ParsedShoppingQuery> {
  const fallback: ParsedShoppingQuery = {
    category: query,
    currency: 'INR',
    provider: 'Regex Fallback'
  };

  const priceMatch = query.match(/(?:under|below|less than|budget)\s*(?:₹|rs\.?|inr)?\s*(\d+)(?:k|,000)?/i);
  if (priceMatch) {
    let val = parseInt(priceMatch[1], 10);
    if (query.toLowerCase().includes('k') && val < 1000) val *= 1000;
    fallback.maxPrice = val;
  }

  const prompt = `Extract structured shopping filters from this user search request.
User query: "${query}"

Return valid JSON:
{
  "category": "e.g. smartphone / laptop / headphones / smartwatch",
  "maxPrice": number or null (e.g. 70000 for 70k),
  "minPrice": number or null,
  "brand": "brand name or null",
  "minRam": number in GB or null,
  "minStorage": number in GB or null,
  "useCase": "e.g. gaming / coding / workout / travel / general",
  "currency": "INR",
  "preference": "battery / performance / noise-cancellation / budget"
}`;

  try {
    const raw = await callGemini(prompt, 'Output strictly JSON. Extract exact numeric limits.');
    const parsed = extractJson<ParsedShoppingQuery>(raw, fallback);
    parsed.currency = 'INR';
    parsed.provider = 'Google Gemini (gemini-1.5-flash)';
    return parsed;
  } catch {
    return fallback;
  }
}

// =========================================================================
// 6. AI SHOPPING ASSISTANT (Grounded conversational assistance)
// =========================================================================
export async function queryShoppingAssistantWithGemini(
  userQuery: string,
  availableProducts: any[] = [],
  userPreferences?: string
): Promise<{
  explanation: string;
  matchedProductIds: string[];
  provider: string;
}> {
  const fallback = {
    explanation: `Found ${availableProducts.length} deals matching your shopping interests.`,
    matchedProductIds: availableProducts.slice(0, 3).map((p) => p.id),
    provider: 'Deterministic Fallback'
  };

  const productCatalogSummary = availableProducts.slice(0, 10).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.currentPrice,
    category: p.category,
    brand: p.brand,
    rating: p.rating,
    discountPercent: p.discountPercent,
    specs: p.specs
  }));

  const prompt = `You are a shopping assistant helping a buyer choose products based ONLY on the provided live catalog.
DO NOT hallucinate or recommend products not in the catalog.

User Query: "${userQuery}"
User Preferences: ${userPreferences || 'None'}

Available Products:
${JSON.stringify(productCatalogSummary, null, 2)}

Return valid JSON:
{
  "explanation": "Concise, friendly 2-3 sentence recommendation explaining which product best fits and why, highlighting real prices and specs.",
  "matchedProductIds": ["id1", "id2"]
}`;

  try {
    const raw = await callGemini(prompt, 'Be an objective, helpful shopping advisor. Output strictly JSON.');
    const parsed = extractJson<any>(raw, fallback);
    return {
      explanation: parsed.explanation || fallback.explanation,
      matchedProductIds: Array.isArray(parsed.matchedProductIds) && parsed.matchedProductIds.length > 0
        ? parsed.matchedProductIds
        : fallback.matchedProductIds,
      provider: 'Google Gemini (gemini-1.5-flash)'
    };
  } catch {
    return fallback;
  }
}
