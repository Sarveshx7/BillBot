import { createWorker } from "tesseract.js";

export interface ParsedReceiptData {
  merchant: string;
  amount: number;
  category: string;
  expenseDate: string;
  paymentMethod: string;
  rawLines: string[];
}

/**
 * Pre-processes an image file via HTML5 Canvas (Greyscale + High Contrast)
 * to maximize OCR character accuracy on mobile phone photos and receipts.
 */
export const preProcessReceiptImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Limit maximum dimension for speed while preserving sharpness
        const maxDim = 1800;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Get image data and apply high-contrast binarization
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const contrast = 1.35; // Contrast boost
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        for (let i = 0; i < data.length; i += 4) {
          // Greyscale intensity (luminance formula)
          const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const adjusted = Math.min(255, Math.max(0, factor * (avg - 128) + 128));
          data[i] = adjusted;
          data[i + 1] = adjusted;
          data[i + 2] = adjusted;
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Intelligent In-Browser Receipt Parser Engine
 */
export const parseReceiptText = (rawText: string): ParsedReceiptData => {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const fullText = rawText.toLowerCase();

  // 1. Detect Category
  let category = "OTHER";
  if (/(dmart|d-mart|grocery|groceries|supermarket|mart|spencer|blinkit|zepto|instamart|bigbasket|jiomart|reliance fresh|smart bazaar|milk|vegetable|fruits|bread|bazaar|provisions|super market)/i.test(fullText)) {
    category = "GROCERIES";
  } else if (/(food|restaurant|cafe|coffee|tea|swiggy|zomato|pizza|burger|mcdonald|kfc|domino|starbucks|bakery|dhaba|kitchen|biryani|sweets|bites|dining|barbeque|bistro)/i.test(fullText)) {
    category = "FOOD";
  } else if (/(uber|ola|rapido|taxi|cab|petrol|fuel|diesel|hpcl|bpcl|indian oil|metro|bus|train|parking|toll|fastag|auto fare)/i.test(fullText)) {
    category = "TRANSPORT";
  } else if (/(amazon|flipkart|myntra|zara|h&m|shopping|mall|clothing|fashion|shoes|electronics|croma|vijay sales|trends|pantaloons|apparel|footwear)/i.test(fullText)) {
    category = "SHOPPING";
  } else if (/(electricity|tata power|bses|bescom|mahavitaran|torrent|adani electricity|power discom|electric)/i.test(fullText)) {
    category = "ELECTRICITY";
  } else if (/(airtel|jio|vodafone|vi|broadband|act fibernet|hathway|wifi|internet|bsnl|telecom)/i.test(fullText)) {
    category = "INTERNET";
  } else if (/(cinema|movie|pvr|inox|cinepolis|netflix|spotify|game|bookmyshow|hotstar|theatre|ticket)/i.test(fullText)) {
    category = "ENTERTAINMENT";
  } else if (/(hospital|pharmacy|apollo|medplus|1mg|pharmeasy|doctor|clinic|health|gym|fitness|medicine|tablets|diagnostics|lab)/i.test(fullText)) {
    category = "HEALTH";
  } else if (/(water bill|water board|gas bill|indane|hp gas|bharat gas|piped gas|igl|cylinder)/i.test(fullText)) {
    category = "BILLS";
  } else if (/(rent|maintenance|society|deposit|flat rent)/i.test(fullText)) {
    category = "RENT";
  }

  // 2. Detect Payment Method
  let paymentMethod = "UPI";
  if (/(credit card|visa|mastercard|amex|rupay card|credit)/i.test(fullText)) {
    paymentMethod = "CREDIT_CARD";
  } else if (/(debit card|debit|pos|card swipe|card payment)/i.test(fullText)) {
    paymentMethod = "DEBIT_CARD";
  } else if (/(cash|tendered cash|change given|cashier)/i.test(fullText)) {
    paymentMethod = "CASH";
  } else if (/(net banking|neft|rtgs|imps|bank transfer)/i.test(fullText)) {
    paymentMethod = "NET_BANKING";
  }

  // 3. Extract Date
  let expenseDate = new Date().toISOString().slice(0, 10);
  const datePatterns = [
    /\b(\d{1,2})[/\.-](\d{1,2})[/\.-](\d{2,4})\b/,
    /\b(\d{4})[/\.-](\d{1,2})[/\.-](\d{1,2})\b/,
    /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{2,4})\b/i,
  ];

  for (const line of lines) {
    let matched = false;
    for (const pat of datePatterns) {
      const match = line.match(pat);
      if (match) {
        try {
          const parsed = new Date(match[0]);
          if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 2020 && parsed.getFullYear() <= 2030) {
            expenseDate = parsed.toISOString().slice(0, 10);
            matched = true;
            break;
          }
        } catch {
          // ignore
        }
      }
    }
    if (matched) break;
  }

  // 4. Extract Amount (Handles integer totals, decimal totals, and currency prefixes)
  let amount = 0;

  // Regex matches: 1,450.00 | 450.50 | 1250 | 450/- | Rs. 450 | ₹ 1,200
  const currencyAmountRegex = /(?:₹|rs\.?|inr)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)\s*(?:\/-)?/gi;

  const totalKeywords = [
    "grand total",
    "net payable",
    "total payable",
    "amount payable",
    "total amount",
    "bill amount",
    "net amount",
    "invoice total",
    "total bill",
    "amount paid",
    "total ₹",
    "total rs",
    "balance due",
    "total",
  ];

  // Scan specifically for lines with high priority Total keywords
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    const hasTotalKeyword = totalKeywords.some((k) => lineLower.includes(k));

    if (hasTotalKeyword) {
      // Check current line and next line
      const candidateLines = [lines[i], lines[i + 1] || ""];
      for (const cand of candidateLines) {
        const matches = [...cand.matchAll(/(?:₹|rs\.?|inr)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gi)];
        for (const m of matches) {
          const numStr = m[1].replace(/,/g, "");
          const num = parseFloat(numStr);
          // Filter out dates (e.g. 2026) or phone numbers (> 500,000)
          if (!isNaN(num) && num > 0 && num < 500000 && num !== 2024 && num !== 2025 && num !== 2026) {
            amount = num;
            break;
          }
        }
        if (amount > 0) break;
      }
      if (amount > 0) break;
    }
  }

  // Fallback: If no Total line was identified, find the maximum reasonable monetary amount
  if (amount === 0) {
    const allAmounts: number[] = [];
    for (const line of lines) {
      // Exclude phone number lines, pincodes, dates
      if (/phone|mob|tel|pin|gst|date|time|gstin|inv|order/i.test(line)) continue;

      const matches = [...line.matchAll(/(?:₹|rs\.?|inr)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gi)];
      for (const m of matches) {
        const numStr = m[1].replace(/,/g, "");
        const num = parseFloat(numStr);
        if (!isNaN(num) && num > 0 && num < 200000 && num !== 2024 && num !== 2025 && num !== 2026) {
          allAmounts.push(num);
        }
      }
    }

    if (allAmounts.length > 0) {
      amount = Math.max(...allAmounts);
    }
  }

  // 5. Extract Merchant / Store Name
  let merchant = "Store / Merchant";
  const knownBrands: [RegExp, string][] = [
    [/dmart|avenue supermarts/i, "DMart"],
    [/reliance fresh|smart bazaar|reliance/i, "Reliance Fresh"],
    [/swiggy/i, "Swiggy"],
    [/zomato/i, "Zomato"],
    [/mcdonald/i, "McDonald's"],
    [/kfc/i, "KFC"],
    [/domino/i, "Domino's Pizza"],
    [/starbucks/i, "Starbucks"],
    [/blinkit/i, "Blinkit"],
    [/zepto/i, "Zepto"],
    [/bigbasket/i, "BigBasket"],
    [/instamart/i, "Swiggy Instamart"],
    [/amazon/i, "Amazon"],
    [/flipkart/i, "Flipkart"],
    [/uber/i, "Uber"],
    [/ola/i, "Ola"],
    [/tata power/i, "Tata Power"],
    [/bses/i, "BSES Electricity"],
    [/airtel/i, "Airtel"],
    [/jio/i, "Jio"],
    [/pvr/i, "PVR Cinemas"],
    [/inox/i, "INOX"],
    [/apollo pharmacy/i, "Apollo Pharmacy"],
    [/medplus/i, "MedPlus"],
    [/chai point/i, "Chai Point"],
    [/burger king/i, "Burger King"],
    [/subway/i, "Subway"],
    [/haldiram/i, "Haldiram's"],
  ];

  for (const [brandRegex, brandName] of knownBrands) {
    if (brandRegex.test(fullText)) {
      merchant = brandName;
      break;
    }
  }

  // If no known brand, pick the cleanest business header line (lines 1 to 5)
  if (merchant === "Store / Merchant") {
    const ignoredKeywords = /bill|invoice|receipt|date|time|cashier|phone|gst|gstin|item|description|qty|rate|amount|total|tax invoice|welcome|customer copy|retail invoice|order no|token no/i;
    for (const line of lines.slice(0, 6)) {
      const clean = line.replace(/[^a-zA-Z0-9\s&'-]/g, "").trim();
      if (clean.length >= 3 && clean.length <= 45 && !ignoredKeywords.test(clean)) {
        merchant = clean;
        break;
      }
    }
  }

  return {
    merchant,
    amount: amount > 0 ? amount : 0,
    category,
    expenseDate,
    paymentMethod,
    rawLines: lines,
  };
};

/**
 * Executes high-precision In-Browser OCR using Tesseract.js WebAssembly worker
 */
export const runInBrowserOCR = async (file: File, onProgress?: (progress: number) => void): Promise<ParsedReceiptData> => {
  // 1. Pre-process image on Canvas for crisp receipt contrast
  const processedDataUrl = await preProcessReceiptImage(file);

  // 2. Initialize Tesseract worker
  const worker = await createWorker("eng");
  
  try {
    const ret = await worker.recognize(processedDataUrl);
    const text = ret.data.text;
    await worker.terminate();

    return parseReceiptText(text);
  } catch (err) {
    await worker.terminate();
    throw err;
  }
};