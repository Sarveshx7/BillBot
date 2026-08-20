import React, { useState, useEffect } from "react";
import {
  X,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Building,
  CreditCard,
  ArrowRight,
  Sparkles,
  Lock,
  KeyRound,
  AlertCircle,
  Check,
} from "lucide-react";
import { billDueService } from "../../services/billDueService";
import { subscriptionService } from "../../services/subscriptionService";

interface AutoPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: {
    type: "BILL" | "SUBSCRIPTION";
    id: string;
    name: string;
    amount: number;
    currency: string;
    dueDate?: string;
    billingCycle?: string;
    category?: string;
  } | null;
  onSuccess: () => void;
}

const POPULAR_UPI_APPS = [
  { id: "gpay", name: "Google Pay", handle: "okhdfcbank", logoColor: "text-blue-500" },
  { id: "phonepe", name: "PhonePe", handle: "ybl", logoColor: "text-purple-600" },
  { id: "paytm", name: "Paytm", handle: "paytm", logoColor: "text-sky-500" },
  { id: "cred", name: "CRED", handle: "cred", logoColor: "text-slate-900" },
  { id: "bhim", name: "BHIM UPI", handle: "upi", logoColor: "text-emerald-600" },
];

const POPULAR_BANKS = [
  { id: "hdfc", name: "HDFC Bank", last4: "4829" },
  { id: "icici", name: "ICICI Bank", last4: "9102" },
  { id: "sbi", name: "State Bank of India", last4: "3310" },
  { id: "axis", name: "Axis Bank", last4: "6504" },
  { id: "kotak", name: "Kotak Mahindra Bank", last4: "7821" },
];

