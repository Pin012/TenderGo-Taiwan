/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Search, DollarSign, Building2, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface FilterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  filters: { keyword: string; orgName: string; tenderId: string; minBudget: string; maxBudget: string; };
  onChange: (filters: { keyword: string; orgName: string; tenderId: string; minBudget: string; maxBudget: string; }) => void;
  onSetCondition: (name: string) => void;
  onSetDefault: (name: string) => void;
  onDeleteCondition: () => void;
}

export default function FilterOverlay({ isOpen, onClose, filters, onChange, onSetCondition, onSetDefault, onDeleteCondition }: FilterOverlayProps) {
  const update = (key: keyof typeof filters, value: string) => onChange({ ...filters, [key]: value });
  const [savedName, setSavedName] = useState('');
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70]"
          />
          
          {/* Content */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 top-[10%] bg-white rounded-t-[32px] z-[80] flex flex-col overflow-hidden shadow-2xl shadow-blue-900/40"
          >
            <div className="flex-1 overflow-y-auto px-6 pt-8 pb-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">進階篩選</h2>
                  <p className="text-slate-400 text-sm mt-1">鎖定精準採購商機</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* 標案名稱 */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Search size={12} /> 標案名稱關鍵字
                  </label>
                  <input 
                    type="text" 
                    placeholder="例如：系統開發、委託服務..."
                    value={filters.keyword}
                    onChange={(e) => update('keyword', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#003366] outline-none transition-all"
                  />
                </div>

                {/* 招標機關 */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Building2 size={12} /> 招標機關
                  </label>
                  <input 
                    type="text" 
                    placeholder="例如：資訊處、圖書館..."
                    value={filters.orgName}
                    onChange={(e) => update('orgName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#003366] outline-none transition-all"
                  />
                </div>

                {/* 案號 */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Hash size={12} /> 標案案號
                  </label>
                  <input 
                    type="text" 
                    placeholder="例如：1130425-A1"
                    value={filters.tenderId}
                    onChange={(e) => update('tenderId', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-[#003366] outline-none transition-all"
                  />
                </div>

                {/* 金額區間 */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={12} /> 預算金額區間
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-bold">NT$</span>
                      <input 
                        type="number" 
                        placeholder="最低"
                        value={filters.minBudget}
                        onChange={(e) => update('minBudget', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#003366] outline-none"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-bold">NT$</span>
                      <input 
                        type="number" 
                        placeholder="最高"
                        value={filters.maxBudget}
                        onChange={(e) => update('maxBudget', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#003366] outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {['< 100萬', '100萬 - 500萬', '500萬 - 1000萬', '> 1000萬'].map(range => (
                      <button 
                        key={range}
                        className="px-3 py-1.5 rounded-lg border border-slate-100 bg-white text-[11px] font-bold text-slate-600 hover:border-blue-200 hover:text-blue-600 transition-colors"
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    按鈕名稱
                  </label>
                  <input
                    type="text"
                    value={savedName}
                    onChange={(e) => setSavedName(e.target.value)}
                    placeholder="請輸入條件按鈕名稱"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#003366] outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button 
                onClick={() => {
                  onDeleteCondition();
                  onClose();
                }}
                className="flex-1 py-4 text-slate-500 font-bold text-sm bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors"
              >
                刪除條件
              </button>
              <button 
                onClick={() => {
                  if (!savedName.trim()) return;
                  onSetCondition(savedName.trim());
                  onClose();
                }}
                className="flex-1 py-4 bg-[#003366] text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-900/20 hover:bg-[#2c5282] transition-all flex items-center justify-center gap-2"
              >
                設定條件
              </button>
              <button 
                onClick={() => {
                  if (!savedName.trim()) return;
                  onSetDefault(savedName.trim());
                  onClose();
                }}
                className="flex-1 py-4 bg-[#1a4f84] text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-900/20 hover:bg-[#2c5282] transition-all flex items-center justify-center gap-2"
              >
                設為預設
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
