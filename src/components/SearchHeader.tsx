/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react';

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onFilterClick: () => void;
  activeFilterCount: number;
}

export default function SearchHeader({ searchQuery, setSearchQuery, onFilterClick, activeFilterCount }: SearchFiltersProps) {
  return (
    <div className="sticky top-0 z-40 bg-[#003366] text-white pt-6 pb-4 px-4 shadow-md">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-lg tracking-tight">標案通 TenderGo</span>
          <div className="flex items-center gap-1 text-xs opacity-80">
             <span>台北市</span>
             <MapPin size={12} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-white transition-colors" size={18} />
            <input
              type="text"
              placeholder="搜尋標案名稱..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/20 border-none rounded-lg py-2.5 pl-10 pr-10 text-sm placeholder:text-white/60 focus:ring-2 focus:ring-white/40 focus:bg-white/30 transition-all outline-none text-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <button 
            onClick={onFilterClick}
            className={`relative p-2.5 rounded-lg border transition-all ${
              activeFilterCount > 0 
                ? 'bg-white/30 border-white/40 text-white ring-4 ring-white/10' 
                : 'border-white/20 text-white/80 hover:bg-white/10'
            }`}
          >
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar">
          {['全部標案', '政府工程', '資訊委託', '近期截止'].map((tag) => (
            <button 
              key={tag}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-colors ${
                tag === '全部標案' 
                  ? 'bg-white text-[#003366] shadow-sm' 
                  : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
