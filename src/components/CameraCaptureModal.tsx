import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageSrc: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCameraError, setHasCameraError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setHasCameraError(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setHasCameraError('Could not open camera. Please allow camera permissions or upload an image file.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror if front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    stopCamera();
    onCapture(dataUrl);
    onClose();
  };

  const triggerCountdown = () => {
    if (countdown !== null) return;
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div
      id="camera-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        id="camera-modal-card"
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.18)] border border-black/[0.08] flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-[#0071e3]" />
            <span className="font-semibold text-[16px] text-[#1d1d1f] tracking-tight">Camera</span>
          </div>
          <button
            id="close-camera-btn"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/[0.05] hover:bg-black/[0.1] text-[#86868b] hover:text-[#1d1d1f] flex items-center justify-center transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Area */}
        <div className="relative bg-black aspect-4/3 flex items-center justify-center overflow-hidden">
          {hasCameraError ? (
            <div className="p-6 text-center text-white max-w-md">
              <p className="text-[15px] font-medium mb-3 text-white/90">{hasCameraError}</p>
              <button
                id="retry-camera-btn"
                onClick={startCamera}
                className="px-4 py-2 bg-white text-[#1d1d1f] font-medium rounded-full text-[13px] shadow transition hover:bg-[#f5f5f7]"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Head / Face Alignment Guide Oval */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-48 h-64 border border-dashed border-[#0071e3] rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] flex items-center justify-center">
                  <span className="text-[11px] font-medium text-white bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-full">
                    Position Face Here
                  </span>
                </div>
              </div>

              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                  <span className="text-8xl font-semibold text-white tracking-tighter animate-ping">
                    {countdown}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls */}
        <div className="p-5 bg-white flex items-center justify-between gap-4 border-t border-black/[0.06]">
          <button
            id="switch-camera-btn"
            type="button"
            onClick={() => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] rounded-full text-[13px] font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-[#86868b]" />
            <span>Switch</span>
          </button>

          <button
            id="snap-photo-btn"
            type="button"
            disabled={!!hasCameraError || countdown !== null}
            onClick={triggerCountdown}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#0066cc] text-white rounded-full font-medium text-[14px] shadow-sm transition-all disabled:opacity-40"
          >
            <Camera className="w-4 h-4" />
            <span>Capture Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
