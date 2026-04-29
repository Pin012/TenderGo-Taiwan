/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tender } from '../types/tender';
import { Building2, Calendar, MapPin, DollarSign, ChevronRight, Bookmark } from 'lucide-react';
import { motion } from 'motion/react';

interface TenderCardProps {
  tender: Tender;
  onClick: () => void;
  onTrack: () => void;
  isTracking: boolean;
}

export default function TenderCard({ tender, onClick, onTrack, isTracking }: TenderCardProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case '招標中': return 'bg-[#c6f6d5] text-[#22543d]';
      case '決標': return 'bg-[#edf2f7] text-[#4a5568]';
      case '流標': return 'bg-[#feebc8] text-[#7b341e]';
      case '廢標': return 'bg-[#fed7d7] text-[#822727]';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-[16px] border border-slate-100 shadow-sm overflow-hidden mb-4"
    >
      <div className="p-4" onClick={onClick}>
        <div className="flex justify-between items-start mb-2 gap-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getStatusStyle(tender.status)}`}>
            {tender.status}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            案號: {tender.id}
          </span>
        </div>

        <h3 className="text-[15px] font-bold text-slate-800 line-clamp-2 mb-3 leading-tight">
          {tender.title}
        </h3>

        <div className="space-y-2 text-[13px] text-slate-600">
          <div className="flex items-center gap-2">
            <Building2 size={13} className="text-slate-400" />
            <span className="truncate">機關：{tender.orgName}</span>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-bold">預算金額</span>
              <span className="text-red-600 font-bold text-base">{formatCurrency(tender.budget)}</span>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTrack();
              }}
              className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                isTracking 
                  ? 'bg-[#003366] text-white shadow-sm' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark size={13} fill={isTracking ? "currentColor" : "none"} />
              {isTracking ? '已收藏' : '收藏'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-50 px-4 py-2 bg-[#f7fafc]">
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>截止: {tender.endDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span>{tender.location}</span>
          </div>
        </div>
        <div className="flex items-center text-[#003366] text-[11px] font-bold" onClick={onClick}>
          <ChevronRight size={14} />
        </div>
      </div>
    </motion.div>
  );
}
