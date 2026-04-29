/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Building2, Calendar, MapPin, DollarSign, ExternalLink, ArrowLeft, Bookmark } from 'lucide-react';
import { Tender } from '../types/tender';
import { motion, AnimatePresence } from 'motion/react';

interface TenderDetailProps {
  tender: Tender | null;
  onClose: () => void;
  onTrack: () => void;
  isTracking: boolean;
}

export default function TenderDetail({ tender, onClose, onTrack, isTracking }: TenderDetailProps) {
  if (!tender) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 bg-white z-[60] flex flex-col pt-[max(env(safe-area-inset-top),20px)]"
      >
        <header className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-[#003366] text-white sticky top-0">
          <button onClick={onClose} className="p-2 -ml-2 text-white/80 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-base font-bold absolute left-1/2 -translate-x-1/2 tracking-tight">標案詳情</h2>
          <button 
            onClick={onTrack}
            className={`p-2 rounded-full transition-colors ${isTracking ? 'text-white bg-white/20' : 'text-white/40'}`}
          >
            <Bookmark size={24} fill={isTracking ? "currentColor" : "none"} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pb-20 bg-[#f0f4f8]">
          <div className="py-6 max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-4">
               <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100 uppercase">
                案號：{tender.id}
               </span>
               <span className="bg-[#c6f6d5] text-[#22543d] text-[10px] font-bold px-2 py-0.5 rounded uppercase leading-none">
                 {tender.status}
               </span>
            </div>
            
            <h1 className="text-xl font-bold text-slate-900 leading-tight mb-6">
              {tender.title}
            </h1>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">預算金額</div>
                <div className="text-lg font-bold text-red-600">{formatCurrency(tender.budget)}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">招標方式</div>
                <div className="text-base font-bold text-[#003366]">{tender.type}</div>
              </div>
            </div>

            <section className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-[#003366] border-l-4 border-[#003366] pl-3 mb-4">基本資訊</h3>
                <div className="space-y-4">
                  <InfoItem icon={Building2} label="招標機關" value={tender.orgName} />
                  <InfoItem icon={MapPin} label="履約地點" value={tender.location} />
                  <InfoItem icon={Calendar} label="公告日期" value={tender.publishDate} />
                  <InfoItem icon={Calendar} label="截止投標" value={tender.endDate} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-[#003366] border-l-4 border-[#003366] pl-3 mb-4">標案說明</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {tender.description || '暫無刊登詳細說明。'}
                </p>
              </div>

              <div className="pt-4">
                <a
                  href={`https://web.pcc.gov.tw/tps/tpam/main/tps/tpam/tpam_search_result.do?searchMode=common&method=search&searchTarget=0&jobNo=${tender.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#003366] text-white font-bold py-4 rounded-2xl hover:bg-[#2c5282] transition-all shadow-lg shadow-blue-900/10 active:scale-[0.98]"
                >
                  <ExternalLink size={18} />
                  前往政府電子採購網
                </a>
              </div>
            </section>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-1.5 bg-slate-100 rounded-lg text-slate-500">
        <Icon size={16} />
      </div>
      <div>
        <div className="text-[11px] text-slate-400 font-medium">{label}</div>
        <div className="text-sm text-slate-800 font-semibold">{value}</div>
      </div>
    </div>
  );
}
