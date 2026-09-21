import React from 'react';
import { X, Printer, Check } from 'lucide-react';
import { RenderResult, StampDetails } from '../types';

interface PrintSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: RenderResult | null;
  stamp: StampDetails;
}

export const PrintSheetModal: React.FC<PrintSheetModalProps> = ({
  isOpen,
  onClose,
  result,
  stamp,
}) => {
  if (!isOpen || !result) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="print-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-[0_24px_50px_rgba(0,0,0,0.18)] border border-black/[0.08] flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
          <div>
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight">Print Layout</h3>
            <p className="text-[13px] text-[#86868b] mt-0.5">
              8-copy photo sheet formatted for standard 4×6 inch print output
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/[0.05] hover:bg-black/[0.1] text-[#86868b] hover:text-[#1d1d1f] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sheet Grid Preview */}
        <div className="my-5 p-6 bg-[#f5f5f7] rounded-2xl flex items-center justify-center border border-black/[0.04]">
          <div className="grid grid-cols-4 gap-3 p-4 bg-white border border-black/[0.08] shadow-sm rounded-xl">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center border border-black/[0.08] p-1 bg-white rounded"
              >
                <img
                  src={result.dataUrl}
                  alt={`Copy ${i + 1}`}
                  className="w-[105px] h-[140px] object-contain rounded-xs"
                />
                <span className="text-[9px] text-[#86868b] mt-0.5 font-normal">150 × 200</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-black/[0.06]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-full text-[#1d1d1f] font-medium text-[13px] transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full font-medium text-[14px] shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </div>
  );
};
