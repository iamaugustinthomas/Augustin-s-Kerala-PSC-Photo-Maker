import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Camera,
  Download,
  CheckCircle2,
  Calendar,
  User,
  Sparkles,
  Printer,
  Copy,
  Check,
  RotateCw,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  FileCheck,
  AlertCircle,
  ChefHat
} from 'lucide-react';
import { DateFormat, PhotoTransform, RenderResult, StampDetails } from './types';
import {
  createSamplePortraitImage,
  getTodayDateString,
  TARGET_WIDTH,
  TARGET_HEIGHT,
  SAFE_MAX_BYTES,
  formatDate
} from './utils/photoProcessor';
import { PhotoEditor } from './components/PhotoEditor';
import { SpecChecklist } from './components/SpecChecklist';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { PrintSheetModal } from './components/PrintSheetModal';

export default function App() {
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('exam_photo');
  const [isSampleLoaded, setIsSampleLoaded] = useState<boolean>(true);

  // Name and Date stamp details
  const [stamp, setStamp] = useState<StampDetails>({
    name: 'JOHN DOE',
    date: getTodayDateString(),
    dateFormat: 'DD-MM-YYYY',
    isUppercase: true,
    barHeight: 40,
  });

  // Transform (pan, zoom, rotate)
  const [transform, setTransform] = useState<PhotoTransform>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
  });

  // Render outcome
  const [renderResult, setRenderResult] = useState<RenderResult | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Modals
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load sample portrait on startup so user immediately sees how it works!
  useEffect(() => {
    let active = true;
    createSamplePortraitImage().then((img) => {
      if (active) {
        setCurrentImage(img);
        setIsSampleLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Handle uploaded file
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (e.g., JPG, PNG).');
      return;
    }

    const cleanBaseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    setImageFileName(cleanBaseName || 'my_photo');

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setCurrentImage(img);
        setIsSampleLoaded(false);
        // Reset transform to centered
        setTransform({
          scale: 1,
          offsetX: 0,
          offsetY: 0,
          rotation: 0,
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle camera capture result
  const handleCameraCapture = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      setCurrentImage(img);
      setIsSampleLoaded(false);
      setImageFileName('camera_photo');
      setTransform({
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
      });
    };
    img.src = dataUrl;
  };

  // Download 150x200 JPG
  const handleDownload = () => {
    if (!renderResult) return;
    setIsDownloading(true);

    const safeName = stamp.name.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'photo';
    const dateStr = stamp.date || getTodayDateString();
    const downloadName = `${safeName}_150x200_${dateStr}.jpg`;

    const link = document.createElement('a');
    link.href = renderResult.dataUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
    }, 800);
  };

  // Copy to clipboard
  const handleCopyImage = async () => {
    if (!renderResult) return;
    try {
      // Need PNG blob for standard clipboard API
      const response = await fetch(renderResult.dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    } catch (e) {
      console.warn('Clipboard write error:', e);
      alert('Photo downloaded or ready for use.');
    }
  };

  // Load sample again
  const loadSample = async () => {
    const img = await createSamplePortraitImage();
    setCurrentImage(img);
    setIsSampleLoaded(true);
    setStamp((prev) => ({
      ...prev,
      name: 'JOHN DOE',
      date: getTodayDateString(),
    }));
    setTransform({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col antialiased selection:bg-[#0071e3]/20 selection:text-[#0071e3]">
      {/* Top Navigation Bar - Apple translucent frosted glass */}
      <header className="sticky top-0 z-30 bg-[#f5f5f7]/85 backdrop-blur-xl border-b border-black/[0.08] px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0a84ff] to-[#0066cc] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(0,113,227,0.28)] border border-white/20 shrink-0">
              <ChefHat className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-[16px] font-semibold text-[#1d1d1f] tracking-tight leading-tight">
                Kerala PSC Exam Photo Maker
              </h1>
              <p className="text-[11px] text-[#86868b] font-normal leading-tight hidden sm:block">
                150 × 200 px • Under 30 KB • Bottom Name & Date Stamp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/[0.04] rounded-full text-[12px] font-medium text-[#1d1d1f]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34c759]"></span>
              <span className="hidden sm:inline">On-Device Processing</span>
              <span className="sm:hidden">Local</span>
            </div>
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3 py-1 bg-black/[0.05] hover:bg-black/[0.08] text-[#1d1d1f] text-[12px] font-medium rounded-full transition-colors hidden sm:flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-[#86868b]" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {/* Subtle Information Banner */}
        <div className="bg-white rounded-2xl border border-black/[0.06] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] mb-6 flex items-start sm:items-center justify-between gap-3 text-[13px] text-[#1d1d1f]">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#0071e3] shrink-0"></div>
            <span>
              <strong>Official Portal Requirement:</strong> 150 × 200 px JPEG format under 30 KB with candidate name and photo date on a clean white bottom strip.
            </span>
          </div>
          <span className="text-[12px] text-[#86868b] shrink-0 font-medium hidden md:inline">
            100% Offline Compatible
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Input Source & Details */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Step 1: Select Photograph */}
            <div
              id="step-photo-card"
              className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/[0.06]">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
                    Step 1
                  </span>
                  <h2 className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight">
                    Select Photograph
                  </h2>
                </div>
                {isSampleLoaded && (
                  <span className="text-[11px] font-medium bg-[#f5f5f7] text-[#86868b] px-2.5 py-0.5 rounded-full border border-black/[0.04]">
                    Template Loaded
                  </span>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                id="photo-file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Upload Button */}
                <button
                  id="upload-photo-btn"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#0066cc] text-white rounded-xl font-medium text-[14px] shadow-2xs transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo</span>
                </button>

                {/* Camera Button */}
                <button
                  id="take-photo-btn"
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f5f5f7] hover:bg-[#e8e8ed] active:bg-[#dedee3] text-[#1d1d1f] rounded-xl font-medium text-[14px] transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#86868b]" />
                  <span>Use Camera</span>
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className="mt-3.5 border border-dashed border-[#d2d2d7] hover:border-[#0071e3] bg-[#fafafc] hover:bg-[#f5f5f7] rounded-xl p-4 text-center transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <p className="text-[13px] text-[#86868b]">
                  Drop photo file here or click to browse (JPG, PNG)
                </p>
              </div>

              {!isSampleLoaded && (
                <div className="mt-3 text-right">
                  <button
                    type="button"
                    onClick={loadSample}
                    className="text-[12px] text-[#0071e3] hover:text-[#0077ed] font-medium"
                  >
                    Reset to sample template
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Candidate Details */}
            <div
              id="step-details-card"
              className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            >
              <div className="mb-4 pb-3 border-b border-black/[0.06]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
                  Step 2
                </span>
                <h2 className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight">
                  Candidate Details
                </h2>
                <p className="text-[12px] text-[#86868b] mt-0.5">
                  Printed in clear black text on the white bottom bar
                </p>
              </div>

              <div className="space-y-4">
                {/* Full Name Input */}
                <div>
                  <label
                    htmlFor="candidate-name-input"
                    className="block text-[12px] font-medium text-[#86868b] mb-1.5"
                  >
                    Candidate Full Name
                  </label>
                  <input
                    id="candidate-name-input"
                    type="text"
                    value={stamp.name}
                    onChange={(e) => setStamp({ ...stamp, name: e.target.value })}
                    placeholder="ENTER FULL NAME"
                    maxLength={40}
                    className="w-full px-3.5 py-2.5 bg-[#f5f5f7] focus:bg-white border border-[#d2d2d7] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/12 rounded-xl text-[14px] font-medium text-[#1d1d1f] outline-none uppercase tracking-wide transition-all"
                  />
                  <div className="flex items-center justify-between mt-1 text-[11px] text-[#86868b]">
                    <span>Rendered in bold uppercase</span>
                    <span>{stamp.name.length} / 40</span>
                  </div>
                </div>

                {/* Date and Format */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="photo-date-input"
                      className="block text-[12px] font-medium text-[#86868b] mb-1.5"
                    >
                      Photo Date
                    </label>
                    <input
                      id="photo-date-input"
                      type="date"
                      value={stamp.date}
                      onChange={(e) => setStamp({ ...stamp, date: e.target.value })}
                      className="w-full px-3 py-2 bg-[#f5f5f7] focus:bg-white border border-[#d2d2d7] focus:border-[#0071e3] rounded-xl text-[13px] text-[#1d1d1f] outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="date-format-select"
                      className="block text-[12px] font-medium text-[#86868b] mb-1.5"
                    >
                      Date Format
                    </label>
                    <select
                      id="date-format-select"
                      value={stamp.dateFormat}
                      onChange={(e) =>
                        setStamp({ ...stamp, dateFormat: e.target.value as DateFormat })
                      }
                      className="w-full px-3 py-2 bg-[#f5f5f7] focus:bg-white border border-[#d2d2d7] focus:border-[#0071e3] rounded-xl text-[13px] text-[#1d1d1f] outline-none cursor-pointer transition-colors"
                    >
                      <option value="DD-MM-YYYY">DD-MM-YYYY (e.g. 21-09-2026)</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 21/09/2026)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-21)</option>
                    </select>
                  </div>
                </div>

                {/* Quick Date Helper */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setStamp({ ...stamp, date: getTodayDateString() })}
                    className="text-[12px] text-[#0071e3] bg-[#0071e3]/8 hover:bg-[#0071e3]/12 font-medium px-2.5 py-1 rounded-full transition-colors"
                  >
                    Insert Today's Date
                  </button>
                  <span className="text-[12px] text-[#86868b]">
                    Output: {formatDate(stamp.date, stamp.dateFormat)}
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist of specifications */}
            <SpecChecklist
              result={renderResult}
              name={stamp.name}
              date={stamp.date}
            />
          </div>

          {/* RIGHT COLUMN: Live Viewport, Technical Alignment & Download */}
          <div className="lg:col-span-6 space-y-6">
            <div
              id="step-preview-card"
              className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col items-center"
            >
              <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-black/[0.06]">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
                    Step 3
                  </span>
                  <h2 className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight">
                    Preview & Output
                  </h2>
                </div>
                {renderResult && (
                  <span className="text-[12px] font-medium px-2.5 py-0.5 bg-[#f5f5f7] border border-black/[0.04] rounded-full text-[#1d1d1f]">
                    {renderResult.fileSizeKB} KB
                  </span>
                )}
              </div>

              {/* Photo Editor Canvas Component */}
              <PhotoEditor
                image={currentImage}
                stamp={stamp}
                transform={transform}
                onTransformChange={setTransform}
                onRenderComplete={setRenderResult}
              />

              {/* Solid Download Button */}
              <div className="w-full mt-6 space-y-3">
                <button
                  id="download-final-photo-btn"
                  type="button"
                  onClick={handleDownload}
                  disabled={!renderResult}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#0066cc] text-white rounded-full font-medium text-[15px] shadow-sm transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Photo (.jpg)</span>
                </button>

                {/* Status line */}
                <div className="text-center text-[12px] text-[#86868b] flex items-center justify-center gap-2">
                  <span>150 × 200 px</span>
                  <span>•</span>
                  <span>JPEG</span>
                  <span>•</span>
                  <span className="font-medium text-[#1d1d1f]">
                    {renderResult ? `${renderResult.fileSizeKB} KB (Under 30 KB limit)` : 'Calculating...'}
                  </span>
                </div>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    id="open-print-sheet-btn"
                    type="button"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] rounded-full font-medium text-[12px] transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#86868b]" />
                    <span>Print 8 Copies</span>
                  </button>

                  <button
                    id="copy-image-btn"
                    type="button"
                    onClick={handleCopyImage}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] rounded-full font-medium text-[12px] transition-colors"
                  >
                    {copiedNotification ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#34c759]" />
                        <span className="text-[#248a3d] font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#86868b]" />
                        <span>Copy Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Practical Notes & Tips */}
            <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-[13px] text-[#86868b]">
              <div className="font-semibold text-[#1d1d1f] mb-1.5 text-[14px]">
                Photo Guidelines
              </div>
              <ul className="space-y-1.5 list-disc pl-4 text-[13px]">
                <li>Drag the photo inside the frame to center your face and shoulders.</li>
                <li>Adjust scale using the controls so your face occupies ~70% of the frame.</li>
                <li>Ensure the candidate name exactly matches your official examination records.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Apple-style Minimal Footer with ChefHat branding */}
      <footer className="border-t border-black/[0.06] bg-white py-5 px-4 text-center text-[12px] text-[#86868b]">
        <div className="flex items-center justify-center gap-1.5 mb-1 font-medium text-[#1d1d1f]">
          <ChefHat className="w-4 h-4 text-[#0071e3]" />
          <span>Kerala PSC Exam Photo Maker</span>
        </div>
        <p>
          150 × 200 Pixel Output • 100% Client-Side Processing • Safe & Private
        </p>
      </footer>

      {/* Modals */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      <PrintSheetModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        result={renderResult}
        stamp={stamp}
      />
    </div>
  );
}
