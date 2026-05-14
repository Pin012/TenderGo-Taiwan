import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Building2, Hash, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AdvancedFilters { keyword: string; orgName: string; tenderId: string; minBudget: string; maxBudget: string; }
interface SavedCondition { name: string; filters: AdvancedFilters; isDefault: boolean; }
interface Props {
  isOpen: boolean; onClose: () => void; currentFilters: AdvancedFilters; onChangeFilters: (filters: AdvancedFilters) => void;
  editingCondition: SavedCondition | null;
  onCreate: (name: string, filters: AdvancedFilters, isDefault: boolean) => void;
  onConfirmEdit: (name: string, filters: AdvancedFilters) => void;
  onDelete: () => void; onCancelDefault: () => void; onSetDefault: () => void; onRename: (name: string) => void;
}

export default function CustomConditionOverlay({ isOpen, onClose, currentFilters, onChangeFilters, editingCondition, onCreate, onConfirmEdit, onDelete, onCancelDefault, onSetDefault, onRename }: Props) {
  const [name, setName] = useState('');
  const [isDefaultForCreate, setIsDefaultForCreate] = useState(false);
  useEffect(() => { if (isOpen) setName(editingCondition?.name ?? ''); }, [isOpen, editingCondition]);
  const hasFilters = Object.values(currentFilters).some((v) => v.trim() !== '');
  const update = (k: keyof AdvancedFilters, v: string) => onChangeFilters({ ...currentFilters, [k]: v });
  const isEditing = Boolean(editingCondition);

  return <AnimatePresence>{isOpen && <>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70]" />
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-x-0 bottom-0 top-[10%] bg-white rounded-t-[32px] z-[80] flex flex-col overflow-hidden shadow-2xl shadow-blue-900/40">
      <div className="px-6 pt-6 pb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold">{isEditing ? '編輯標籤' : '自訂篩選條件'}</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 text-slate-500 rounded-full"><X size={24} /></button>
        </div>
        <div className="mt-2 bg-[#003366] rounded-2xl p-4">
        <label className="text-xs font-bold text-white/80 uppercase tracking-widest">標籤名稱</label>
        <input value={name} onChange={(e) => { setName(e.target.value); if (isEditing) onRename(e.target.value); }} placeholder="請輸入標籤名稱" className="mt-2 w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-900" />
        {!isEditing && <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => setIsDefaultForCreate(false)} className={`py-2 rounded-xl border ${!isDefaultForCreate ? 'bg-white text-[#003366]' : 'bg-[#003366] text-white border-white/30'}`}>一般標籤</button>
          <button onClick={() => setIsDefaultForCreate(true)} className={`py-2 rounded-xl border ${isDefaultForCreate ? 'bg-white text-[#003366]' : 'bg-[#003366] text-white border-white/30'}`}>設為預設</button>
        </div>}
      </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-10 space-y-4">
        <div><label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Search size={12} /> 標案名稱關鍵字</label><input value={currentFilters.keyword} onChange={(e)=>update('keyword',e.target.value)} className="mt-1 w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm"/></div>
        <div><label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Building2 size={12} /> 招標機關</label><input value={currentFilters.orgName} onChange={(e)=>update('orgName',e.target.value)} className="mt-1 w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm"/></div>
        <div><label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Hash size={12} /> 標案案號</label><input value={currentFilters.tenderId} onChange={(e)=>update('tenderId',e.target.value)} className="mt-1 w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm"/></div>
        <div><label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><DollarSign size={12} /> 預算金額區間</label><div className="grid grid-cols-2 gap-4 mt-1"><input type="number" value={currentFilters.minBudget} onChange={(e)=>update('minBudget',e.target.value)} placeholder="最低" className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm"/><input type="number" value={currentFilters.maxBudget} onChange={(e)=>update('maxBudget',e.target.value)} placeholder="最高" className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm"/></div></div>
      </div>
      <div className="p-6 bg-slate-50 border-t flex gap-3 flex-wrap">
        {!isEditing ? <>
          <button onClick={() => name.trim() && onCreate(name.trim(), currentFilters, isDefaultForCreate)} disabled={!name.trim() || !hasFilters} className="w-full py-3 bg-[#003366] text-white rounded-xl font-bold disabled:opacity-50">建立篩選標籤</button>
        </> : <>
          <button onClick={onDelete} className="flex-1 py-3 bg-white border rounded-xl">刪除標籤</button>
          {editingCondition?.isDefault ? <button onClick={onCancelDefault} className="flex-1 py-3 bg-white border rounded-xl">取消預設</button> : <button onClick={onSetDefault} className="flex-1 py-3 bg-[#003366] text-white rounded-xl">設為預設</button>}
          <button onClick={() => name.trim() && onConfirmEdit(name.trim(), currentFilters)} className="w-full py-3 bg-[#003366] text-white rounded-xl font-bold">確認</button>
        </>}
      </div>
    </motion.div>
  </>}</AnimatePresence>;
}
