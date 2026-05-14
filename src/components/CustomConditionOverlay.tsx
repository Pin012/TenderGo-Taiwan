import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
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
  editingCondition: SavedCondition | null;
  onSaveNormal: (name: string) => void;
  onSaveDefault: (name: string) => void;
  onDelete: () => void;
  onCancelDefault: () => void;
}

export default function CustomConditionOverlay({
  isOpen,
  onClose,
  currentFilters,
  editingCondition,
  onSaveNormal,
  onSaveDefault,
  onDelete,
  onCancelDefault,
}: CustomConditionOverlayProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) setName(editingCondition?.name ?? '');
  }, [isOpen, editingCondition]);

  const hasFilters = Object.values(currentFilters).some((value) => value.trim() !== '');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70]" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-x-0 bottom-0 top-[30%] bg-white rounded-t-[32px] z-[80] flex flex-col overflow-hidden shadow-2xl shadow-blue-900/40">
            <div className="flex-1 overflow-y-auto px-6 pt-8 pb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">自訂條件</h2>
                <button onClick={onClose} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"><X size={24} /></button>
              </div>
              <p className="text-sm text-slate-500 mb-4">使用目前已設定的篩選條件建立快捷按鈕。</p>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="請輸入條件按鈕名稱" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#003366] outline-none transition-all" />
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3">
              <button onClick={() => name.trim() && onSaveNormal(name.trim())} disabled={!name.trim() || !hasFilters} className="flex-1 min-w-[130px] py-3 bg-[#003366] text-white font-bold text-sm rounded-xl disabled:opacity-50">設定條件</button>
              <button onClick={() => name.trim() && onSaveDefault(name.trim())} disabled={!name.trim() || !hasFilters} className="flex-1 min-w-[130px] py-3 bg-[#1a4f84] text-white font-bold text-sm rounded-xl disabled:opacity-50">設為預設</button>
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
        </>
      )}
    </AnimatePresence>
  );
}
