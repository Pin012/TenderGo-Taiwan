/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import SearchHeader from './components/SearchHeader';
import BottomNav from './components/BottomNav';
import TenderCard from './components/TenderCard';
import TenderDetail from './components/TenderDetail';
import FilterOverlay from './components/FilterOverlay';
import { MOCK_TENDERS } from './data/mockTenders';
import { Tender } from './types/tender';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, ClipboardList, UserRound, Bell, Loader2, BellDot, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Simulated notification logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotification('發現 3 個符合您專業領域的新標案！');
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Persistence Logic: Load from localStorage on init
  const [trackingIds, setTrackingIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('tender_tracking_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      console.error('Failed to load tracking IDs:', e);
      return new Set();
    }
  });

  // Persistence Logic: Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('tender_tracking_ids', JSON.stringify(Array.from(trackingIds)));
  }, [trackingIds]);

  // Simulate initial data fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Filter tenders based on search query
  const filteredTenders = useMemo(() => {
    return MOCK_TENDERS.filter(tender => 
      tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const trackedTenders = useMemo(() => {
    return MOCK_TENDERS.filter(tender => trackingIds.has(tender.id));
  }, [trackingIds]);

  const handleTrack = (id: string) => {
    setTrackingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#003366] flex flex-col items-center justify-center text-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 bg-white/10 rounded-[24px] flex items-center justify-center backdrop-blur-md border border-white/20">
            <Loader2 className="animate-spin text-white" size={40} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight mb-2">台標通 TenderGo</h1>
            <p className="text-white/60 text-xs font-mono uppercase tracking-widest">Initialising Database...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <div className="max-w-md mx-auto min-h-screen shadow-xl bg-white flex flex-col relative overflow-hidden pb-20">
        
        {/* Header Logic */}
        {activeTab === 'search' && (
          <SearchHeader 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            onFilterClick={() => setIsFilterOpen(true)}
            activeFilterCount={0}
          />
        )}

        {activeTab === 'tracking' && (
          <header className="sticky top-0 z-40 bg-[#003366] text-white px-4 py-5 font-bold text-lg flex items-center justify-between shadow-md">
            我的追蹤標案
            <span className="text-xs bg-white text-[#003366] px-3 py-1 rounded-full font-bold">{trackingIds.size}</span>
          </header>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-4 py-4 bg-[#f0f4f8]">
          <AnimatePresence mode="wait">
            {activeTab === 'search' && (
              <motion.div
                key="search-content"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {filteredTenders.length > 0 ? (
                  filteredTenders.map(tender => (
                    <TenderCard 
                      key={tender.id} 
                      tender={tender} 
                      onClick={() => setSelectedTender(tender)}
                      onTrack={() => handleTrack(tender.id)}
                      isTracking={trackingIds.has(tender.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-20 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm">
                      <LayoutGrid size={32} />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">找不到符合條件的標案</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'tracking' && (
              <motion.div
                key="tracking-content"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {trackedTenders.length > 0 ? (
                  trackedTenders.map(tender => (
                    <TenderCard 
                      key={tender.id} 
                      tender={tender} 
                      onClick={() => setSelectedTender(tender)}
                      onTrack={() => handleTrack(tender.id)}
                      isTracking={true}
                    />
                  ))
                ) : (
                  <div className="text-center py-20 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-[#003366]/20 shadow-sm">
                      <ClipboardList size={32} />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">尚未加入任何追蹤標案</p>
                    <button 
                      onClick={() => setActiveTab('search')}
                      className="text-[#003366] font-bold text-sm hover:underline"
                    >
                      去逛逛標案
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {(activeTab === 'profile' || activeTab === 'settings') && (
              <motion.div
                key="profile-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-6 space-y-8 max-w-md mx-auto"
              >
                <div className="text-center bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                  <div className="w-20 h-20 bg-[#f0f4f8] rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4 border-4 border-white shadow-inner">
                    <UserRound size={40} />
                  </div>
                  <h2 className="font-bold text-xl text-[#003366]">訪客使用者</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">工程師 / 標案分析師</p>
                </div>

                <div className="space-y-4">
                  <MenuHeading>系統功能</MenuHeading>
                  <MenuItem icon={Bell} label="推播通知" badge="已關閉" />
                  <MenuItem icon={ClipboardList} label="歷史紀錄" />
                  
                  <MenuHeading>關於 App</MenuHeading>
                  <div className="bg-[#003366] p-5 rounded-[24px] text-white/90 shadow-lg shadow-blue-900/10">
                    <h4 className="text-sm font-bold mb-2">台標通 TenderGo v0.1.0</h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      本版本專注於手機優化的 UI 雛形驗證。資料來源參考 g0v 開源 API。<br/>
                      這是一個「Bento Grid」設計風格的實務工具範例。
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[9px] font-mono opacity-50 uppercase">Open Source Innovation</span>
                      <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-[9px] font-bold">SYSTEM ACTIVE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Navigation */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Detail Panel */}
        <TenderDetail 
          tender={selectedTender} 
          onClose={() => setSelectedTender(null)} 
          onTrack={() => handleTrack(selectedTender?.id || '')}
          isTracking={trackingIds.has(selectedTender?.id || '')}
        />

        {/* Advanced Filter Overlay */}
        <FilterOverlay 
          isOpen={isFilterOpen} 
          onClose={() => setIsFilterOpen(false)}
          onApply={() => {}}
        />

        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ y: -100, opacity: 0, x: '-50%' }}
              animate={{ y: 20, opacity: 1, x: '-50%' }}
              exit={{ y: -100, opacity: 0, x: '-50%' }}
              className="fixed top-0 left-1/2 z-[100] w-[90%] max-w-sm bg-slate-900 border border-white/10 text-white p-4 rounded-2xl shadow-xl flex items-center gap-4 cursor-pointer"
              onClick={() => setNotification(null)}
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                <BellDot size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold leading-tight">{notification}</p>
                <span className="text-[10px] text-white/50 uppercase font-bold mt-1 inline-block">剛才 • 商機提醒</span>
              </div>
              <button className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MenuHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mb-2">{children}</h3>;
}

function MenuItem({ icon: Icon, label, badge, onClick }: { icon: any, label: string, badge?: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm"
    >
      <div className="text-slate-400">
        <Icon size={20} />
      </div>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {badge && <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
  );
}
