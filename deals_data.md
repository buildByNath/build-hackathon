# Real-World Deals Data (Amazon & Flipkart)

Below is the JSON array containing deal data mapped across various categories and price tiers.

```json
[
  {
    "id": "deal-elec-001",
    "product": {
      "productId": "MQ2Y3HN/A",
      "asin": "B0BDK6Z25R",
      "title": "Apple iPhone 14 Pro Max (256 GB)",
      "brand": "Apple",
      "modelNumber": "MQ2Y3HN/A",
      "category": "Electronics & Appliances",
      "subcategory": "Smartphones",
      "image": "https://example.com/img1.jpg",
      "url": "https://amazon.in/dp/B0BDK6Z25R"
    },
    "pricing": {
      "currentPrice": 127999,
      "originalPrice": 149900,
      "currency": "INR",
      "discountPercentage": 14.6,
      "savingsAmount": 21901
    },
    "store": { "name": "Amazon", "seller": "Appario Retail" },
    "rating": { "value": 4.7, "reviewCount": 4521 },
    "availability": "In Stock",
    "specifications": {
      "processor": "A16 Bionic",
      "storage": "256GB",
      "display": "6.7 inch Super Retina XDR"
    },
    "description": "Premium flagship smartphone with advanced camera system.",
    "deal": { "type": "price_drop", "dealScore": 9.1 },
    "metadata": { "source": "amazon", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-elec-002",
    "product": {
      "productId": "QN90C",
      "asin": "B0BYXXXXX",
      "title": "Samsung 55-inch Neo QLED 4K Smart TV",
      "brand": "Samsung",
      "modelNumber": "QA55QN90CAKXXL",
      "category": "Electronics & Appliances",
      "subcategory": "Televisions",
      "image": "https://example.com/img2.jpg",
      "url": "https://flipkart.com/samsung-tv/p/itm..."
    },
    "pricing": {
      "currentPrice": 54990,
      "originalPrice": 79990,
      "currency": "INR",
      "discountPercentage": 31.2,
      "savingsAmount": 25000
    },
    "store": { "name": "Flipkart", "seller": "RetailNet" },
    "rating": { "value": 4.5, "reviewCount": 1254 },
    "availability": "In Stock",
    "specifications": {
      "display": "55 inch 4K QLED",
      "refreshRate": "120Hz"
    },
    "description": "Ultra-bright Neo QLED display for stunning 4K visuals.",
    "deal": { "type": "festive_sale", "dealScore": 8.5 },
    "metadata": { "source": "flipkart", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-elec-003",
    "product": {
      "productId": "ECHO-DOT-5",
      "asin": "B09B2XXXX",
      "title": "Echo Dot (5th Gen) Smart Speaker",
      "brand": "Amazon",
      "modelNumber": "C2V2L3",
      "category": "Electronics & Appliances",
      "subcategory": "Smart Home Devices",
      "image": "https://example.com/img3.jpg",
      "url": "https://amazon.in/dp/B09B2XXXX"
    },
    "pricing": {
      "currentPrice": 10500,
      "originalPrice": 15000,
      "currency": "INR",
      "discountPercentage": 30.0,
      "savingsAmount": 4500
    },
    "store": { "name": "Amazon", "seller": "Amazon Devices" },
    "rating": { "value": 4.3, "reviewCount": 15420 },
    "availability": "In Stock",
    "specifications": {
      "assistant": "Alexa",
      "audio": "1.73 inch front-firing speaker"
    },
    "description": "Smart speaker with deeper bass and clear vocals.",
    "deal": { "type": "deal_of_the_day", "dealScore": 7.8 },
    "metadata": { "source": "amazon", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-elec-004",
    "product": {
      "productId": "BOAT-AIRDOPES-141",
      "asin": "B09N3XXXX",
      "title": "boAt Airdopes 141 TWS Earbuds",
      "brand": "boAt",
      "modelNumber": "Airdopes 141",
      "category": "Electronics & Appliances",
      "subcategory": "Audio",
      "image": "https://example.com/img4.jpg",
      "url": "https://flipkart.com/boat-airdopes/p/itm..."
    },
    "pricing": {
      "currentPrice": 1299,
      "originalPrice": 4490,
      "currency": "INR",
      "discountPercentage": 71.0,
      "savingsAmount": 3191
    },
    "store": { "name": "Flipkart", "seller": "Corseca" },
    "rating": { "value": 4.1, "reviewCount": 85000 },
    "availability": "In Stock",
    "specifications": {
      "playbackTime": "42 Hours",
      "waterResistance": "IPX4"
    },
    "description": "Wireless earbuds with massive battery life.",
    "deal": { "type": "lightning_deal", "dealScore": 8.0 },
    "metadata": { "source": "flipkart", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-elec-005",
    "product": {
      "productId": "CABLE-001",
      "asin": "B082XXXX",
      "title": "AmazonBasics USB Type-C to Type-A Cable",
      "brand": "AmazonBasics",
      "modelNumber": "L6L-1M",
      "category": "Electronics & Appliances",
      "subcategory": "Accessories",
      "image": "https://example.com/img5.jpg",
      "url": "https://amazon.in/dp/B082XXXX"
    },
    "pricing": {
      "currentPrice": 199,
      "originalPrice": 499,
      "currency": "INR",
      "discountPercentage": 60.1,
      "savingsAmount": 300
    },
    "store": { "name": "Amazon", "seller": "Cloudtail" },
    "rating": { "value": 4.4, "reviewCount": 12000 },
    "availability": "In Stock",
    "specifications": {
      "length": "3 Feet",
      "speed": "480 Mbps"
    },
    "description": "Durable fast charging cable.",
    "deal": { "type": "discount", "dealScore": 6.5 },
    "metadata": { "source": "amazon", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-home-001",
    "product": {
      "productId": "WAKEFIT-MATTRESS",
      "asin": "B07HXXXX",
      "title": "Wakefit Orthopedic Memory Foam Mattress",
      "brand": "Wakefit",
      "modelNumber": "WM-78x72x6",
      "category": "Home & Kitchen",
      "subcategory": "Furniture",
      "image": "https://example.com/img6.jpg",
      "url": "https://amazon.in/dp/B07HXXXX"
    },
    "pricing": {
      "currentPrice": 52499,
      "originalPrice": 65999,
      "currency": "INR",
      "discountPercentage": 20.4,
      "savingsAmount": 13500
    },
    "store": { "name": "Amazon", "seller": "Wakefit Innovations" },
    "rating": { "value": 4.6, "reviewCount": 42000 },
    "availability": "In Stock",
    "specifications": {
      "size": "King Size",
      "material": "Memory Foam"
    },
    "description": "Ergonomic mattress designed for spine alignment.",
    "deal": { "type": "price_drop", "dealScore": 8.8 },
    "metadata": { "source": "amazon", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-home-002",
    "product": {
      "productId": "BOSCH-DW",
      "asin": "B01NXXXX",
      "title": "Bosch 13 Place Settings Dishwasher",
      "brand": "Bosch",
      "modelNumber": "SMS66GI01I",
      "category": "Home & Kitchen",
      "subcategory": "Kitchen Appliances",
      "image": "https://example.com/img7.jpg",
      "url": "https://flipkart.com/bosch-dw/p/itm..."
    },
    "pricing": {
      "currentPrice": 26990,
      "originalPrice": 35500,
      "currency": "INR",
      "discountPercentage": 23.9,
      "savingsAmount": 8510
    },
    "store": { "name": "Flipkart", "seller": "OmniTech" },
    "rating": { "value": 4.4, "reviewCount": 5400 },
    "availability": "In Stock",
    "specifications": {
      "capacity": "13 Place Settings",
      "noiseLevel": "46 dB"
    },
    "description": "Intensive Kadhai program ideal for Indian kitchens.",
    "deal": { "type": "discount", "dealScore": 7.9 },
    "metadata": { "source": "flipkart", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-home-003",
    "product": {
      "productId": "PHILIPS-AIRFRYER",
      "asin": "B08RXXXX",
      "title": "Philips Essential Air Fryer HD9252/90",
      "brand": "Philips",
      "modelNumber": "HD9252/90",
      "category": "Home & Kitchen",
      "subcategory": "Kitchen Appliances",
      "image": "https://example.com/img8.jpg",
      "url": "https://amazon.in/dp/B08RXXXX"
    },
    "pricing": {
      "currentPrice": 9999,
      "originalPrice": 14995,
      "currency": "INR",
      "discountPercentage": 33.3,
      "savingsAmount": 4996
    },
    "store": { "name": "Amazon", "seller": "Philips Domestic Appliances" },
    "rating": { "value": 4.5, "reviewCount": 11200 },
    "availability": "In Stock",
    "specifications": {
      "capacity": "4.1 Liters",
      "power": "1400W"
    },
    "description": "Healthy cooking with Rapid Air Technology.",
    "deal": { "type": "deal_of_the_day", "dealScore": 8.1 },
    "metadata": { "source": "amazon", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-home-004",
    "product": {
      "productId": "MILTON-THERMOS",
      "asin": "B00HXXXX",
      "title": "Milton Thermosteel Flip Lid Flask",
      "brand": "Milton",
      "modelNumber": "Thermosteel",
      "category": "Home & Kitchen",
      "subcategory": "Kitchenware",
      "image": "https://example.com/img9.jpg",
      "url": "https://flipkart.com/milton-flask/p/itm..."
    },
    "pricing": {
      "currentPrice": 1050,
      "originalPrice": 1450,
      "currency": "INR",
      "discountPercentage": 27.5,
      "savingsAmount": 400
    },
    "store": { "name": "Flipkart", "seller": "RetailNet" },
    "rating": { "value": 4.3, "reviewCount": 24000 },
    "availability": "In Stock",
    "specifications": {
      "capacity": "1000ml",
      "material": "Stainless Steel"
    },
    "description": "Keeps beverages hot or cold for 24 hours.",
    "deal": { "type": "discount", "dealScore": 7.0 },
    "metadata": { "source": "flipkart", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-home-005",
    "product": {
      "productId": "GARDEN-TROWEL",
      "asin": "B07PXXXX",
      "title": "Kraft Seeds Garden Trowel",
      "brand": "Kraft Seeds",
      "modelNumber": "KS-TR-1",
      "category": "Home & Kitchen",
      "subcategory": "Gardening Tools",
      "image": "https://example.com/img10.jpg",
      "url": "https://amazon.in/dp/B07PXXXX"
    },
    "pricing": {
      "currentPrice": 125,
      "originalPrice": 250,
      "currency": "INR",
      "discountPercentage": 50.0,
      "savingsAmount": 125
    },
    "store": { "name": "Amazon", "seller": "Kraft Seeds" },
    "rating": { "value": 4.0, "reviewCount": 3100 },
    "availability": "In Stock",
    "specifications": {
      "material": "Metal with Rubber Handle"
    },
    "description": "Durable trowel for daily gardening needs.",
    "deal": { "type": "clearance", "dealScore": 6.2 },
    "metadata": { "source": "amazon", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-cloth-001",
    "product": {
      "productId": "WATCH-FOSSIL",
      "asin": "B089XXXX",
      "title": "Fossil Gen 6 Smartwatch",
      "brand": "Fossil",
      "modelNumber": "FTW4061",
      "category": "Clothing, Shoes & Jewelry",
      "subcategory": "Fashion Accessories",
      "image": "https://example.com/img11.jpg",
      "url": "https://amazon.in/dp/B089XXXX"
    },
    "pricing": {
      "currentPrice": 24995,
      "originalPrice": 29995,
      "currency": "INR",
      "discountPercentage": 16.6,
      "savingsAmount": 5000
    },
    "store": { "name": "Amazon", "seller": "Fossil India" },
    "rating": { "value": 4.2, "reviewCount": 1500 },
    "availability": "In Stock",
    "specifications": {
      "dialSize": "44mm",
      "os": "Wear OS by Google"
    },
    "description": "Elegant smartwatch with advanced health tracking.",
    "deal": { "type": "price_drop", "dealScore": 7.5 },
    "metadata": { "source": "amazon", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-cloth-002",
    "product": {
      "productId": "NIKE-AIRMAX",
      "asin": "B07KXXXX",
      "title": "Nike Men's Air Max Running Shoes",
      "brand": "Nike",
      "modelNumber": "Air Max 270",
      "category": "Clothing, Shoes & Jewelry",
      "subcategory": "Shoes",
      "image": "https://example.com/img12.jpg",
      "url": "https://flipkart.com/nike-airmax/p/itm..."
    },
    "pricing": {
      "currentPrice": 9500,
      "originalPrice": 12999,
      "currency": "INR",
      "discountPercentage": 26.9,
      "savingsAmount": 3499
    },
    "store": { "name": "Flipkart", "seller": "Nike Authorized" },
    "rating": { "value": 4.5, "reviewCount": 3200 },
    "availability": "In Stock",
    "specifications": {
      "sole": "Rubber",
      "closure": "Lace-up"
    },
    "description": "Comfortable and stylish running sneakers.",
    "deal": { "type": "discount", "dealScore": 8.0 },
    "metadata": { "source": "flipkart", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-cloth-003",
    "product": {
      "productId": "LEVIS-JEANS",
      "asin": "B01MXXXX",
      "title": "Levi's Men's 511 Slim Fit Jeans",
      "brand": "Levi's",
      "modelNumber": "511-SLIM",
      "category": "Clothing, Shoes & Jewelry",
      "subcategory": "Apparel",
      "image": "https://example.com/img13.jpg",
      "url": "https://amazon.in/dp/B01MXXXX"
    },
    "pricing": {
      "currentPrice": 1499,
      "originalPrice": 2999,
      "currency": "INR",
      "discountPercentage": 50.0,
      "savingsAmount": 1500
    },
    "store": { "name": "Amazon", "seller": "Cloudtail India" },
    "rating": { "value": 4.3, "reviewCount": 18000 },
    "availability": "In Stock",
    "specifications": {
      "fit": "Slim",
      "material": "Stretch Denim"
    },
    "description": "Classic slim fit jeans perfect for casual wear.",
    "deal": { "type": "deal_of_the_day", "dealScore": 8.5 },
    "metadata": { "source": "amazon", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-cloth-004",
    "product": {
      "productId": "PUMA-TSHIRT",
      "asin": "B08SXXXX",
      "title": "Puma Men's Graphic T-Shirt",
      "brand": "Puma",
      "modelNumber": "GRAPHIC-01",
      "category": "Clothing, Shoes & Jewelry",
      "subcategory": "Apparel",
      "image": "https://example.com/img14.jpg",
      "url": "https://flipkart.com/puma-tshirt/p/itm..."
    },
    "pricing": {
      "currentPrice": 850,
      "originalPrice": 1499,
      "currency": "INR",
      "discountPercentage": 43.2,
      "savingsAmount": 649
    },
    "store": { "name": "Flipkart", "seller": "RetailNet" },
    "rating": { "value": 4.1, "reviewCount": 5400 },
    "availability": "In Stock",
    "specifications": {
      "neckType": "Round Neck",
      "material": "Cotton"
    },
    "description": "Breathable cotton tee for everyday use.",
    "deal": { "type": "discount", "dealScore": 7.1 },
    "metadata": { "source": "flipkart", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-cloth-005",
    "product": {
      "productId": "SOCKS-COMBO",
      "asin": "B07GXXXX",
      "title": "Jockey Men's Cotton Ankle Socks (Pack of 3)",
      "brand": "Jockey",
      "modelNumber": "SOCKS-A3",
      "category": "Clothing, Shoes & Jewelry",
      "subcategory": "Apparel",
      "image": "https://example.com/img15.jpg",
      "url": "https://amazon.in/dp/B07GXXXX"
    },
    "pricing": {
      "currentPrice": 299,
      "originalPrice": 399,
      "currency": "INR",
      "discountPercentage": 25.0,
      "savingsAmount": 100
    },
    "store": { "name": "Amazon", "seller": "Jockey India" },
    "rating": { "value": 4.5, "reviewCount": 45000 },
    "availability": "In Stock",
    "specifications": {
      "material": "Combed Cotton",
      "type": "Ankle Length"
    },
    "description": "Soft and absorbent everyday socks.",
    "deal": { "type": "discount", "dealScore": 6.8 },
    "metadata": { "source": "amazon", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-beauty-001",
    "product": {
      "productId": "DYSON-AIRWRAP",
      "asin": "B09VXXXX",
      "title": "Dyson Airwrap Multi-Styler",
      "brand": "Dyson",
      "modelNumber": "HS05",
      "category": "Beauty & Personal Care",
      "subcategory": "Hair Care",
      "image": "https://example.com/img16.jpg",
      "url": "https://amazon.in/dp/B09VXXXX"
    },
    "pricing": {
      "currentPrice": 49900,
      "originalPrice": 54900,
      "currency": "INR",
      "discountPercentage": 9.1,
      "savingsAmount": 5000
    },
    "store": { "name": "Amazon", "seller": "Dyson India" },
    "rating": { "value": 4.7, "reviewCount": 850 },
    "availability": "In Stock",
    "specifications": {
      "technology": "Coanda Effect",
      "attachments": "6 Included"
    },
    "description": "Style hair without extreme heat.",
    "deal": { "type": "price_drop", "dealScore": 8.0 },
    "metadata": { "source": "amazon", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-beauty-002",
    "product": {
      "productId": "BRAUN-EPILATOR",
      "asin": "B07PXXXX2",
      "title": "Braun Silk-epil 9 Flex Epilator",
      "brand": "Braun",
      "modelNumber": "9002",
      "category": "Beauty & Personal Care",
      "subcategory": "Grooming",
      "image": "https://example.com/img17.jpg",
      "url": "https://flipkart.com/braun-epilator/p/itm..."
    },
    "pricing": {
      "currentPrice": 9999,
      "originalPrice": 14500,
      "currency": "INR",
      "discountPercentage": 31.0,
      "savingsAmount": 4501
    },
    "store": { "name": "Flipkart", "seller": "RetailNet" },
    "rating": { "value": 4.4, "reviewCount": 2100 },
    "availability": "In Stock",
    "specifications": {
      "head": "Flexible",
      "usage": "Wet & Dry"
    },
    "description": "World's 1st epilator with a fully flexible head.",
    "deal": { "type": "festive_sale", "dealScore": 8.2 },
    "metadata": { "source": "flipkart", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-beauty-003",
    "product": {
      "productId": "MAC-LIPSTICK",
      "asin": "B01DXXXX",
      "title": "M.A.C Retro Matte Lipstick",
      "brand": "M.A.C",
      "modelNumber": "Ruby Woo",
      "category": "Beauty & Personal Care",
      "subcategory": "Cosmetics",
      "image": "https://example.com/img18.jpg",
      "url": "https://amazon.in/dp/B01DXXXX"
    },
    "pricing": {
      "currentPrice": 1250,
      "originalPrice": 2300,
      "currency": "INR",
      "discountPercentage": 45.6,
      "savingsAmount": 1050
    },
    "store": { "name": "Amazon", "seller": "Luxury Beauty" },
    "rating": { "value": 4.6, "reviewCount": 5400 },
    "availability": "In Stock",
    "specifications": {
      "finish": "Matte",
      "shade": "Ruby Woo"
    },
    "description": "Iconic vivid blue-red lipstick.",
    "deal": { "type": "deal_of_the_day", "dealScore": 8.9 },
    "metadata": { "source": "amazon", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-beauty-004",
    "product": {
      "productId": "CETAPHIL-CLEANSER",
      "asin": "B001XXXX",
      "title": "Cetaphil Gentle Skin Cleanser",
      "brand": "Cetaphil",
      "modelNumber": "Gentle-250",
      "category": "Beauty & Personal Care",
      "subcategory": "Skincare",
      "image": "https://example.com/img19.jpg",
      "url": "https://flipkart.com/cetaphil/p/itm..."
    },
    "pricing": {
      "currentPrice": 950,
      "originalPrice": 1150,
      "currency": "INR",
      "discountPercentage": 17.3,
      "savingsAmount": 200
    },
    "store": { "name": "Flipkart", "seller": "SuperComNet" },
    "rating": { "value": 4.5, "reviewCount": 18000 },
    "availability": "In Stock",
    "specifications": {
      "skinType": "All Skin Types",
      "volume": "250ml"
    },
    "description": "Hydrating daily facial cleanser.",
    "deal": { "type": "discount", "dealScore": 7.1 },
    "metadata": { "source": "flipkart", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-beauty-005",
    "product": {
      "productId": "NIVEA-LIPBALM",
      "asin": "B008XXXX",
      "title": "NIVEA Lip Balm, Original Care",
      "brand": "NIVEA",
      "modelNumber": "Original Care",
      "category": "Beauty & Personal Care",
      "subcategory": "Skincare",
      "image": "https://example.com/img20.jpg",
      "url": "https://amazon.in/dp/B008XXXX"
    },
    "pricing": {
      "currentPrice": 110,
      "originalPrice": 150,
      "currency": "INR",
      "discountPercentage": 26.6,
      "savingsAmount": 40
    },
    "store": { "name": "Amazon", "seller": "Cloudtail India" },
    "rating": { "value": 4.3, "reviewCount": 35000 },
    "availability": "In Stock",
    "specifications": {
      "benefits": "24H Melt in Moisture"
    },
    "description": "Long lasting moisturizing lip care.",
    "deal": { "type": "discount", "dealScore": 6.5 },
    "metadata": { "source": "amazon", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-books-001",
    "product": {
      "productId": "PS5-CONSOLE",
      "asin": "B08FXXXX",
      "title": "Sony PlayStation 5 Console",
      "brand": "Sony",
      "modelNumber": "CFI-1208A01R",
      "category": "Books & Entertainment",
      "subcategory": "Video Games",
      "image": "https://example.com/img21.jpg",
      "url": "https://amazon.in/dp/B08FXXXX"
    },
    "pricing": {
      "currentPrice": 44990,
      "originalPrice": 54990,
      "currency": "INR",
      "discountPercentage": 18.1,
      "savingsAmount": 10000
    },
    "store": { "name": "Amazon", "seller": "Electronics Bazaar" },
    "rating": { "value": 4.8, "reviewCount": 12500 },
    "availability": "In Stock",
    "specifications": {
      "storage": "825GB SSD",
      "resolution": "4K at 120Hz"
    },
    "description": "Next-gen gaming with lightning fast loading.",
    "deal": { "type": "price_drop", "dealScore": 9.5 },
    "metadata": { "source": "amazon", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-books-002",
    "product": {
      "productId": "KINDLE-PAPERWHITE",
      "asin": "B08NXXXX",
      "title": "Kindle Paperwhite (16 GB)",
      "brand": "Amazon",
      "modelNumber": "M2L3EK",
      "category": "Books & Entertainment",
      "subcategory": "Kindle E-books",
      "image": "https://example.com/img22.jpg",
      "url": "https://amazon.in/dp/B08NXXXX"
    },
    "pricing": {
      "currentPrice": 11999,
      "originalPrice": 14999,
      "currency": "INR",
      "discountPercentage": 20.0,
      "savingsAmount": 3000
    },
    "store": { "name": "Amazon", "seller": "Amazon Devices" },
    "rating": { "value": 4.6, "reviewCount": 22000 },
    "availability": "In Stock",
    "specifications": {
      "display": "6.8 inch glare-free",
      "storage": "16GB"
    },
    "description": "Waterproof e-reader with adjustable warm light.",
    "deal": { "type": "deal_of_the_day", "dealScore": 8.7 },
    "metadata": { "source": "amazon", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-books-003",
    "product": {
      "productId": "BOOK-ATOMIC",
      "asin": "B07HXXXX3",
      "title": "Atomic Habits by James Clear",
      "brand": "Penguin",
      "modelNumber": "ISBN-13",
      "category": "Books & Entertainment",
      "subcategory": "Physical Books",
      "image": "https://example.com/img23.jpg",
      "url": "https://flipkart.com/atomic-habits/p/itm..."
    },
    "pricing": {
      "currentPrice": 1150,
      "originalPrice": 1500,
      "currency": "INR",
      "discountPercentage": 23.3,
      "savingsAmount": 350
    },
    "store": { "name": "Flipkart", "seller": "TrueComRetail" },
    "rating": { "value": 4.7, "reviewCount": 85000 },
    "availability": "In Stock",
    "specifications": {
      "format": "Hardcover",
      "pages": "320"
    },
    "description": "An easy and proven way to build good habits.",
    "deal": { "type": "discount", "dealScore": 7.5 },
    "metadata": { "source": "flipkart", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-books-004",
    "product": {
      "productId": "BOOK-PSYCH",
      "asin": "B089XXXX4",
      "title": "The Psychology of Money",
      "brand": "Jaico",
      "modelNumber": "ISBN-13",
      "category": "Books & Entertainment",
      "subcategory": "Physical Books",
      "image": "https://example.com/img24.jpg",
      "url": "https://amazon.in/dp/B089XXXX4"
    },
    "pricing": {
      "currentPrice": 950,
      "originalPrice": 1250,
      "currency": "INR",
      "discountPercentage": 24.0,
      "savingsAmount": 300
    },
    "store": { "name": "Amazon", "seller": "Cocoblu Retail" },
    "rating": { "value": 4.6, "reviewCount": 65000 },
    "availability": "In Stock",
    "specifications": {
      "format": "Paperback",
      "pages": "252"
    },
    "description": "Timeless lessons on wealth, greed, and happiness.",
    "deal": { "type": "discount", "dealScore": 7.2 },
    "metadata": { "source": "amazon", "fetchedAt": "2026-09-26T10:00:00Z" }
  },
  {
    "id": "deal-books-005",
    "product": {
      "productId": "UNO-CARDS",
      "asin": "B000XXXX5",
      "title": "Mattel UNO Playing Card Game",
      "brand": "Mattel",
      "modelNumber": "W2087",
      "category": "Books & Entertainment",
      "subcategory": "Games",
      "image": "https://example.com/img25.jpg",
      "url": "https://flipkart.com/uno-cards/p/itm..."
    },
    "pricing": {
      "currentPrice": 120,
      "originalPrice": 199,
      "currency": "INR",
      "discountPercentage": 39.6,
      "savingsAmount": 79
    },
    "store": { "name": "Flipkart", "seller": "ToyWorld" },
    "rating": { "value": 4.5, "reviewCount": 42000 },
    "availability": "In Stock",
    "specifications": {
      "players": "2-10",
      "age": "7+ Years"
    },
    "description": "Classic color and number matching card game.",
    "deal": { "type": "discount", "dealScore": 6.8 },
    "metadata": { "source": "flipkart", "fetchedAt": "2026-09-26T10:00:00Z" }
  }
]