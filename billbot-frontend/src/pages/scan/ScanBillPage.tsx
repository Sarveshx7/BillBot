import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  Calendar,
  X,
  Image as ImageIcon,
  AlertTriangle,
  Receipt,
  Edit3,
  RefreshCw,
} from "lucide-react";
import { expenseService } from "../../services/expenseService";
import { billDueService } from "../../services/billDueService";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

interface ScanBillPageProps {
  onNavigate: (page: string) => void;
}

export const ScanBillPage: React.FC<ScanBillPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const curr = user?.currency === "INR" ? "₹" : user?.currency || "₹";

  const [billFile, setBillFile] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState("");
  const [rawOcrLines, setRawOcrLines] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Extracted & Editable Fields
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("GROCERIES");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [notes, setNotes] = useState("");
  const [hasExtracted, setHasExtracted] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      if (billPreview) {
        URL.revokeObjectURL(billPreview);
      }
    };
  }, [cameraStream, billPreview]);

  const handleBillFile = (file: File | undefined) => {
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setOcrError("Please choose a JPG, PNG, or WEBP image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setOcrError("File size must be 10 MB or less.");
      return;
    }

    if (billPreview) URL.revokeObjectURL(billPreview);
    setOcrError("");
    setBillFile(file);
    setBillPreview(URL.createObjectURL(file));
    setHasExtracted(false);
    setSaveSuccessMsg("");
  };

  const openCamera = async () => {
    setOcrError("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      cameraInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      setCameraStream(stream);
      setCameraOpen(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch (err) {
      console.error("Camera error:", err);
      cameraInputRef.current?.click();
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    setCameraStream(null);
    setCameraOpen(false);
  };

  const captureBill = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setOcrError("Camera is not ready yet.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `bill-${Date.now()}.jpg`, { type: "image/jpeg" });
      if (billPreview) URL.revokeObjectURL(billPreview);
      setBillFile(file);
      setBillPreview(URL.createObjectURL(file));
      setOcrError("");
      setHasExtracted(false);
      closeCamera();
    }, "image/jpeg", 0.92);
  };

  const handleOCRExtraction = async () => {
    if (!billFile) {
      setOcrError("Please upload or capture a receipt image first.");
      return;
    }

    try {
      setOcrLoading(true);
      setOcrError("");
      const formData = new FormData();
      formData.append("file", billFile);

      const ocrApiUrl = import.meta.env.VITE_OCR_API_URL || "http://127.0.0.1:5000";
      const cleanUrl = ocrApiUrl.replace(/\/$/, "");

      const response = await fetch(`${cleanUrl}/ocr`, {
        method: "POST",
        body: formData,
      });

      const res = await response.json();
      if (!response.ok || !res?.success) {
        throw new Error(res?.detail || res?.message || "OCR service could not parse the receipt.");
      }

      const d = res.data || res.expense;
      setMerchant(d.merchant || "Store / Merchant");
      setAmount(d.amount ? d.amount.toString() : "0.00");
      setCategory(d.category || "GROCERIES");
      setExpenseDate(d.expenseDate || new Date().toISOString().slice(0, 10));
      setPaymentMethod(d.paymentMethod || "UPI");
      setNotes("Extracted via AI OCR");
      setRawOcrLines(res.lines || []);
      setHasExtracted(true);
    } catch (err: any) {
      console.error("OCR extraction failed:", err);
      setOcrError(
        err?.message ||
          "Could not reach OCR service on http://127.0.0.1:5000. Please ensure the OCR engine is running."
      );
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSaveAsExpense = async () => {
    if (!merchant.trim()) {
      alert("Merchant / Store name is required.");
      return;
    }
    const parsedAmt = parseFloat(amount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      setSaving(true);
      await expenseService.create({
        merchant: merchant.trim(),
        amount: parsedAmt,
        currency: user?.currency || "INR",
        expenseDate: expenseDate ? expenseDate + "T12:00:00" : new Date().toISOString(),
        category: category || "GROCERIES",
        paymentMethod: paymentMethod || "UPI",
        source: "OCR",
        notes: notes.trim() || undefined,
      });
      setSaveSuccessMsg("Saved directly to Daily Expenses!");
      setTimeout(() => onNavigate("expenses"), 1200);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save expense.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsBillDue = async () => {
    if (!merchant.trim()) {
      alert("Bill / Provider name is required.");
      return;
    }
    const parsedAmt = parseFloat(amount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      setSaving(true);
      await billDueService.create({
        billerName: merchant.trim(),
        amount: parsedAmt,
        currency: user?.currency || "INR",
        dueDate: expenseDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        category: category || "BILLS",
        recurringFrequency: "MONTHLY",
        autoPay: false,
        notes: notes.trim() || "Extracted via AI OCR",
      });
      setSaveSuccessMsg("Scheduled as Upcoming Bill Due!");
      setTimeout(() => onNavigate("bills"), 1200);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to schedule bill due.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">
          AI INTELLIGENCE
        </span>
        <h2 className="text-2xl font-black text-slate-900 mt-1">AI Bill & Receipt Scanner</h2>
        <p className="text-xs text-slate-500 mt-1">
          Upload any paper receipt or digital bill to automatically extract store name, amounts, and dates.
        </p>
      </div>

      {ocrError && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-xs flex items-start gap-2.5">
          <AlertTriangle size={17} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Extraction Notice</p>
            <p className="mt-0.5">{ocrError}</p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Upload & Capture */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">1. Upload Receipt Image</h3>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleBillFile(e.target.files?.[0])}
            />
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleBillFile(e.target.files?.[0])}
            />

            {cameraOpen ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={captureBill}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg"
                  >
                    Snap Photo
                  </button>
                  <button
                    type="button"
                    onClick={closeCamera}
                    className="p-2.5 rounded-xl bg-slate-900/80 text-white text-xs"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : billPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[3/4] bg-slate-50 flex items-center justify-center">
                <img src={billPreview} alt="Receipt preview" className="w-full h-full object-contain" />
                <button
                  onClick={() => {
                    setBillFile(null);
                    setBillPreview("");
                    setHasExtracted(false);
                    setSaveSuccessMsg("");
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-slate-900"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 rounded-2xl aspect-[3/4] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <ImageIcon size={28} />
                </div>
                <p className="text-sm font-bold text-slate-800">Click to upload bill image</p>
                <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP (DMart, Groceries, Electricity)</p>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
              >
                <Upload size={15} />
                <span>Choose File</span>
              </button>

              <button
                type="button"
                onClick={openCamera}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                <Camera size={15} />
                <span>Camera</span>
              </button>
            </div>

            <button
              type="button"
              disabled={!billFile || ocrLoading}
              onClick={handleOCRExtraction}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Sparkles size={16} />
              <span>{ocrLoading ? "Scanning Receipt..." : "Run AI OCR Extraction"}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Editable Review Form */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">2. Review & Edit Extracted Data</h3>
                <p className="text-xs text-slate-400">Inspect fields and make any quick adjustments</p>
              </div>
              {hasExtracted && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={13} /> Scanned
                </span>
              )}
            </div>

            {ocrLoading ? (
              <LoadingSpinner message="Running AI Optical Character Recognition on your receipt..." />
            ) : hasExtracted ? (
              <div className="space-y-4">
                {/* Merchant Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Store / Merchant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Amount and Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Total Amount ({curr}) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-900 text-right focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Bill / Receipt Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Category & Payment Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="GROCERIES">Groceries & Supermarket (DMart)</option>
                      <option value="FOOD">Food & Dining</option>
                      <option value="SHOPPING">Shopping & Clothes</option>
                      <option value="TRANSPORT">Transport & Fuel</option>
                      <option value="ELECTRICITY">Electricity & Power</option>
                      <option value="INTERNET">Internet & WiFi</option>
                      <option value="BILLS">Bills & Utilities</option>
                      <option value="HEALTH">Health & Pharmacy</option>
                      <option value="RENT">Rent</option>
                      <option value="OTHER">Other / Misc</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="DEBIT_CARD">Debit Card</option>
                      <option value="CASH">Cash</option>
                      <option value="NET_BANKING">Net Banking</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes / Tags</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. DMart weekly grocery shopping"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {saveSuccessMsg && (
                  <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                    <CheckCircle2 size={16} />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs space-y-2">
                <p className="font-semibold text-slate-600 text-sm">No bill scanned yet</p>
                <p>Upload a bill or take a photo on the left, then click "Run AI OCR Extraction".</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {hasExtracted && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={saving || !!saveSuccessMsg}
                onClick={handleSaveAsExpense}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
              >
                <Receipt size={16} />
                <span>Save as Daily Expense</span>
              </button>

              <button
                type="button"
                disabled={saving || !!saveSuccessMsg}
                onClick={handleSaveAsBillDue}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01]"
              >
                <Calendar size={16} />
                <span>Schedule as Bill Due</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};