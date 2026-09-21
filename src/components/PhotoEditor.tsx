import React, { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Move, Check, Sparkles, User, RefreshCcw } from 'lucide-react';
import { PhotoTransform, RenderResult, StampDetails } from '../types';
import { renderToCanvas, exportStrictJpg } from '../utils/photoProcessor';

interface PhotoEditorProps {
  image: HTMLImageElement | null;
  stamp: StampDetails;
  transform: PhotoTransform;
  onTransformChange: (t: PhotoTransform) => void;
  onRenderComplete: (res: RenderResult) => void;
}

export const PhotoEditor: React.FC<PhotoEditorProps> = ({
  image,
  stamp,
  transform,
  onTransformChange,
  onRenderComplete,
}) => {
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showFaceGuide, setShowFaceGuide] = useState<boolean>(true);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scaleMode, setScaleMode] = useState<'large' | 'actual'>('large');

  // Re-render canvas whenever image, stamp, or transform changes
  useEffect(() => {
    if (!image) return;

    let isMounted = true;
    const canvas = hiddenCanvasRef.current || document.createElement('canvas');

    renderToCanvas(canvas, image, transform, stamp);

    exportStrictJpg(canvas).then((result) => {
      if (isMounted) {
        setPreviewDataUrl(result.dataUrl);
        onRenderComplete(result);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [image, stamp, transform]);

  // Drag handlers for mouse and touch to pan photo
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.offsetX, y: e.clientY - transform.offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    onTransformChange({
      ...transform,
      offsetX: Math.max(-100, Math.min(100, newX)),
      offsetY: Math.max(-100, Math.min(100, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - transform.offsetX,
        y: e.touches[0].clientY - transform.offsetY,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const newX = e.touches[0].clientX - dragStart.x;
    const newY = e.touches[0].clientY - dragStart.y;
    onTransformChange({
      ...transform,
      offsetX: Math.max(-100, Math.min(100, newX)),
      offsetY: Math.max(-100, Math.min(100, newY)),
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const zoomIn = () => {
    onTransformChange({
      ...transform,
      scale: Math.min(3.5, Number((transform.scale + 0.15).toFixed(2))),
    });
  };

  const zoomOut = () => {
    onTransformChange({
      ...transform,
      scale: Math.max(0.6, Number((transform.scale - 0.15).toFixed(2))),
    });
  };

  const rotate90 = () => {
    onTransformChange({
      ...transform,
      rotation: (transform.rotation + 90) % 360,
    });
  };

  const resetPosition = () => {
    onTransformChange({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
    });
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hidden offscreen 150x200 canvas used for strict pixel rendering */}
      <canvas ref={hiddenCanvasRef} className="hidden" width={150} height={200} />

      {/* Frame Container */}
      <div className="relative flex flex-col items-center w-full">
        {/* Apple-style Segmented View Mode Toggle */}
        <div className="flex items-center justify-between w-full max-w-[260px] mb-4">
          <div className="bg-[#e8e8ed] p-0.5 rounded-lg flex items-center text-[12px] font-medium w-full">
            <button
              type="button"
              onClick={() => setScaleMode('actual')}
              className={`flex-1 py-1 px-2.5 rounded-md transition-all text-center ${
                scaleMode === 'actual'
                  ? 'bg-white text-[#1d1d1f] shadow-2xs font-semibold'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              1× Actual Size
            </button>
            <button
              type="button"
              onClick={() => setScaleMode('large')}
              className={`flex-1 py-1 px-2.5 rounded-md transition-all text-center ${
                scaleMode === 'large'
                  ? 'bg-white text-[#1d1d1f] shadow-2xs font-semibold'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              1.5× Zoomed View
            </button>
          </div>
        </div>

        {/* Viewport Stage */}
        <div className="relative p-3 bg-[#f5f5f7] rounded-2xl border border-black/[0.04]">
          <div
            className={`relative border border-black/[0.08] rounded-lg overflow-hidden bg-white select-none shadow-[0_8px_24px_rgba(0,0,0,0.06)] cursor-grab ${
              isDragging ? 'cursor-grabbing' : ''
            }`}
            style={{
              width: scaleMode === 'large' ? '225px' : '150px',
              height: scaleMode === 'large' ? '300px' : '200px',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {previewDataUrl ? (
              <img
                src={previewDataUrl}
                alt="150x200 Photo Output"
                className="w-full h-full object-contain pointer-events-none select-none image-render-crisp"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#f5f5f7] text-[#86868b]">
                <User className="w-10 h-10 stroke-1" />
              </div>
            )}

            {/* Face Alignment Guideline Overlay */}
            {showFaceGuide && previewDataUrl && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center pt-5">
                <div
                  className="border border-dashed border-[#0071e3]/70 rounded-full flex items-center justify-center"
                  style={{
                    width: scaleMode === 'large' ? '110px' : '75px',
                    height: scaleMode === 'large' ? '140px' : '95px',
                  }}
                >
                  <span
                    className="text-white font-medium bg-black/50 backdrop-blur-xs rounded-full px-2 py-0.5 text-center leading-none"
                    style={{ fontSize: scaleMode === 'large' ? '10px' : '8px' }}
                  >
                    Face Guide
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-[12px] text-[#86868b] mt-2.5 flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 text-[#86868b]" />
          <span>Drag to position face in frame</span>
        </p>
      </div>

      {/* Apple-style Photo Adjustment Toolbar */}
      <div className="mt-4 w-full max-w-sm flex flex-col gap-2.5">
        <div className="flex items-center justify-center gap-1.5 p-1 bg-[#f5f5f7] rounded-xl">
          <button
            id="zoom-out-btn"
            type="button"
            onClick={zoomOut}
            className="flex items-center gap-1 py-1.5 px-2.5 bg-white hover:bg-black/[0.04] text-[#1d1d1f] rounded-lg text-[12px] font-medium shadow-2xs transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5 text-[#86868b]" />
            <span>Smaller</span>
          </button>

          <button
            id="zoom-in-btn"
            type="button"
            onClick={zoomIn}
            className="flex items-center gap-1 py-1.5 px-2.5 bg-white hover:bg-black/[0.04] text-[#1d1d1f] rounded-lg text-[12px] font-medium shadow-2xs transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5 text-[#86868b]" />
            <span>Larger</span>
          </button>

          <button
            id="rotate-btn"
            type="button"
            onClick={rotate90}
            className="flex items-center gap-1 py-1.5 px-2.5 bg-white hover:bg-black/[0.04] text-[#1d1d1f] rounded-lg text-[12px] font-medium shadow-2xs transition-colors"
            title="Rotate photo 90 degrees"
          >
            <RotateCw className="w-3.5 h-3.5 text-[#86868b]" />
            <span>Rotate</span>
          </button>

          <button
            id="reset-btn"
            type="button"
            onClick={resetPosition}
            className="flex items-center gap-1 py-1.5 px-2.5 bg-white hover:bg-black/[0.04] text-[#1d1d1f] rounded-lg text-[12px] font-medium shadow-2xs transition-colors"
            title="Reset position"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-[#86868b]" />
            <span>Reset</span>
          </button>
        </div>

        {/* Settings row with Apple-style toggle */}
        <div className="flex items-center justify-between px-3 py-2 bg-white border border-black/[0.06] rounded-xl text-[12px]">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showFaceGuide}
              onChange={(e) => setShowFaceGuide(e.target.checked)}
              className="w-4 h-4 rounded text-[#0071e3] focus:ring-[#0071e3] cursor-pointer"
            />
            <span className="text-[#1d1d1f] font-medium">Alignment Guide Overlay</span>
          </label>
          <span className="text-[#86868b] font-medium">
            Scale: {Math.round(transform.scale * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
