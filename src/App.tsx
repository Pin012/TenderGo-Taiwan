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
import { LayoutGrid, ClipboardList, Bell, Loader2, BellDot, X, Newspaper, GraduationCap, Bot, ArrowRight } from 'lucide-react';

const EXPLORE_SECTIONS = [
  { title: '顧問專欄', description: '掌握最新標案策略與顧問實戰解析。', icon: ClipboardList },
  { title: '產業新聞', description: '追蹤公共工程、數位轉型與採購趨勢新聞。', icon: Newspaper },
  { title: '培訓課程', description: '精選採購法、提案撰寫與簡報技巧課程。', icon: GraduationCap },
  { title: 'AI諮詢', description: '用 AI 協助你快速評估標案切入機會。', icon: Bot },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('notification_enabled');
    return saved ? JSON.parse(saved) : true;
  });

  const [notifications, setNotifications] = useState<string[]>(() => {
    const saved = localStorage.getItem('notification_list');
    return saved ? JSON.parse(saved) : [];
  });

  const [showNotificationList, setShowNotificationList] = useState(false);

  useEffect(() => {
    localStorage.setItem('notification_enabled', JSON.stringify(notificationEnabled));
  }, [notificationEnabled]);

  useEffect(() => {
    localStorage.setItem('notification_list', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (!notificationEnabled) return;
    const timer = setTimeout(() => {
      setNotifications((prev) => ['發現 3 個符合您專業領域的新標案！', ...prev]);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notificationEnabled]);

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
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#003366] flex flex-col items-center justify-center text-white">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-white/10 rounded-[24px] flex items-center justify-center backdrop-blur-md border border-white/20">
            <Loader2 className="animate-spin text-white" size={40} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight mb-2">標案通 TenderGo</h1>
            <p className="text-white/60 text-xs font-mono uppercase tracking-widest">Initialising Database...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <div className="max-w-md mx-auto min-h-screen shadow-xl bg-white flex flex-col relative overflow-hidden pb-20">
        {activeTab === 'search' && (
          <SearchHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} onFilterClick={() => setIsFilterOpen(true)} activeFilterCount={0} />
        )}

        {activeTab === 'tracking' && (
          <header className="sticky top-0 z-40 bg-[#003366] text-white px-4 py-5 font-bold text-lg flex items-center justify-between shadow-md">
            <span>我的追蹤標案</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowNotificationList(true)} className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <Bell size={18} />
                {notifications.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] rounded-full bg-orange-500 text-white flex items-center justify-center">{notifications.length > 9 ? '9+' : notifications.length}</span>}
              </button>
              <span className="text-xs bg-white text-[#003366] px-3 py-1 rounded-full font-bold">{trackingIds.size}</span>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto px-4 py-4 bg-[#f0f4f8]">
          <AnimatePresence mode="wait">
            {activeTab === 'search' && (
              <motion.div key="search-content" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}>
                {filteredTenders.length > 0 ? filteredTenders.map(tender => (
                  <TenderCard key={tender.id} tender={tender} onClick={() => setSelectedTender(tender)} onTrack={() => handleTrack(tender.id)} isTracking={trackingIds.has(tender.id)} />
                )) : (
                  <div className="text-center py-20 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm"><LayoutGrid size={32} /></div>
                    <p className="text-slate-400 text-sm font-medium">找不到符合條件的標案</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'tracking' && (
              <motion.div key="tracking-content" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}>
                {trackedTenders.length > 0 ? trackedTenders.map(tender => (
                  <TenderCard key={tender.id} tender={tender} onClick={() => setSelectedTender(tender)} onTrack={() => handleTrack(tender.id)} isTracking={true} />
                )) : (
                  <div className="text-center py-20 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-[#003366]/20 shadow-sm"><ClipboardList size={32} /></div>
                    <p className="text-slate-400 text-sm font-medium">尚未加入任何追蹤標案</p>
                    <button onClick={() => setActiveTab('search')} className="text-[#003366] font-bold text-sm hover:underline">去逛逛標案</button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'explore' && (
              <motion.div key="explore-content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-2 space-y-4">
                {EXPLORE_SECTIONS.map(({ title, description, icon: Icon }) => (
                  <div key={title} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#003366]">{title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{description}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[#003366]/10 text-[#003366] flex items-center justify-center"><Icon size={18} /></div>
                    </div>
                    <button className="mt-3 text-[#003366] text-sm font-semibold inline-flex items-center gap-1">查看內容 <ArrowRight size={14} /></button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div key="settings-content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-6 space-y-8 max-w-md mx-auto">
                <div className="space-y-4">
                  <MenuHeading>系統功能</MenuHeading>
                  <MenuItem icon={Bell} label="推播通知" badge={notificationEnabled ? '已開啟' : '已關閉'} onClick={() => setNotificationEnabled((v) => !v)} />

                  <MenuHeading>關於 App</MenuHeading>
                  <div className="bg-[#003366] p-5 rounded-[24px] text-white/90 shadow-lg shadow-blue-900/10">
                    <h4 className="text-sm font-bold mb-2">標案通 TenderGo v0.1.0</h4>
                    <p className="text-xs text-white/70 leading-relaxed">本版本專注於手機優化的 UI 雛形驗證。資料來源參考 g0v 開源 API。<br/>這是一個「Bento Grid」設計風格的實務工具範例。</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <TenderDetail tender={selectedTender} onClose={() => setSelectedTender(null)} onTrack={() => handleTrack(selectedTender?.id || '')} isTracking={trackingIds.has(selectedTender?.id || '')} />

        <FilterOverlay isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} onApply={() => {}} />

        <AnimatePresence>
          {notificationEnabled && notifications.length > 0 && activeTab !== 'tracking' && (
            <motion.div initial={{ y: -100, opacity: 0, x: '-50%' }} animate={{ y: 20, opacity: 1, x: '-50%' }} exit={{ y: -100, opacity: 0, x: '-50%' }} className="fixed top-0 left-1/2 z-[100] w-[90%] max-w-sm bg-slate-900 border border-white/10 text-white p-4 rounded-2xl shadow-xl flex items-center gap-4 cursor-pointer" onClick={() => setNotifications((prev) => prev.slice(1))}>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center animate-pulse"><BellDot size={20} /></div>
              <div className="flex-1">
                <p className="text-sm font-bold leading-tight">{notifications[0]}</p>
                <span className="text-[10px] text-white/50 uppercase font-bold mt-1 inline-block">剛才 • 商機提醒</span>
              </div>
              <button className="text-white/40 hover:text-white"><X size={18} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showNotificationList && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowNotificationList(false)}>
              <motion.div initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} className="max-w-md mx-auto bg-white rounded-3xl p-5 h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#003366]">通知列表</h3>
                  <button className="text-sm text-slate-500" onClick={() => setNotifications([])}>清空全部</button>
                </div>
                {notifications.length === 0 ? <p className="text-sm text-slate-400 text-center py-16">目前沒有通知</p> : (
                  <div className="space-y-3">
                    {notifications.map((msg, idx) => (
                      <div key={`${msg}-${idx}`} className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-700">{msg}</div>
                    ))}
                  </div>
                )}
              </motion.div>
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
    <button onClick={onClick} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm">
      <div className="text-slate-400"><Icon size={20} /></div>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {badge && <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
  );
}
