import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  extractAmazonProductId,
  fetchAmazonProduct,
  searchAmazonProducts
} from './services/serpApiService.js';
import {
  analyzeDealInsight,
  shouldIBuyNow,
  compareProductsWithAI,
  analyzeAlternativeWithAI,
  parseShoppingQueryWithAI
} from './services/groqService.js';
import {
  analyzeProductWithGemini,
  shouldIBuyWithGemini,
  analyzePriceHistoryWithGemini,
  compareProductsWithGemini,
  parseShoppingQueryWithGemini,
  queryShoppingAssistantWithGemini
} from './services/geminiService.js';
import { emailService } from './services/emailService.js';
import { getSmartAlternatives } from './services/alternativesService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// 1. HEALTH / CONFIG STATUS
app.get('/api/health', (req: Request, res: Response) => {
  const serpapiKey = process.env.SERPAPI_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const geminiKey = (process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY)?.trim();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    serpapi: {
      configured: Boolean(serpapiKey && serpapiKey !== 'your_serpapi_api_key_here')
    },
    groq: {
      configured: Boolean(groqKey && groqKey !== 'your_groq_api_key_here'),
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
    },
    gemini: {
      configured: Boolean(geminiKey && geminiKey !== 'your_gemini_api_key_here'),
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    },
    gmail: emailService.getStatus()
  });
});

// 2. FETCH REAL AMAZON PRODUCT VIA SERPAPI
app.post('/api/amazon/product', async (req: Request, res: Response) => {
  try {
    const { url, asin: directAsin, domain: directDomain } = req.body;

    let asin = directAsin;
    let domain = directDomain || 'amazon.in';

    if (url) {
      const parsed = extractAmazonProductId(url);
      if (!parsed) {
        return res.status(400).json({
          success: false,
          error: 'Could not identify the Amazon product from this URL. Please provide a valid Amazon link with an ASIN (e.g. amazon.in/dp/B0XXXXXXXX).'
        });
      }
      asin = parsed.asin;
      domain = parsed.domain;
    }

    if (!asin) {
      return res.status(400).json({
        success: false,
        error: 'Missing Amazon ASIN or product URL.'
      });
    }

    const product = await fetchAmazonProduct(asin, domain);

    return res.json({
      success: true,
      product
    });
  } catch (err: any) {
    console.error('[API] /api/amazon/product error:', err.message);
    const status = err.message?.includes('SerpApi is not configured') ? 503 : 500;
    return res.status(status).json({
      success: false,
      error: err.message || 'We could not fetch this Amazon product right now.'
    });
  }
});

// 3. SEARCH AMAZON REAL PRODUCTS VIA SERPAPI
app.get('/api/amazon/search', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || 'deals of the day electronics';
    const domain = (req.query.domain as string) || 'amazon.in';
    const limit = parseInt((req.query.limit as string) || '12', 10);

    const products = await searchAmazonProducts(query, domain, limit);

    return res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err: any) {
    console.error('[API] /api/amazon/search error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Search failed.',
      products: []
    });
  }
});

// 3.5. SMART SAME-CATEGORY ALTERNATIVES (SERPAPI + DETERMINISTIC RANKING)
app.post('/api/products/alternatives', async (req: Request, res: Response) => {
  try {
    const { product, expandRange = false } = req.body;
    if (!product || !product.name || product.currentPrice === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Product payload containing name and currentPrice is required.'
      });
    }

    const alternativesData = await getSmartAlternatives(product, Boolean(expandRange));
    return res.json(alternativesData);
  } catch (err: any) {
    console.error('[API] /api/products/alternatives error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch alternatives.'
    });
  }
});

