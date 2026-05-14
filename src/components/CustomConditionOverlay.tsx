import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Building2, Hash, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AdvancedFilters {
  keyword: string;
  orgName: string;
  tenderId: string;
  minBudget: string;
  maxBudget: string;
}

interface SavedCondition {
  name: string;
  filters: AdvancedFilters;
  isDefault: boolean;
}

interface CustomConditionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: AdvancedFilters;
  onChangeFilters: (filters: AdvancedFilters) => void;
  editingCondition: SavedCondition | null;
  onSaveNormal: (name: string, filters: AdvancedFilters) => void;
  onSaveDefault: (name: string, filters: AdvancedFilters) => void;
  onDelete: () => void;
  onCancelDefault: () => void;
}

export default function CustomConditionOverlay({
  isOpen,
  onClose,
  currentFilters,
  onChangeFilters,
  editingCondition,
  onSaveNormal,
  onSaveDefault,
  onDelete,
  onCancelDefault,
}: CustomConditionOverlayProps) {
  const [name, setName] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);

  useEffect(() => {
    if (isOpen) setName(editingCondition?.name ?? '');
  }, [isOpen, editingCondition]);

  const hasFilters = Object.values(currentFilters).some((value) => value.trim() !== '');
  const update = (key: keyof AdvancedFilters, value: string) => onChangeFilters({ ...currentFilters, [key]: value });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70]" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-x-0 bottom-0 top-[10%] bg-white rounded-t-[32px] z-[80] flex flex-col overflow-hidden shadow-2xl shadow-blue-900/40">
            <div className="flex-1 overflow-y-auto px-6 pt-8 pb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">自訂條件</h2>
                <button onClick={onClose} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"><X size={24} /></button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Search size={12} /> 標案名稱關鍵字</label><input value={currentFilters.keyword} onChange={(e) => update('keyword', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#003366] outline-none transition-all" /></div>
                <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Building2 size={12} /> 招標機關</label><input value={currentFilters.orgName} onChange={(e) => update('orgName', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#003366] outline-none transition-all" /></div>
                <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Hash size={12} /> 標案案號</label><input value={currentFilters.tenderId} onChange={(e) => update('tenderId', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#003366] outline-none transition-all" /></div>
                <div className="space-y-3"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><DollarSign size={12} /> 預算金額區間</label><div className="grid grid-cols-2 gap-4"><input type="number" value={currentFilters.minBudget} onChange={(e) => update('minBudget', e.target.value)} placeholder="最低" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#003366] outline-none" /><input type="number" value={currentFilters.maxBudget} onChange={(e) => update('maxBudget', e.target.value)} placeholder="最高" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#003366] outline-none" /></div></div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3">
              <button onClick={() => setShowNameModal(true)} disabled={!hasFilters} className="flex-1 min-w-[130px] py-3 bg-[#003366] text-white font-bold text-sm rounded-xl disabled:opacity-50">設定條件</button>
              <button onClick={() => setShowNameModal(true)} disabled={!hasFilters} className="flex-1 min-w-[130px] py-3 bg-[#1a4f84] text-white font-bold text-sm rounded-xl disabled:opacity-50">設為預設</button>
              {editingCondition && (
                <>
                  <button onClick={onDelete} className="flex-1 min-w-[130px] py-3 bg-white text-slate-600 font-bold text-sm rounded-xl border border-slate-200">刪除按鈕</button>
                  {editingCondition.isDefault && (
                    <button onClick={onCancelDefault} className="flex-1 min-w-[130px] py-3 bg-white text-slate-600 font-bold text-sm rounded-xl border border-slate-200">取消預設</button>
                  )}
                </>
              )}
            </div>
          </motion.div>
          {showNameModal && (
            <div className="fixed inset-0 z-[90] bg-black/30 flex items-end" onClick={() => setShowNameModal(false)}>
              <div className="w-full bg-white rounded-t-3xl p-6" onClick={(e) => e.stopPropagation()}>
                <p className="font-bold text-slate-800 mb-3">請輸入條件按鈕名稱</p>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#003366] outline-none transition-all" />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button onClick={() => name.trim() && onSaveNormal(name.trim(), currentFilters)} className="py-3 bg-[#003366] text-white rounded-xl font-bold">建立一般按鈕</button>
                  <button onClick={() => name.trim() && onSaveDefault(name.trim(), currentFilters)} className="py-3 bg-[#1a4f84] text-white rounded-xl font-bold">建立預設按鈕</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
