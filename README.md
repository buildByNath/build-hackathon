# ⚡ PricePulse — AI-Powered Personal Shopping & Price Intelligence Platform

An autonomous, AI-driven personal shopping and price tracking platform built for real-time price monitoring, multi-store deal discovery, cart price tracking, and realized financial savings analytics.

---

## 🎯 Key Features

- **Live Amazon Product Extraction (SerpApi)**: Paste any Amazon URL (e.g. `amazon.in/dp/B0...`). The backend verifies the exact ASIN, domain, and fetches live price, high-resolution media, full specifications, and verified ratings.
- **🛒 Tracked Shopping Cart**:
  - Real-time price monitoring of products sitting in the shopping cart across multiple retailers.
  - Detects `PRICE_DROP`, `PRICE_INCREASE`, `TARGET_REACHED`, and `NEW_LOW` events.
  - Cart dashboard showing current cart value, previous baseline, and net cart price fluctuation.
  - Live simulator controls for testing price changes in real-time.
- **💰 Savings Vault (Realized Financial Impact)**:
  - Tracks actual cash saved upon purchasing products below comparison reference baselines (Initial Tracked, Historical Average, Launch Price, Custom Expected).
  - Deterministic mathematical calculations (`Savings = Reference Price − Paid Price`).
  - Strict separation of **Real Verified Savings** vs **Demo / Simulated Savings**.
  - Category and store breakdowns with AI financial impact analysis.
- **✨ Dual-AI Engine (Google Gemini 1.5 Flash + Groq Llama/GPT-OSS)**:
  - **Google Gemini AI**: Executive product summaries, factual pros & cons, "Should I Buy Now?" decision support, and buyer suitability matching.
  - **Groq AI**: Fast shopping query interpretation and deal insights.
- **Factual Deal Score & Analog Deal Meter**: Deterministic 0–100 deal score computed from verified savings, retailer MSRP, and ratings with an analog circular gauge.
- **Multi-Store Comparison & Alternatives**:
  - Compare the exact same item across Amazon, Flipkart, Croma, and Reliance Digital.
  - Dedicated category-filtered alternatives for Smartwatches (Apple Watch, Galaxy Watch, OnePlus Watch), Smartphones, Audio, and Laptops.
- **Multi-Channel Alert System**: Instant notification dispatch for target price hits & price drops (In-App, WhatsApp, Browser).

---

## 🔒 Security Architecture

```
React Frontend (Client)
      ↓ (fetch /api/...)
Express Backend (localhost:3001)
      ↓ (Private Server-Side Environment Variables)
SerpApi • Google Gemini • Groq APIs
```

- **`SERPAPI_KEY`**, **`GOOGLE_GEMINI_API_KEY`**, and **`GROQ_API_KEY` are strictly server-side** and never exposed to the client bundle.
- `.env` is ignored in Git.

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root (copied from `.env.example`):

```env
# SerpApi Key for Real Amazon Product Details & Search API
SERPAPI_KEY=your_serpapi_api_key_here

# Groq API Key for Server-Side AI Intelligence Layer
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

# Google Gemini API Key for Server-Side AI Product Analysis & Intelligence
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Backend API Server Port
PORT=3001
```

---

## 🚀 Running the Project

### Start both Backend & Frontend concurrently:

```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001` (proxied automatically via `/api`)

### Production build validation:

```bash
npm run build
```

---

## 🧪 Verified Test Flows

1. **Paste Real Amazon URL**:
   - `https://www.amazon.in/dp/B0DGHZWBYB` -> Fetches real iPhone 16 data with verified ASIN match, actual price, and image.
   - `https://www.amazon.in/dp/B0DGJ9MOCK` -> Fetches real Apple Watch Series 10.
2. **Cart Price Tracking**:
   - Add items to cart -> view live cart value and price changes -> simulate drops to test alerts.
3. **Savings Vault**:
   - Mark tracked/cart products as purchased -> calculate realized savings against chosen reference price -> verified into Savings Vault.
4. **Google Gemini Product Analysis**:
   - Factual executive summary, pros & cons, and data-grounded Buy/Wait decision support on the History page.