// 4. GROQ AI DEAL INSIGHT
app.post('/api/ai/deal-insight', async (req: Request, res: Response) => {
  try {
    const { product, history = [] } = req.body;
    if (!product || !product.name) {
      return res.status(400).json({ success: false, error: 'Product payload required.' });
    }

    const insight = await analyzeDealInsight(product, history);
    return res.json({ success: true, insight });
  } catch (err: any) {
    console.error('[API] /api/ai/deal-insight error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. GROQ AI SHOULD I BUY NOW
app.post('/api/ai/should-i-buy', async (req: Request, res: Response) => {
  try {
    const { product, history = [] } = req.body;
    if (!product || !product.name) {
      return res.status(400).json({ success: false, error: 'Product payload required.' });
    }

    const recommendation = await shouldIBuyNow(product, history);
    return res.json({ success: true, recommendation });
  } catch (err: any) {
    console.error('[API] /api/ai/should-i-buy error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 6. GROQ AI PRODUCT COMPARISON
app.post('/api/ai/compare', async (req: Request, res: Response) => {
  try {
    const { productA, productB } = req.body;
    if (!productA || !productB) {
      return res.status(400).json({ success: false, error: 'Two products required for comparison.' });
    }

    const comparison = await compareProductsWithAI(productA, productB);
    return res.json({ success: true, comparison });
  } catch (err: any) {
    console.error('[API] /api/ai/compare error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 7. GROQ AI ALTERNATIVE ANALYSIS
app.post('/api/ai/alternative-analysis', async (req: Request, res: Response) => {
  try {
    const { mainProduct, alternativeProduct } = req.body;
    if (!mainProduct || !alternativeProduct) {
      return res.status(400).json({ success: false, error: 'Main and alternative products required.' });
    }

    const analysis = await analyzeAlternativeWithAI(mainProduct, alternativeProduct);
    return res.json({ success: true, analysis });
  } catch (err: any) {
    console.error('[API] /api/ai/alternative-analysis error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 8. GROQ AI NATURAL LANGUAGE SHOPPING ASSISTANT
app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  try {
    const { query, availableProducts = [] } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query required.' });
    }

    const result = await parseShoppingQueryWithAI(query, availableProducts);
    return res.json({ success: true, result });
  } catch (err: any) {
    console.error('[API] /api/ai/assistant error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 🌟 GOOGLE GEMINI AI ENDPOINTS
// =========================================================================

// 9. GEMINI PRODUCT ANALYSIS (Deep-Dive Analysis, Pros & Cons, Key Highlights)
app.post('/api/gemini/product-analysis', async (req: Request, res: Response) => {
  try {
    const { product } = req.body;
    if (!product || !product.name) {
      return res.status(400).json({ success: false, error: 'Product payload required.' });
    }

    const analysis = await analyzeProductWithGemini(product);
    return res.json({ success: true, analysis });
  } catch (err: any) {
    console.error('[API] /api/gemini/product-analysis error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 10. GEMINI SHOULD I BUY
app.post('/api/gemini/should-i-buy', async (req: Request, res: Response) => {
  try {
    const { product, history = [] } = req.body;
    if (!product || !product.name) {
      return res.status(400).json({ success: false, error: 'Product payload required.' });
    }

    const result = await shouldIBuyWithGemini(product, history);
    return res.json({ success: true, result });
  } catch (err: any) {
    console.error('[API] /api/gemini/should-i-buy error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 11. GEMINI PRICE HISTORY ANALYSIS
app.post('/api/gemini/price-history', async (req: Request, res: Response) => {
  try {
    const { product, history = [] } = req.body;
    if (!product || !product.name) {
      return res.status(400).json({ success: false, error: 'Product payload required.' });
    }

    const analysis = await analyzePriceHistoryWithGemini(product, history);
    return res.json({ success: true, analysis });
  } catch (err: any) {
    console.error('[API] /api/gemini/price-history error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 12. GEMINI COMPARE PRODUCTS
app.post('/api/gemini/compare', async (req: Request, res: Response) => {
  try {
    const { productA, productB } = req.body;
    if (!productA || !productB) {
      return res.status(400).json({ success: false, error: 'Two products required for comparison.' });
    }

    const comparison = await compareProductsWithGemini(productA, productB);
    return res.json({ success: true, comparison });
  } catch (err: any) {
    console.error('[API] /api/gemini/compare error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 13. GEMINI PARSE SHOPPING QUERY
app.post('/api/gemini/parse-query', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Search query required.' });
    }

    const parsed = await parseShoppingQueryWithGemini(query);
    return res.json({ success: true, parsed });
  } catch (err: any) {
    console.error('[API] /api/gemini/parse-query error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 14. GEMINI AI SHOPPING ASSISTANT
app.post('/api/gemini/assistant', async (req: Request, res: Response) => {
  try {
    const { query, availableProducts = [], userPreferences } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query required.' });
    }

    const result = await queryShoppingAssistantWithGemini(query, availableProducts, userPreferences);
    return res.json({ success: true, result });
  } catch (err: any) {
    console.error('[API] /api/gemini/assistant error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 📧 GMAIL EMAIL NOTIFICATION ENDPOINTS
// =========================================================================

// 15. EMAIL STATUS (safe — never exposes password)
app.get('/api/email/status', (req: Request, res: Response) => {
  const status = emailService.getStatus();
  res.json({ success: true, ...status });
});

// 16. VERIFY GMAIL SMTP CONNECTION
app.post('/api/email/verify', async (req: Request, res: Response) => {
  try {
    const result = await emailService.verifyConnection();
    return res.json({ success: result.success, message: result.message });
  } catch (err: any) {
    console.error('[API] /api/email/verify error:', err.message);
    return res.status(500).json({ success: false, message: 'Email notification failed' });
  }
});

// 17. SEND PRICE ALERT EMAIL (backend-triggered)
app.post('/api/email/price-alert', async (req: Request, res: Response) => {
  try {
    const {
      to,
      productName,
      productBrand,
      previousPrice,
      currentPrice,
      targetPrice,
      savings,
      store,
      productUrl,
      imageUrl,
      eventType
    } = req.body;

    if (!to || !productName || currentPrice === undefined || previousPrice === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, productName, previousPrice, currentPrice'
      });
    }

    const validEvents = ['PRICE_DROP', 'TARGET_REACHED', 'NEW_LOW', 'CART_PRICE_DROP', 'CART_TARGET_REACHED'];
    if (eventType && !validEvents.includes(eventType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid eventType. Must be one of: ${validEvents.join(', ')}`
      });
    }

    const result = await emailService.sendPriceAlertEmail({
      to,
      productName,
      productBrand,
      previousPrice,
      currentPrice,
      targetPrice,
      savings: savings ?? Math.max(0, previousPrice - currentPrice),
      store,
      productUrl,
      imageUrl,
      eventType: eventType || 'PRICE_DROP',
    });

    if (result.success) {
      return res.json({ success: true, messageId: result.messageId });
    } else {
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (err: any) {
    console.error('[API] /api/email/price-alert error:', err.message);
    return res.status(500).json({ success: false, error: 'Email notification failed' });
  }
});

// 18. SEND TEST EMAIL (for verification)
app.post('/api/email/test', async (req: Request, res: Response) => {
  try {
    const { to } = req.body;
    if (!to) {
      return res.status(400).json({ success: false, error: 'Recipient email address (to) required.' });
    }

    const result = await emailService.sendTestEmail(to);
    if (result.success) {
      return res.json({ success: true, message: `Test email sent to ${to}`, messageId: result.messageId });
    } else {
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (err: any) {
    console.error('[API] /api/email/test error:', err.message);
    return res.status(500).json({ success: false, error: 'Email notification failed' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`⚡ [Backend] PricePulse API Server running on http://localhost:${PORT}`);
});
