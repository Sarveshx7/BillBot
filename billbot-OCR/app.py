import os
import re
import tempfile
from pathlib import Path
from datetime import datetime

# Disable oneDNN / MKLDNN on CPU
os.environ["PADDLE_PDX_ENABLE_MKLDNN_BYDEFAULT"] = "0"
os.environ["FLAGS_use_mkldnn"] = "0"

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from paddleocr import PaddleOCR

app = FastAPI(
    title="BillBot OCR Service",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

ocr = PaddleOCR(
    lang="en",
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False
)

@app.get("/health")
def health():
    return {
        "status": "UP",
        "service": "BillBot OCR"
    }

# =========================================================
# CATEGORY DETECTION
# =========================================================
def detect_category(text):
    text = text.lower()

    if any(w in text for w in ["dmart", "d-mart", "avenue supermarts", "grocery", "groceries", "supermarket", "mart", "spencer", "blinkit", "zepto", "instamart", "bigbasket", "jiomart", "reliance fresh", "smart bazaar", "milk", "vegetable", "fruits", "bread"]):
        return "GROCERIES"

    if any(w in text for w in ["food", "restaurant", "cafe", "coffee", "tea", "swiggy", "zomato", "pizza", "burger", "mcdonald", "kfc", "domino", "starbucks", "bakery", "dhaba", "kitchen", "biryani"]):
        return "FOOD"

    if any(w in text for w in ["uber", "ola", "rapido", "taxi", "cab", "petrol", "fuel", "diesel", "hpcl", "bpcl", "indian oil", "metro", "bus", "train", "parking", "toll", "fastag"]):
        return "TRANSPORT"

    if any(w in text for w in ["amazon", "flipkart", "myntra", "zara", "h&m", "shopping", "mall", "clothing", "fashion", "shoes", "electronics", "croma", "vijay sales", "trends", "pantaloons"]):
        return "SHOPPING"

    if any(w in text for w in ["electricity", "tata power", "bses", "bescom", "mahavitaran", "torrent", "adani electricity", "power discom", "electric"]):
        return "ELECTRICITY"

    if any(w in text for w in ["airtel", "jio", "vodafone", "vi", "broadband", "act fibernet", "hathway", "wifi", "internet", "bsnl"]):
        return "INTERNET"

    if any(w in text for w in ["cinema", "movie", "pvr", "inox", "cinepolis", "netflix", "spotify", "game", "bookmyshow", "hotstar"]):
        return "ENTERTAINMENT"

    if any(w in text for w in ["hospital", "pharmacy", "apollo", "medplus", "1mg", "pharmeasy", "doctor", "clinic", "health", "gym", "fitness", "medicine", "tablets"]):
        return "HEALTH"

    if any(w in text for w in ["water bill", "water board", "gas bill", "indane", "hp gas", "bharat gas", "piped gas", "igl"]):
        return "BILLS"

    if any(w in text for w in ["rent", "maintenance", "society", "deposit"]):
        return "RENT"

    return "OTHER"

# =========================================================
# PAYMENT METHOD DETECTION
# =========================================================
def detect_payment_method(text):
    text = text.lower()

    if any(w in text for w in ["upi", "gpay", "google pay", "phonepe", "paytm", "bhim", "qr code", "scan and pay"]):
        return "UPI"

    if any(w in text for w in ["credit card", "credit", "visa", "mastercard", "amex", "rupay card"]):
        return "CREDIT_CARD"

    if any(w in text for w in ["debit card", "debit", "pos", "card swipe", "card payment"]):
        return "DEBIT_CARD"

    if any(w in text for w in ["cash", "tendered cash", "change given", "cashier"]):
        return "CASH"

    if any(w in text for w in ["net banking", "neft", "rtgs", "imps", "bank transfer"]):
        return "NET_BANKING"

    return "UPI"

# =========================================================
# DATE EXTRACTION
# =========================================================
def extract_date(lines):
    date_patterns = [
        r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b",
        r"\b(\d{4}[/-]\d{1,2}[/-]\d{1,2})\b",
        r"\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b"
    ]

    for line in lines:
        for pattern in date_patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if not match:
                continue

            value = match.group(1)
            formats = [
                "%d/%m/%Y", "%d-%m-%Y", "%d/%m/%y", "%d-%m-%y",
                "%Y/%m/%d", "%Y-%m-%d", "%d %b %Y", "%d %B %Y",
                "%d %b %y", "%d %B %y"
            ]

            for fmt in formats:
                try:
                    parsed = datetime.strptime(value, fmt)
                    return parsed.strftime("%Y-%m-%d")
                except ValueError:
                    pass

    return datetime.now().strftime("%Y-%m-%d")

# =========================================================
# AMOUNT EXTRACTION
# =========================================================
def extract_amount(lines):
    # Regex matches: 1,450.00 | 450.50 | 1250 | 450/- | Rs. 450 | ₹ 1,200
    amount_pattern = re.compile(
        r"(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)\s*(?:\/-)?",
        re.IGNORECASE
    )

    priority_keywords = [
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
        "total"
    ]

    # Step 1: Scan for lines with priority total keywords
    for index, line in enumerate(lines):
        lower = line.lower().strip()
        if not any(k in lower for k in priority_keywords):
            continue

        # Check this line and next 2 lines
        for cand_line in [line] + lines[index + 1 : index + 3]:
            matches = amount_pattern.findall(cand_line)
            for m in matches:
                if not m:
                    continue
                try:
                    num_str = m.replace(",", "")
                    val = float(num_str)
                    if 0 < val < 500000 and val not in [2024, 2025, 2026]:
                        return val
                except ValueError:
                    pass

    # Step 2: Collect all reasonable amounts found on receipt
    all_amounts = []
    for line in lines:
        if re.search(r"phone|mob|tel|pin|gst|date|time|gstin|inv|order", line, re.IGNORECASE):
            continue
        matches = amount_pattern.findall(line)
        for m in matches:
            if not m:
                continue
            try:
                num_str = m.replace(",", "")
                v = float(num_str)
                if 0 < v < 200000 and v not in [2024, 2025, 2026]:
                    all_amounts.append(v)
            except ValueError:
                pass

    if all_amounts:
        return max(all_amounts)

    return 0.0

# =========================================================
# MERCHANT EXTRACTION
# =========================================================
def extract_merchant(lines):
    full_text = " ".join(lines).lower()

    # Known Indian retail / grocery / food / utility brands
    known_brands = [
        ("dmart", "DMart (Avenue Supermarts)"),
        ("d-mart", "DMart"),
        ("avenue supermarts", "DMart"),
        ("reliance fresh", "Reliance Fresh"),
        ("smart bazaar", "Smart Bazaar"),
        ("swiggy", "Swiggy"),
        ("zomato", "Zomato"),
        ("mcdonald", "McDonald's"),
        ("kfc", "KFC"),
        ("domino", "Domino's Pizza"),
        ("starbucks", "Starbucks"),
        ("blinkit", "Blinkit"),
        ("zepto", "Zepto"),
        ("bigbasket", "BigBasket"),
        ("instamart", "Swiggy Instamart"),
        ("amazon", "Amazon"),
        ("flipkart", "Flipkart"),
        ("uber", "Uber"),
        ("ola", "Ola Cabs"),
        ("tata power", "Tata Power"),
        ("bses", "BSES Electricity"),
        ("adani electricity", "Adani Electricity"),
        ("airtel", "Airtel"),
        ("jio", "Jio"),
        ("pvr", "PVR Cinemas"),
        ("inox", "INOX"),
        ("apollo pharmacy", "Apollo Pharmacy"),
        ("medplus", "MedPlus Pharmacy")
    ]

    for keyword, brand_name in known_brands:
        if keyword in full_text:
            return brand_name

    ignored_words = [
        "bill", "invoice", "receipt", "date", "time", "cashier", "phone",
        "gst", "gstin", "item", "description", "qty", "rate", "amount",
        "total", "grand total", "store no", "pos no", "tax invoice", "welcome",
        "customer copy", "retail invoice"
    ]

    for line in lines[:8]:
        clean = line.strip()
        if not clean:
            continue
        lower = clean.lower()
        if any(w in lower for w in ignored_words):
            continue
        if re.fullmatch(r"[\d\s:/.,-]+", clean):
            continue
        if len(clean) >= 3:
            return clean

    return "Retail Store / Merchant"

# =========================================================
# RECEIPT PARSER
# =========================================================
def parse_receipt(lines):
    full_text = "\n".join(lines)
    merchant = extract_merchant(lines)
    amount = extract_amount(lines)
    expense_date = extract_date(lines)
    payment_method = detect_payment_method(full_text)
    category = detect_category(full_text)

    return {
        "merchant": merchant,
        "amount": amount,
        "currency": "INR",
        "expenseDate": expense_date,
        "category": category,
        "paymentMethod": payment_method,
        "source": "OCR",
        "rawLines": lines[:20]
    }

# =========================================================
# OCR ENDPOINT
# =========================================================
@app.post("/ocr")
async def extract_text(file: UploadFile = File(...)):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    suffix = ".jpg"
    if file.filename:
        ext = Path(file.filename).suffix.lower()
        if ext in [".jpg", ".jpeg", ".png", ".webp"]:
            suffix = ext

    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name

        # Run PaddleOCR
        result = ocr.ocr(temp_path)
        extracted_lines = []

        if result:
            # Handle varied PaddleOCR output structure
            for page in result:
                if not page:
                    continue
                # If page is list of [box, (text, conf)]
                if isinstance(page, list):
                    for item in page:
                        if isinstance(item, (list, tuple)) and len(item) == 2:
                            text_tuple = item[1]
                            if isinstance(text_tuple, (list, tuple)) and len(text_tuple) >= 1:
                                txt = str(text_tuple[0]).strip()
                                if txt:
                                    extracted_lines.append(txt)
                elif hasattr(page, "get"):
                    txt = page.get("rec_texts", [])
                    extracted_lines.extend([t.strip() for t in txt if str(t).strip()])

        # Parse extracted lines
        parsed_data = parse_receipt(extracted_lines)

        return {
            "success": True,
            "data": parsed_data,
            "expense": parsed_data,
            "lines": extracted_lines
        }

    except Exception as e:
        print(f"OCR Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass