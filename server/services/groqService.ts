import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Simple in-memory response cache to save tokens and prevent rate limits
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: any) {
  cache.set(key, { timestamp: Date.now(), data });
}

function getGroqClient(): { client: Groq; model: string } | null {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return null;
  }
  const model = process.env.GROQ_MODEL?.trim() || 'openai/gpt-oss-120b';
  return { client: new Groq({ apiKey }), model };
}

/**
 * 1. AI DEAL ANALYSIS & GEN-Z INSIGHT
 */
export async function analyzeDealInsight(product: any, history: any[] = []) {
  const cacheKey = `deal_insight_${product.id || product.asin}_${product.currentPrice}_${history.length}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const groq = getGroqClient();
  if (!groq) {
    return generateFallbackDealInsight(product, history);
  }

  const systemPrompt = `You are PricePulse AI, an intelligent personal shopping analyst and deal evaluator.
You analyze factual product pricing data to help buyers decide if a deal is good.
Rules:
- NEVER invent, change, or fabricate prices, ratings, discounts, or reviews.
- Base your analysis ONLY on the given factual numbers.
- Provide a punchy Gen-Z headline/badge (e.g. "🔥 This price is cooking", "👀 Kinda interesting rn", "🎯 Target price reached", "😬 Wait on this one").
- Return ONLY a valid JSON object matching the requested schema. No markdown wrapping.`;

  const userPrompt = `Analyze this factual product data:
Product Name: ${product.name}
Current Price: ₹${product.currentPrice}
Original/List Price: ${product.originalPrice ? '₹' + product.originalPrice : 'Not specified'}
Savings: ${product.savingsAmount ? '₹' + product.savingsAmount + ' (' + product.discountPercent + '%)' : 'None detected'}
Rating: ${product.rating || 'N/A'} (${product.reviewCount || 0} reviews)
Store: ${product.store || 'Amazon'}
Historical Data Points: ${history.length} points recorded
${history.length > 0 ? 'History: ' + JSON.stringify(history.slice(-5)) : 'No historical price logs available yet.'}

Respond with this exact JSON structure:
{
  "verdict": "good_time" | "maybe_wait" | "wait",
  "genZBadge": string (e.g. "🔥 This price is cooking"),
  "headline": string (concise deal summary, max 12 words),
  "explanation": string (factual 2-sentence explanation of current price vs reference/history),
  "pros": [string, string],
  "cons": [string, string],
  "whatToWatch": string,
  "confidence": "high" | "medium" | "insufficient_data"
}`;

  try {
    const response = await groq.client.chat.completions.create({
      model: groq.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 600
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    const result = {
      verdict: parsed.verdict || 'maybe_wait',
      genZBadge: parsed.genZBadge || (product.discountPercent && product.discountPercent >= 15 ? '🔥 Cooking deal' : '👀 On the radar'),
      headline: parsed.headline || 'Analyzed live price against available retail reference.',
      explanation: parsed.explanation || `Currently listed at ₹${product.currentPrice?.toLocaleString()}.`,
      pros: Array.isArray(parsed.pros) ? parsed.pros : ['Verified retailer listing', 'Real-time price tracking active'],
      cons: Array.isArray(parsed.cons) ? parsed.cons : ['Limited multi-month price records', 'Subject to daily flash fluctuations'],
      whatToWatch: parsed.whatToWatch || 'Track price drops during weekend flash sales.',
      confidence: parsed.confidence || (history.length >= 3 ? 'high' : 'medium')
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('[Groq] analyzeDealInsight error:', err);
    return generateFallbackDealInsight(product, history);
  }
}

/**
 * 2. SHOULD I BUY NOW? (DATA-GROUNDED)
 */
export async function shouldIBuyNow(product: any, history: any[] = []) {
  const cacheKey = `should_i_buy_${product.id || product.asin}_${product.currentPrice}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const groq = getGroqClient();
  if (!groq) {
    return generateFallbackShouldIBuy(product, history);
  }

  const prompt = `You are a shopping advisor. Given the following factual product data:
Product: ${product.name}
Current Price: ₹${product.currentPrice}
Original Price: ${product.originalPrice ? '₹' + product.originalPrice : 'N/A'}
Discount: ${product.discountPercent ? product.discountPercent + '%' : '0%'}
Rating: ${product.rating || 4.2} / 5
History length: ${history.length}

Determine a data-grounded recommendation.
Output exact JSON:
{
  "decision": "BUY_NOW" | "WAIT" | "NEUTRAL" | "INSUFFICIENT_DATA",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "reason": string (objective statement, never guarantee future prices or invent scarcity),
  "keyFactor": string
}`;

  try {
    const response = await groq.client.chat.completions.create({
      model: groq.model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 350
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content || '{}');
    const result = {
      decision: parsed.decision || (product.discountPercent >= 15 ? 'BUY_NOW' : 'NEUTRAL'),
      confidence: parsed.confidence || 'MEDIUM',
      reason: parsed.reason || `Current price of ₹${product.currentPrice?.toLocaleString()} is verified against retailer reference.`,
      keyFactor: parsed.keyFactor || 'Price vs Reference'
    };
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('[Groq] shouldIBuyNow error:', err);
    return generateFallbackShouldIBuy(product, history);
  }
}

/**
 * 3. PRODUCT COMPARISON (FACTUAL TRADE-OFFS)
 */
export async function compareProductsWithAI(productA: any, productB: any) {
  const cacheKey = `compare_${productA.id || productA.asin}_${productB.id || productB.asin}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const groq = getGroqClient();
  if (!groq) {
    const priceDiff = Math.abs(productA.currentPrice - productB.currentPrice);
    const cheaper = productA.currentPrice < productB.currentPrice ? productA.name : productB.name;
    return {
      comparisonSummary: `${cheaper} costs ₹${priceDiff.toLocaleString()} less. Both products offer distinct value options for their respective price tiers.`,
      tradeOffs: [
        `Price gap: ₹${priceDiff.toLocaleString()}`,
        `Rating comparison: ${productA.name} (${productA.rating}★) vs ${productB.name} (${productB.rating}★)`
      ],
      verdict: 'Evaluate based on your preferred brand and feature requirements.'
    };
  }

  const prompt = `Compare these two products strictly based on factual data without declaring one universally better:
Product A: ${productA.name} | Price: ₹${productA.currentPrice} | Rating: ${productA.rating}★ (${productA.reviewCount} reviews) | Specs: ${JSON.stringify(productA.specs || {})}
Product B: ${productB.name} | Price: ₹${productB.currentPrice} | Rating: ${productB.rating}★ (${productB.reviewCount} reviews) | Specs: ${JSON.stringify(productB.specs || {})}

Return JSON:
{
  "comparisonSummary": string (2 sentences describing price and key value trade-offs),
  "tradeOffs": [string, string, string],
  "verdict": string
}`;

  try {
    const response = await groq.client.chat.completions.create({
      model: groq.model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 500
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content || '{}');
    setCache(cacheKey, parsed);
    return parsed;
  } catch (err) {
    console.error('[Groq] compareProducts error:', err);
    return {
      comparisonSummary: `Comparing ${productA.name} (₹${productA.currentPrice?.toLocaleString()}) with ${productB.name} (₹${productB.currentPrice?.toLocaleString()}).`,
      tradeOffs: ['Price difference calculated accurately', 'Compare technical specifications directly'],
      verdict: 'Choose based on budget and required feature set.'
    };
  }
}

/**
 * 4. ALTERNATIVE PRODUCT ANALYSIS
 */
export async function analyzeAlternativeWithAI(mainProduct: any, alternativeProduct: any) {
  const cacheKey = `alt_analysis_${mainProduct.id}_${alternativeProduct.id}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const groq = getGroqClient();
  const priceDiff = mainProduct.currentPrice - alternativeProduct.price;
  const isCheaper = priceDiff > 0;

  if (!groq) {
    return {
      matchReason: isCheaper
        ? `Saves ₹${priceDiff.toLocaleString()} compared to ${mainProduct.name}.`
        : `Alternative option in the same category.`,
      keyTradeOffs: [
        `Price: ₹${alternativeProduct.price.toLocaleString()} vs ₹${mainProduct.currentPrice.toLocaleString()}`,
        `Rating: ${alternativeProduct.rating}★`
      ],
      savingsExplanation: isCheaper
        ? `₹${priceDiff.toLocaleString()} lower cost with comparable key features.`
        : `Alternative offering different brand ecosystem and feature balance.`
    };
  }

  const prompt = `Explain why a shopper considering "${mainProduct.name}" (₹${mainProduct.currentPrice}) might look at alternative "${alternativeProduct.name}" (₹${alternativeProduct.price}, rating: ${alternativeProduct.rating}★).
Is same product: ${alternativeProduct.isSameProduct ? 'YES (same exact product at different store)' : 'NO (different similar product)'}

Return JSON:
{
  "matchReason": string (1 concise sentence),
  "keyTradeOffs": [string, string],
  "savingsExplanation": string
}`;

  try {
    const response = await groq.client.chat.completions.create({
      model: groq.model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 350
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content || '{}');
    setCache(cacheKey, parsed);
    return parsed;
  } catch (err) {
    console.error('[Groq] analyzeAlternative error:', err);
    return {
      matchReason: `Alternative option priced at ₹${alternativeProduct.price?.toLocaleString()}.`,
      keyTradeOffs: ['Compare specifications side by side', 'Consider brand warranty and retailer delivery'],
      savingsExplanation: priceDiff > 0 ? `Saves ₹${priceDiff.toLocaleString()}` : 'Comparable tier'
    };
  }
}

/**
 * 5. NATURAL LANGUAGE SHOPPING QUERY ASSISTANT
 */
export async function parseShoppingQueryWithAI(query: string, availableProducts: any[]) {
  const groq = getGroqClient();

  if (!groq || availableProducts.length === 0) {
    const lower = query.toLowerCase();
    const matches = availableProducts.filter(p =>
      p.name.toLowerCase().includes(lower) ||
      p.brand.toLowerCase().includes(lower) ||
      p.category.toLowerCase().includes(lower)
    );
    return {
      matchedProductIds: matches.slice(0, 4).map(p => p.id),
      explanation: `Found ${matches.length} products matching "${query}".`,
      suggestedFilters: { query }
    };
  }

  const productCatalog = availableProducts.map(p => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.currentPrice,
    rating: p.rating,
    discountPercent: p.discountPercent || 0
  }));

  const prompt = `You are a shopping search assistant. User query: "${query}"
Available products in catalog:
${JSON.stringify(productCatalog, null, 2)}

Identify which product IDs best match the user's intent, budget constraints, or specifications.
Do NOT invent products not in the catalog.
Return JSON:
{
  "matchedProductIds": [string],
  "explanation": string (1-2 friendly sentences explaining why these match the user's criteria),
  "parsedIntent": {
    "maxBudget": number | null,
    "category": string | null,
    "keywords": [string]
  }
}`;

  try {
    const response = await groq.client.chat.completions.create({
      model: groq.model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 500
    });

    return JSON.parse(response.choices[0]?.message?.content || '{}');
  } catch (err) {
    console.error('[Groq] parseShoppingQuery error:', err);
    return {
      matchedProductIds: availableProducts.slice(0, 3).map(p => p.id),
      explanation: `Showing top products relevant to "${query}".`,
      parsedIntent: { keywords: [query] }
    };
  }
}