export const AutoPayModal: React.FC<AutoPayModalProps> = ({
  isOpen,
  onClose,
  target,
  onSuccess,
}) => {
  const [method, setMethod] = useState<"UPI" | "NETBANKING">("UPI");
  const [selectedApp, setSelectedApp] = useState("gpay");
  const [upiId, setUpiId] = useState(() => localStorage.getItem("billbot_primary_upi_id") || "user@okhdfcbank");
  const [selectedBank, setSelectedBank] = useState("hdfc");
  const [maxLimit, setMaxLimit] = useState(
    target ? Math.ceil(target.amount * 1.5).toString() : "5000"
  );
  const [step, setStep] = useState<"CONFIG" | "PIN_AUTH" | "SUCCESS">("CONFIG");
  const [upiPin, setUpiPin] = useState("");
  const [mandateUmn, setMandateUmn] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (isOpen) {
      const savedUpi = localStorage.getItem("billbot_primary_upi_id");
      if (savedUpi) setUpiId(savedUpi);
      setStep("CONFIG");
      setUpiPin("");
      setValidationError("");
    }
  }, [isOpen]);

  if (!isOpen || !target) return null;

  const curr = target.currency === "INR" ? "₹" : target.currency || "₹";
  const bankObj = POPULAR_BANKS.find((b) => b.id === selectedBank) || POPULAR_BANKS[0];

  const handleProceedToPinAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (method === "UPI") {
      if (!upiId.trim() || !upiId.includes("@")) {
        setValidationError("Please enter a valid UPI ID (e.g. yourname@okhdfcbank or 9876543210@ybl)");
        return;
      }
    }

    const limitNum = parseFloat(maxLimit);
    if (isNaN(limitNum) || limitNum < target.amount) {
      setValidationError(`Maximum Auto-Debit Limit cannot be less than the current bill amount (${curr}${target.amount})`);
      return;
    }

    // Save UPI to localStorage for future convenience
    if (method === "UPI") {
      localStorage.setItem("billbot_primary_upi_id", upiId.trim());
    }

    const randomUmn = `NPCI/2026/MND-${Math.floor(100000 + Math.random() * 900000)}`;
    setMandateUmn(randomUmn);
    setStep("PIN_AUTH");
  };

  const handleNumpadPress = (digit: string) => {
    if (digit === "BACKSPACE") {
      setUpiPin((prev) => prev.slice(0, -1));
    } else if (digit === "CLEAR") {
      setUpiPin("");
    } else if (upiPin.length < 6) {
      setUpiPin((prev) => prev + digit);
    }
  };

  const handleAuthorizeMandate = async () => {
    if (upiPin.length < 4) {
      setValidationError("Please enter your 4 or 6 digit UPI PIN to authorize the mandate.");
      return;
    }

    try {
      setLoading(true);
      setValidationError("");

      // Simulated network handshake with NPCI e-Mandate gateway
      await new Promise((r) => setTimeout(r, 900));

      const mandateNote = `⚡ UPI AutoPay Active: ${method === "UPI" ? upiId.trim() : bankObj.name} (Max Cap: ${curr}${maxLimit}/mo) | UMN: ${mandateUmn}`;

      if (target.type === "BILL") {
        await billDueService.update(target.id, {
          autoPay: true,
          notes: mandateNote,
        });
      } else {
        await subscriptionService.update(target.id, {
          autoDebit: true,
          notes: mandateNote,
        });
      }

      setStep("SUCCESS");
      setTimeout(() => {
        onSuccess();
        onClose();
        setStep("CONFIG");
      }, 2200);
    } catch (err) {
      setValidationError("Failed to authorize mandate. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[2.2rem] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden text-slate-900">
        {/* Top Radiant Shimmer Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-600" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <Zap size={22} className="fill-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">Setup UPI AutoPay</h3>
              <p className="text-xs text-slate-500">Zero late fees & automatic recurring bank debit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Bill / Subscription Target Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between mb-5">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              {target.type === "BILL" ? "Bill Due" : "Subscription"}
            </span>
            <h4 className="text-sm font-extrabold text-slate-900">{target.name}</h4>
            <p className="text-xs text-slate-500">
              {target.dueDate ? `Due: ${target.dueDate}` : `Renews: ${target.billingCycle}`}
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-slate-900 block">
              {curr}{target.amount.toFixed(2)}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Auto-Settlement
            </span>
          </div>
        </div>

        {validationError && (
          <div className="p-3.5 mb-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* ================= STEP 1: CONFIGURATION & UPI ID ================= */}
        {step === "CONFIG" && (
          <form onSubmit={handleProceedToPinAuth} className="space-y-5">
            {/* AutoPay Rail Selector */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-600 mb-2">
                1. Select AutoPay Rail
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setMethod("UPI")}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    method === "UPI"
                      ? "border-emerald-600 bg-emerald-50/80 text-emerald-950 font-black shadow-xs"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
                  }`}
                >
                  <Smartphone size={18} className="mx-auto mb-1 text-emerald-600" />
                  <span className="text-xs block">UPI AutoPay (GPay, PhonePe, Paytm)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("NETBANKING")}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    method === "NETBANKING"
                      ? "border-emerald-600 bg-emerald-50/80 text-emerald-950 font-black shadow-xs"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
                  }`}
                >
                  <Building size={18} className="mx-auto mb-1 text-indigo-600" />
                  <span className="text-xs block">e-NACH Netbanking Mandate</span>
                </button>
              </div>
            </div>

            {/* UPI ID Input & Presets */}
            {method === "UPI" && (
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase text-slate-600">
                  2. Choose App or Enter UPI ID / VPA <span className="text-rose-500">*</span>
                </label>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {POPULAR_UPI_APPS.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => {
                        setSelectedApp(app.id);
                        const baseUsername = upiId.split("@")[0] || "user";
                        setUpiId(`${baseUsername}@${app.handle}`);
                      }}
                      className={`p-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        selectedApp === app.id
                          ? "border-slate-950 bg-slate-900 text-white shadow-sm"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span>{app.name}</span>
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. mobile@okhdfcbank or yourname@ybl"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Mandate request will be authorized directly through this UPI VPA.
                </p>
              </div>
            )}

            {/* Netbanking Bank Selector */}
            {method === "NETBANKING" && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Select Primary Debit Bank
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  {POPULAR_BANKS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (A/c •••• {b.last4})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Mandate Limit Cap */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Max Auto-Debit Cap ({curr}) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-emerald-600 font-bold">NPCI Safety Limit</span>
              </div>
              <input
                type="number"
                required
                value={maxLimit}
                onChange={(e) => setMaxLimit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-black text-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Your bank will strictly block any debit exceeding {curr}{maxLimit} for {target.name}.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Authorize UPI Mandate with PIN</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* ================= STEP 2: INTERACTIVE UPI PIN SCREEN ================= */}
        {step === "PIN_AUTH" && (
          <div className="space-y-5">
            {/* NPCI Security Banner */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck size={16} />
                  NPCI e-Mandate Gateway
                </span>
                <span className="font-mono text-[10px] text-slate-400">{mandateUmn}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Biller / Merchant</span>
                  <strong className="text-white font-bold">{target.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Debit VPA / Bank</span>
                  <strong className="text-indigo-300 font-bold truncate block">
                    {method === "UPI" ? upiId : `${bankObj.name} (•••• ${bankObj.last4})`}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Max Limit</span>
                  <strong className="text-emerald-400 font-black">{curr}{maxLimit} / cycle</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Frequency</span>
                  <strong className="text-white font-bold">On Due Date</strong>
                </div>
              </div>
            </div>

            {/* Interactive UPI PIN Input & Dots */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs font-black uppercase text-slate-700">
                <KeyRound size={15} className="text-emerald-600" />
                <span>Enter 4 or 6-Digit UPI PIN</span>
              </div>

              {/* 6 Visual PIN Dots */}
              <div className="flex items-center justify-center gap-3 py-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const isFilled = idx < upiPin.length;
                  return (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full transition-all duration-200 ${
                        isFilled
                          ? "bg-slate-900 scale-125 ring-2 ring-emerald-500 shadow-xs"
                          : "border-2 border-slate-300 bg-slate-100"
                      }`}
                    />
                  );
                })}
              </div>

              {/* On-screen Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto pt-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "CLEAR", "0", "BACKSPACE"].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleNumpadPress(key)}
                    className={`py-3 rounded-xl text-sm font-black transition-all active:scale-90 cursor-pointer ${
                      key === "CLEAR" || key === "BACKSPACE"
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs"
                        : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 shadow-xs"
                    }`}
                  >
                    {key === "BACKSPACE" ? "⌫" : key === "CLEAR" ? "C" : key}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={loading || upiPin.length < 4}
                onClick={handleAuthorizeMandate}
                className={`w-full py-3.5 px-4 rounded-2xl text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all ${
                  upiPin.length >= 4
                    ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25 hover:scale-[1.02] cursor-pointer"
                    : "bg-slate-300 cursor-not-allowed"
                }`}
              >
                <CheckCircle2 size={16} />
                <span>{loading ? "Authenticating with Bank..." : "Authorize Mandate"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("CONFIG");
                  setUpiPin("");
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-bold py-1 cursor-pointer"
              >
                ← Back to Edit UPI ID / Limit
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: SUCCESS ================= */}
        {step === "SUCCESS" && (
          <div className="py-8 text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-black text-slate-900">UPI Mandate Authorized!</h4>
              <p className="text-xs text-slate-500">
                Connected to <strong className="text-slate-900">{method === "UPI" ? upiId : bankObj.name}</strong>.
              </p>
              <p className="font-mono text-xs text-emerald-700 font-bold mt-1">{mandateUmn}</p>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-800 font-medium">
              🎉 Future dues for {target.name} will be automatically debited on the due date. Zero late fee guarantee.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};