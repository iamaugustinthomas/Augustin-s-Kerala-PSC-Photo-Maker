import React from 'react';
import { RenderResult } from '../types';

interface SpecChecklistProps {
  result: RenderResult | null;
  name: string;
  date: string;
}

export const SpecChecklist: React.FC<SpecChecklistProps> = ({ result, name, date }) => {
  const isSizeOk = result ? result.isUnder30KB : true;
  const hasName = Boolean(name.trim());
  const hasDate = Boolean(date.trim());

  return (
    <div
      id="spec-checklist-card"
      className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-black/[0.06]">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
            Verification
          </span>
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] tracking-tight">
            Portal Requirements
          </h3>
        </div>
        <span className="text-[12px] font-medium text-[#0071e3] bg-[#0071e3]/8 px-2.5 py-1 rounded-full">
          Strict Output
        </span>
      </div>

      <div className="divide-y divide-[#f2f2f5] text-[13px]">
        {/* Dimensions */}
        <div className="py-2.5 flex items-center justify-between">
          <span className="text-[#86868b] font-normal">Dimensions</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#1d1d1f]">150 × 200 px</span>
            <span className="px-2 py-0.5 bg-[#34c759]/12 text-[#248a3d] text-[11px] font-semibold rounded-full">
              Matched
            </span>
          </div>
        </div>

        {/* Format */}
        <div className="py-2.5 flex items-center justify-between">
          <span className="text-[#86868b] font-normal">File Format</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#1d1d1f]">JPEG (.jpg)</span>
            <span className="px-2 py-0.5 bg-[#34c759]/12 text-[#248a3d] text-[11px] font-semibold rounded-full">
              Matched
            </span>
          </div>
        </div>

        {/* File Size */}
        <div className="py-2.5 flex items-center justify-between">
          <span className="text-[#86868b] font-normal">Maximum File Size</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#1d1d1f]">
              {result ? `${result.fileSizeKB} KB` : 'calculating...'}
            </span>
            <span className="text-[#86868b] text-[12px]">/ 30.0 KB</span>
            {isSizeOk ? (
              <span className="px-2 py-0.5 bg-[#34c759]/12 text-[#248a3d] text-[11px] font-semibold rounded-full">
                Pass
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-[#ff3b30]/12 text-[#d70015] text-[11px] font-semibold rounded-full">
                Exceeded
              </span>
            )}
          </div>
        </div>

        {/* Bottom Label */}
        <div className="py-2.5 flex items-center justify-between">
          <span className="text-[#86868b] font-normal">Name & Date Stamp</span>
          <div className="flex items-center gap-2">
            {hasName && hasDate ? (
              <span className="px-2 py-0.5 bg-[#34c759]/12 text-[#248a3d] text-[11px] font-semibold rounded-full">
                Included
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-[#ff9500]/12 text-[#b25000] text-[11px] font-semibold rounded-full">
                Required
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