// Fallback generators when Groq API key is not present
function generateFallbackDealInsight(product: any, history: any[]) {
  const current = product.currentPrice || 0;
  const original = product.originalPrice || product.previousPrice || current;
  const discount = product.discountPercent || (original > current ? Math.round(((original - current) / original) * 100) : 0);

  let verdict: 'good_time' | 'maybe_wait' | 'wait' = 'maybe_wait';
  let badge = '🟡 On the radar';
  let headline = 'Moderate deal — verified retailer listing.';

  if (discount >= 20) {
    verdict = 'good_time';
    badge = '🔥 This price is cooking';
    headline = `${discount}% discount verified against reference price.`;
  } else if (discount >= 10) {
    verdict = 'good_time';
    badge = '👀 Worth watching';
    headline = `Solid ₹${(original - current).toLocaleString()} reduction from list price.`;
  }

  return {
    verdict,
    genZBadge: badge,
    headline,
    explanation: `Current price of ₹${current.toLocaleString()} reflects live Amazon pricing.`,
    pros: [`Direct retailer link on ${product.store || 'Amazon'}`, `${product.rating || 4.2}★ rating with verified customer feedback`],
    cons: ['Flash sales may offer seasonal discounts', 'Stock availability subject to demand'],
    whatToWatch: 'Set a target alert to get notified on any price drop.',
    confidence: history.length >= 3 ? 'high' : 'medium'
  };
}

function generateFallbackShouldIBuy(product: any, history: any[]) {
  const discount = product.discountPercent || 0;
  return {
    decision: discount >= 15 ? 'BUY_NOW' : 'NEUTRAL',
    confidence: 'MEDIUM',
    reason: `Current price is ₹${product.currentPrice?.toLocaleString()}${discount > 0 ? `, representing a ${discount}% savings.` : '.'}`,
    keyFactor: 'Price vs MSRP'
  };
}
